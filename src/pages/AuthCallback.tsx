import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { COGNITO_CONFIG } from '@/lib/cognito-config';
import { Loader2 } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';

/**
 * /auth/callback
 *
 * Handles the OAuth redirect from AWS Cognito:
 * 1. Exchange the authorization code for Cognito tokens (PKCE).
 * 2. Call the `cognito-user-bridge` edge function which finds/creates
 *    the corresponding backend user and returns a one-time token.
 * 3. Use the one-time token to establish a backend session.
 * 4. Redirect to /integrations.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      setError(errorDescription || errorParam);
      return;
    }

    if (!code) {
      setError('No authorization code received from the identity provider.');
      return;
    }

    handleCallback(code);
  }, []);

  const handleCallback = async (code: string) => {
    try {
      // ── Step 1: Retrieve the PKCE code verifier ──────────────────────
      const codeVerifier = sessionStorage.getItem('cognito_code_verifier');
      if (!codeVerifier) {
        throw new Error('Missing PKCE code verifier. Please try signing in again.');
      }
      sessionStorage.removeItem('cognito_code_verifier');

      // ── Step 2: Exchange authorization code for Cognito tokens ───────
      // The redirect_uri MUST exactly match the one used during /authorize.
      // Use the current origin so it works across all configured domains
      // (preview, wibookly-dev.lovable.app, app.wibookly.ai).
      const currentRedirectUri = `${window.location.origin}/auth/callback`;

      const tokenResponse = await fetch(COGNITO_CONFIG.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: COGNITO_CONFIG.clientId,
          code,
          redirect_uri: currentRedirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errBody = await tokenResponse.json().catch(() => ({}));
        throw new Error(errBody.error_description || errBody.error || 'Token exchange failed');
      }

      const tokens = await tokenResponse.json();
      const { id_token, access_token, refresh_token } = tokens;

      if (!id_token) {
        throw new Error('No ID token received from identity provider.');
      }

      // Store Cognito tokens for potential future use (e.g. AWS API calls)
      localStorage.setItem(
        'cognito_tokens',
        JSON.stringify({
          access_token,
          id_token,
          refresh_token,
          obtained_at: Date.now(),
        })
      );

      // ── Step 3: Bridge to backend session ────────────────────────────
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

      // ── Step 4: Establish backend session ────────────────────────────
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: bridgeData.token_hash,
        type: 'magiclink',
      });

      if (verifyError) {
        throw new Error(`Session verification failed: ${verifyError.message}`);
      }

      // ── Step 5: Redirect to app ──────────────────────────────────────
      navigate('/integrations', { replace: true });
    } catch (err) {
      console.error('Auth callback error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

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
