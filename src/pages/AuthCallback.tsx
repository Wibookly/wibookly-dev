import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { COGNITO_CONFIG } from '@/lib/cognito-config';
import { Loader2 } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';

/**
 * /auth/callback
 *
 * Handles TWO completely separate OAuth flows at the same URL:
 *
 * 1. **Cognito Login/Signup** — detected by id_token issuer after exchange.
 * 2. **Connect Gmail/Outlook** — detected when id_token issuer is NOT Cognito.
 *
 * Flow detection is based on the token issuer claim, NOT on PKCE or state params.
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
  const [statusMessage, setStatusMessage] = useState('Completing sign-in…');

  useEffect(() => {
    // Primary: use React Router's searchParams
    let code = searchParams.get('code');
    let errorParam = searchParams.get('error');
    let errorDescription = searchParams.get('error_description');
    let stateParam = searchParams.get('state');

    // Fallback: parse directly from window.location in case React Router
    // hasn't captured the query string (e.g. after a full-page redirect).
    if (!code && !errorParam) {
      const raw = new URLSearchParams(window.location.search);
      code = raw.get('code');
      errorParam = raw.get('error');
      errorDescription = raw.get('error_description');
      stateParam = raw.get('state');
    }

    console.log('[AuthCallback] url:', window.location.href);
    console.log('[AuthCallback] code present:', !!code, '| state present:', !!stateParam);

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

    // ── Always attempt Cognito token exchange first ──────────────────
    // Flow detection happens AFTER the exchange, based on id_token issuer.
    console.log('[AuthCallback] Attempting Cognito token exchange to detect flow…');
    handleTokenExchange(code, stateParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 1: Exchange code with Cognito ─────────────────────────────

  const handleTokenExchange = async (code: string, stateParam: string | null) => {
    try {
      // Try to get PKCE verifier if present (Cognito may or may not use it)
      const codeVerifier = sessionStorage.getItem('cognito_code_verifier');
      if (codeVerifier) {
        sessionStorage.removeItem('cognito_code_verifier');
      }

      console.log('[AuthCallback] Exchanging code at:', COGNITO_CONFIG.tokenEndpoint);
      console.log('[AuthCallback] redirect_uri:', COGNITO_CONFIG.redirectUri);
      console.log('[AuthCallback] PKCE verifier present:', !!codeVerifier);

      const bodyParams: Record<string, string> = {
        grant_type: 'authorization_code',
        client_id: COGNITO_CONFIG.clientId,
        code,
        redirect_uri: COGNITO_CONFIG.redirectUri,
      };

      // Only include code_verifier if we have one
      if (codeVerifier) {
        bodyParams.code_verifier = codeVerifier;
      }

      const tokenResponse = await fetch(COGNITO_CONFIG.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(bodyParams),
      });

      if (!tokenResponse.ok) {
        const errBody = await tokenResponse.json().catch(() => ({}));
        const errMsg = errBody.error_description || errBody.error || 'Token exchange failed';
        console.warn('[AuthCallback] Cognito token exchange failed:', errMsg);

        // If Cognito exchange fails AND we have a state param, this is likely
        // a Connect Gmail/Outlook flow — the code was issued by Google/Microsoft,
        // not Cognito.
        if (stateParam) {
          console.log('[AuthCallback] Falling back to Connect flow (state param present)');
          setStatusMessage('Connecting your mailbox…');
          await handleConnectCallback(code, stateParam);
          return;
        }

        // No state param either → genuine failure
        throw new Error(errMsg);
      }

      const tokens = await tokenResponse.json();
      console.log('[AuthCallback] Token response keys:', Object.keys(tokens));

      // ── Step 2: Inspect id_token issuer to determine flow ─────────
      const rawIdToken = tokens.id_token;
      if (!rawIdToken || typeof rawIdToken !== 'string') {
        // No id_token from exchange — if state present, try Connect flow
        if (stateParam) {
          console.log('[AuthCallback] No id_token in response, falling back to Connect flow');
          setStatusMessage('Connecting your mailbox…');
          await handleConnectCallback(code, stateParam);
          return;
        }
        throw new Error('No valid ID token received from identity provider.');
      }

      const id_token = rawIdToken.trim();
      if (id_token.split('.').length !== 3) {
        throw new Error('Received an invalid token format. Expected a JWT.');
      }

      const payload = decodeJwtPayload(id_token);
      const issuer = (payload?.iss as string) || '';

      console.log('[AuthCallback] id_token issuer:', issuer);
      console.log('[AuthCallback] Expected Cognito issuer prefix:', COGNITO_ISSUER_PREFIX);

      if (issuer.startsWith(COGNITO_ISSUER_PREFIX)) {
        // ── Flow: Cognito Login/Signup ──────────────────────────────
        console.log('[AuthCallback] Flow detected: Cognito login/signup (issuer match)');
        console.log('[AuthCallback] Payload type: id_token (Cognito)');
        setStatusMessage('Completing sign-in…');
        await handleCognitoSession(id_token, tokens);
      } else {
        // ── Flow: Connect Gmail/Outlook ─────────────────────────────
        // Token exchange succeeded at Cognito but issuer doesn't match.
        // This shouldn't normally happen, but handle gracefully.
        console.log('[AuthCallback] Flow detected: Non-Cognito issuer, treating as Connect flow');
        if (stateParam) {
          setStatusMessage('Connecting your mailbox…');
          await handleConnectCallback(code, stateParam);
        } else {
          throw new Error(
            `Unexpected token issuer: ${issuer}. ` +
            'Unable to determine authentication flow.'
          );
        }
      }
    } catch (err) {
      console.error('[AuthCallback] Error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  // ── Flow 1: Cognito Login/Signup (after issuer confirmed) ──────────

  const handleCognitoSession = async (
    id_token: string,
    tokens: { access_token?: string; refresh_token?: string }
  ) => {
    console.log('[AuthCallback:Cognito] id_token validated, length:', id_token.length);

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

    console.log('[AuthCallback:Cognito] Session established, redirecting to /integrations');
    navigate('/integrations', { replace: true });
  };

  // ── Flow 2: Connect Gmail/Outlook ─────────────────────────────────

  const handleConnectCallback = async (code: string, state: string) => {
    try {
      console.log('[AuthCallback:Connect] Forwarding code to oauth-exchange');
      console.log('[AuthCallback:Connect] redirect_uri: https://app.wibookly.ai/auth/callback');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-exchange`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        }
      );

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to complete mailbox connection');
      }

      const data = await response.json();
      console.log('[AuthCallback:Connect] Exchange successful:', data.provider, data.connectedEmail);

      const redirectUrl = data.redirectUrl || '/integrations';
      const connectedParam = data.provider ? `?connected=${data.provider}` : '';

      navigate(`${redirectUrl}${connectedParam}`, { replace: true });
    } catch (err) {
      console.error('[AuthCallback:Connect] Error:', err);
      const message = err instanceof Error ? err.message : 'Connection failed';
      navigate(`/integrations?error=${encodeURIComponent(message)}`, { replace: true });
    }
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
        <p className="text-muted-foreground">{statusMessage}</p>
      </div>
    </div>
  );
}
