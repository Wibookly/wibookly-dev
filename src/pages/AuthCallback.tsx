import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { COGNITO_CONFIG } from '@/lib/cognito-config';
import { readPkceVerifier, clearPkceVerifier } from '@/lib/pkce-storage';
import { storeTokens, type CognitoTokens } from '@/lib/aws-api';
import wibooklyLogo from '@/assets/wibookly-logo.png';

const COGNITO_ISSUER_PREFIX = `https://cognito-idp.${COGNITO_CONFIG.region}.amazonaws.com/${COGNITO_CONFIG.userPoolId}`;

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
  const { bootstrapSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle "connected" query param (redirect from oauth-callback edge function)
    const connectedProvider = searchParams.get('connected');
    if (connectedProvider) {
      navigate('/integrations?connected=' + connectedProvider, { replace: true });
      return;
    }

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

    if (errorParam) {
      setError(errorDescription || errorParam);
      return;
    }

    if (!code) {
      setError('No authorization code received from the identity provider.');
      return;
    }

    // Detect Connect flow vs Cognito login flow
    if (stateParam) {
      try {
        const raw = stateParam.startsWith('connect:') ? stateParam.slice(8) : stateParam;
        const parsed = JSON.parse(atob(raw));
        if (parsed?.provider && parsed?.userId) {
          // This is a mailbox connect flow — proxy to backend
          const backendUrl = `https://f4rjhkx0cg.execute-api.us-west-2.amazonaws.com/oauth-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(stateParam)}`;
          window.location.href = backendUrl;
          return;
        }
      } catch {
        // Not a connect flow, continue with Cognito login
      }
    }

    // Retrieve PKCE verifier
    let codeVerifier: string | null = null;

    if (stateParam) {
      try {
        const parsed = JSON.parse(atob(stateParam));
        codeVerifier = parsed?.v || null;
      } catch {
        // ignore
      }
    }

    if (!codeVerifier) {
      codeVerifier = readPkceVerifier();
    }

    if (!codeVerifier) {
      setError('Authentication session expired. Please try signing in again.');
      return;
    }

    handleTokenExchange(code, codeVerifier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTokenExchange = async (code: string, codeVerifier: string) => {
    try {
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
        clearPkceVerifier();
        throw new Error(errBody.error_description || errBody.error || 'Token exchange failed');
      }

      clearPkceVerifier();

      const rawTokens = await tokenResponse.json();

      // Validate id_token
      const idToken = rawTokens.id_token?.trim();
      if (!idToken || idToken.split('.').length !== 3) {
        throw new Error('Invalid ID token received from Cognito.');
      }

      const payload = decodeJwtPayload(idToken);
      const issuer = (payload?.iss as string) || '';
      if (!issuer.startsWith(COGNITO_ISSUER_PREFIX)) {
        throw new Error(`Unexpected token issuer: ${issuer}`);
      }

      // Store tokens (access_token is used for API Gateway calls)
      const cognitoTokens: CognitoTokens = {
        access_token: rawTokens.access_token,
        id_token: idToken,
        refresh_token: rawTokens.refresh_token,
        obtained_at: Date.now(),
      };

      storeTokens(cognitoTokens);

      // Bootstrap the auth context with new tokens
      await bootstrapSession(cognitoTokens);

      navigate('/integrations', { replace: true });
    } catch (err) {
      console.error('[AuthCallback] Error:', err);
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
