import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { COGNITO_CONFIG } from '@/lib/cognito-config';
import { readPkceVerifier, clearPkceVerifier } from '@/lib/pkce-storage';
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
    // Handle "connected" query param (redirect from oauth-callback edge function)
    const connectedProvider = searchParams.get('connected');
    if (connectedProvider) {
      console.log('[AuthCallback] Provider connected:', connectedProvider);
      navigate('/integrations?connected=' + connectedProvider, { replace: true });
      return;
    }

    // Primary: use React Router's searchParams
    let code = searchParams.get('code');
    let stateParam = searchParams.get('state');
    let errorParam = searchParams.get('error');
    let errorDescription = searchParams.get('error_description');

    // Fallback: parse directly from window.location
    if (!code && !errorParam) {
      const raw = new URLSearchParams(window.location.search);
      code = raw.get('code');
      stateParam = raw.get('state');
      errorParam = raw.get('error');
      errorDescription = raw.get('error_description');
    }

    console.log('[AuthCallback] url:', window.location.href);
    console.log('[AuthCallback] code present:', !!code);
    console.log('[AuthCallback] state present:', !!stateParam);

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

    // ── Detect Connect flow vs Cognito login flow ──
    // Connect flows have a state param containing { provider, userId, organizationId }
    // Cognito flows have a state param containing { v: <pkce_verifier> }
    if (stateParam) {
      try {
        const raw = stateParam.startsWith('connect:') ? stateParam.slice(8) : stateParam;
        const parsed = JSON.parse(atob(raw));
        
        // If state contains provider + userId, this is a Connect flow
        // Proxy the request to the oauth-callback edge function
        if (parsed?.provider && parsed?.userId) {
          console.log('[AuthCallback] Detected Connect flow for provider:', parsed.provider);
          const edgeFnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(stateParam)}`;
          window.location.href = edgeFnUrl;
          return;
        }
      } catch (e) {
        console.warn('[AuthCallback] State parse attempt for connect detection:', e);
      }
    }

    // ── Cognito Login Flow: Retrieve PKCE verifier ──
    let codeVerifier: string | null = null;

    if (stateParam) {
      try {
        const parsed = JSON.parse(atob(stateParam));
        codeVerifier = parsed?.v || null;
        console.log('[PKCE] verifier from state param, length:', codeVerifier?.length);
      } catch (e) {
        console.warn('[PKCE] Failed to parse state param:', e);
      }
    }

    if (!codeVerifier) {
      codeVerifier = readPkceVerifier();
      console.log('[PKCE] verifier from storage fallback, length:', codeVerifier?.length);
    }

    if (!codeVerifier) {
      console.error('[AuthCallback] PKCE verifier missing from state, localStorage, and cookie');
      setError('Authentication session expired. Please try signing in again.');
      return;
    }

    console.log('[AuthCallback] PKCE verifier found, proceeding with token exchange');
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
        clearPkceVerifier();
        throw new Error(errMsg);
      }

      // Exchange succeeded — remove the single-use verifier
      clearPkceVerifier();

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
      if (errBody.error === 'account_suspended') {
        setError(`__SUSPENDED__${errBody.message || 'Your account has been suspended. If you have any questions, please reach out to support@wibookly.ai'}`);
        return;
      }
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

  const isSuspended = error?.startsWith('__SUSPENDED__');
  const suspendedMessage = isSuspended ? error.replace('__SUSPENDED__', '') : null;

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/10 via-background to-accent/20 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/50 text-center">
          <img src={wibooklyLogo} alt="Wibookly" className="h-20 w-auto mx-auto mb-6" />
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Suspended</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {suspendedMessage}
          </p>
          <a
            href="mailto:support@wibookly.ai"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
          <button
            onClick={() => navigate('/auth', { replace: true })}
            className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

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
        <img src={wibooklyLogo} alt="Wibookly" className="h-48 w-auto mx-auto mb-8" />
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
}
