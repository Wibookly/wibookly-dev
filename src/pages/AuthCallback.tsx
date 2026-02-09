import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { COGNITO_CONFIG } from '@/lib/cognito-config';
import { Loader2 } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';

/**
 * /auth/callback
 *
 * Handles Cognito Login/Signup ONLY.
 *
 * Flow:
 *   1. Read `code` from URL
 *   2. Read PKCE verifier from sessionStorage ("cognito_code_verifier")
 *   3. HARD FAIL if verifier is missing
 *   4. Exchange code with Cognito token endpoint including code_verifier
 *   5. Validate id_token issuer
 *   6. Bridge session to backend
 *   7. Remove verifier after exchange
 */

const COGNITO_ISSUER_PREFIX = `https://cognito-idp.${COGNITO_CONFIG.region}.amazonaws.com/${COGNITO_CONFIG.userPoolId}`;

/** Decode the payload of a JWT without verification (for issuer inspection only). */
function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Primary: use React Router's searchParams
    let code = searchParams.get('code');
    let errorParam = searchParams.get('error');
    let errorDescription = searchParams.get('error_description');

    // Fallback: parse directly from window.location in case React Router
    // hasn't captured the query string (e.g. after a full-page redirect).
    if (!code && !errorParam) {
      const raw = new URLSearchParams(window.location.search);
      code = raw.get('code');
      errorParam = raw.get('error');
      errorDescription = raw.get('error_description');
    }

    console.log('[AuthCallback] url:', window.location.href);
    console.log('[AuthCallback] code present:', !!code);

    if (errorParam) {
      console.error('[AuthCallback] OAuth error:', errorParam, errorDescription);
      setError(errorDescription || errorParam);
      return;
    }

    if (!code) {
      console.error('[AuthCallback] No authorization code in URL');
      setError('No authorization code received from the identity provider.');
      return;
    }

    // ── PKCE verifier is REQUIRED — hard fail if missing ──
    const codeVerifier = localStorage.getItem('cognito_code_verifier');

    console.log('[PKCE] callback url:', window.location.href);
    console.log('[PKCE] code present:', Boolean(code));
    console.log('[PKCE] verifier present:', Boolean(codeVerifier));
    console.log('[PKCE] verifier length:', codeVerifier?.length);

    if (!codeVerifier) {
      console.error('[AuthCallback] PKCE verifier missing from localStorage');
      setError(
        'PKCE verifier missing. This means the browser localStorage value was not saved or was cleared before redirect. Please try signing in again.'
      );
      return;
    }

    console.log('[AuthCallback] PKCE verifier found, proceeding with Cognito token exchange');
    handleCognitoTokenExchange(code, codeVerifier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cognito Token Exchange ────────────────────────────────────────

  const handleCognitoTokenExchange = async (code: string, codeVerifier: string) => {
    try {
      console.log('[AuthCallback] Exchanging code at:', COGNITO_CONFIG.tokenEndpoint);
      console.log('[AuthCallback] redirect_uri:', COGNITO_CONFIG.redirectUri);
      console.log('[AuthCallback] PKCE verifier length:', codeVerifier.length);

      const tokenResponse = await fetch(COGNITO_CONFIG.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: COGNITO_CONFIG.clientId,
          code,
          redirect_uri: COGNITO_CONFIG.redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errBody = await tokenResponse.json().catch(() => ({}));
        const errMsg = errBody.error_description || errBody.error || 'Token exchange failed';
        console.error('[AuthCallback] Token exchange failed:', errMsg);
        sessionStorage.removeItem('cognito_code_verifier');
        throw new Error(errMsg);
      }

      // Exchange succeeded — remove the single-use verifier
      sessionStorage.removeItem('cognito_code_verifier');

      const tokens = await tokenResponse.json();
      console.log('[AuthCallback] Token response keys:', Object.keys(tokens));

      // Validate id_token presence and format
      const rawIdToken = tokens.id_token;
      if (!rawIdToken || typeof rawIdToken !== 'string') {
        throw new Error('No valid ID token received from Cognito.');
      }

      const id_token = rawIdToken.trim();
      if (id_token.split('.').length !== 3) {
        throw new Error('Received an invalid token format. Expected a JWT.');
      }

      // Inspect issuer to confirm this is a Cognito token
      const payload = decodeJwtPayload(id_token);
      const issuer = (payload?.iss as string) || '';
      console.log('[AuthCallback] id_token issuer:', issuer);

      if (!issuer.startsWith(COGNITO_ISSUER_PREFIX)) {
        throw new Error(
          `Unexpected token issuer: ${issuer}. Expected Cognito issuer.`
        );
      }

      // Bridge Cognito session to backend
      await handleCognitoSession(id_token, tokens);
    } catch (err) {
      console.error('[AuthCallback] Error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  // ── Cognito Session Bridge ────────────────────────────────────────

  const handleCognitoSession = async (
    id_token: string,
    tokens: { access_token?: string; refresh_token?: string }
  ) => {
    console.log('[AuthCallback] id_token validated, length:', id_token.length);

    // Store Cognito tokens
    localStorage.setItem(
      'cognito_tokens',
      JSON.stringify({
        access_token: tokens.access_token,
        id_token,
        refresh_token: tokens.refresh_token,
        obtained_at: Date.now(),
      })
    );

    // Bridge to backend session
    const bridgeResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cognito-user-bridge`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token }),
      }
    );

    if (!bridgeResponse.ok) {
      const errBody = await bridgeResponse.json().catch(() => ({}));
      throw new Error(errBody.error || 'Failed to bridge authentication');
    }

    const bridgeData = await bridgeResponse.json();
    if (!bridgeData.token_hash) {
      throw new Error('No session token received from bridge');
    }

    // Establish backend session
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: bridgeData.token_hash,
      type: 'magiclink',
    });

    if (verifyError) {
      throw new Error(`Session verification failed: ${verifyError.message}`);
    }

    console.log('[AuthCallback] Session established, redirecting to /integrations');
    navigate('/integrations', { replace: true });
  };

  // ── Render ────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/25 via-background to-accent/20 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/50 text-center">
          <img src={wibooklyLogo} alt="Wibookly" className="h-24 w-auto mx-auto mb-6" />
          <h1 className="text-xl font-bold text-destructive mb-2">Authentication Failed</h1>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/auth', { replace: true })}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/25 via-background to-accent/20 flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <img src={wibooklyLogo} alt="Wibookly" className="h-24 w-auto mx-auto mb-6" />
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
}
