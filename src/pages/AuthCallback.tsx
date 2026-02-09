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
 * 1. **Cognito Login/Signup** — detected by PKCE code_verifier in sessionStorage.
 *    Exchanges the code with Cognito's /oauth2/token, bridges to backend session.
 *
 * 2. **Connect Gmail/Outlook** — detected by `state` parameter (from oauth-init).
 *    Forwards code + state to the oauth-exchange edge function.
 *
 * These flows NEVER share tokens, logic, or code paths.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Completing sign-in…');

  useEffect(() => {
    // Primary: use React Router's searchParams
    let code = searchParams.get('code');
    let stateParam = searchParams.get('state');
    let errorParam = searchParams.get('error');
    let errorDescription = searchParams.get('error_description');

    // Fallback: parse directly from window.location in case React Router
    // hasn't captured the query string (e.g. after a full-page redirect).
    if (!code && !errorParam) {
      const raw = new URLSearchParams(window.location.search);
      code = raw.get('code');
      stateParam = raw.get('state');
      errorParam = raw.get('error');
      errorDescription = raw.get('error_description');
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

    // ── Flow Detection ────────────────────────────────────────────
    const codeVerifier = sessionStorage.getItem('cognito_code_verifier');

    if (stateParam && !codeVerifier) {
      // STATE present + no PKCE verifier = Connect Gmail/Outlook flow
      console.log('[AuthCallback] Flow detected: Connect Gmail/Outlook');
      console.log('[AuthCallback] Payload type: code (authorization_code)');
      setStatusMessage('Connecting your mailbox…');
      handleConnectCallback(code, stateParam);
    } else if (codeVerifier) {
      // PKCE verifier present = Cognito login/signup flow
      console.log('[AuthCallback] Flow detected: Cognito login/signup');
      console.log('[AuthCallback] Payload type: code (authorization_code)');
      console.log('[AuthCallback] redirect_uri:', COGNITO_CONFIG.redirectUri);
      handleCognitoCallback(code);
    } else {
      console.error('[AuthCallback] Cannot determine flow: no state, no PKCE verifier');
      setError(
        'Unable to determine authentication flow. ' +
        'Please try again from the sign-in page or dashboard.'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Flow 1: Cognito Login/Signup ──────────────────────────────────

  const handleCognitoCallback = async (code: string) => {
    try {
      const codeVerifier = sessionStorage.getItem('cognito_code_verifier');
      if (!codeVerifier) {
        throw new Error('PKCE code verifier missing. Please try signing in again.');
      }
      sessionStorage.removeItem('cognito_code_verifier');

      console.log('[AuthCallback:Cognito] Exchanging code at:', COGNITO_CONFIG.tokenEndpoint);
      console.log('[AuthCallback:Cognito] redirect_uri:', COGNITO_CONFIG.redirectUri);

      // Step 1: Exchange authorization code for Cognito tokens
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
        throw new Error(errBody.error_description || errBody.error || 'Token exchange failed');
      }

      const tokens = await tokenResponse.json();
      console.log('[AuthCallback:Cognito] Token response keys:', Object.keys(tokens));

      // Step 2: Validate id_token
      const rawIdToken = tokens.id_token;
      if (!rawIdToken || typeof rawIdToken !== 'string') {
        console.error('[AuthCallback:Cognito] id_token missing. Type:', typeof rawIdToken);
        throw new Error('No valid ID token received from identity provider.');
      }

      const id_token = rawIdToken.trim();
      if (id_token.split('.').length !== 3) {
        console.error('[AuthCallback:Cognito] id_token not a valid JWT (segments)');
        throw new Error('Received an invalid token format. Expected a JWT.');
      }

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

      // Step 3: Bridge to backend session
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

      // Step 4: Establish backend session
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: bridgeData.token_hash,
        type: 'magiclink',
      });

      if (verifyError) {
        throw new Error(`Session verification failed: ${verifyError.message}`);
      }

      console.log('[AuthCallback:Cognito] Session established, redirecting to /integrations');
      navigate('/integrations', { replace: true });
    } catch (err) {
      console.error('[AuthCallback:Cognito] Error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  // ── Flow 2: Connect Gmail/Outlook ─────────────────────────────────

  const handleConnectCallback = async (code: string, state: string) => {
    try {
      console.log('[AuthCallback:Connect] Forwarding code to oauth-exchange');
      console.log('[AuthCallback:Connect] redirect_uri used by oauth-init: https://app.wibookly.ai/auth/callback');

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
      // Redirect to integrations with error so the user sees the toast
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
