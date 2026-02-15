import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { COGNITO_CONFIG } from './cognito-config';
import { generateCodeVerifier, generateCodeChallenge } from './pkce';
import { savePkceVerifier, clearPkceVerifier } from './pkce-storage';
import { getStoredTokens, clearTokens, api, type CognitoTokens } from './aws-api';

interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  title: string | null;
}

interface Organization {
  id: string;
  name: string;
}

interface AuthContextType {
  user: CognitoUser | null;
  tokens: CognitoTokens | null;
  profile: UserProfile | null;
  organization: Organization | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithCognito: (provider?: 'google' | 'microsoft') => Promise<void>;
  signOut: () => Promise<void>;
  setSelectedOrganization: (orgId: string) => void;
  /** Call after token exchange to bootstrap the session */
  bootstrapSession: (tokens: CognitoTokens) => Promise<void>;
}

/** Minimal user object decoded from the Cognito id_token */
export interface CognitoUser {
  /** Cognito subject (unique user ID) */
  sub: string;
  /** Alias for sub — used everywhere the old Supabase user.id was used */
  id: string;
  email: string;
  name?: string;
}

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

function userFromIdToken(idToken: string): CognitoUser | null {
  const payload = decodeJwtPayload(idToken);
  if (!payload) return null;
  const sub = payload.sub as string;
  return {
    sub,
    id: sub,
    email: (payload.email as string) || '',
    name: (payload.name as string) || (payload['cognito:username'] as string) || undefined,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [tokens, setTokens] = useState<CognitoTokens | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!tokens?.access_token;

  // On mount, check for existing tokens in localStorage
  useEffect(() => {
    const stored = getStoredTokens();
    if (stored?.access_token && stored?.id_token) {
      const cognitoUser = userFromIdToken(stored.id_token);
      setTokens(stored);
      setUser(cognitoUser);
      fetchUserData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      const profileData = await api<UserProfile>('/users/me');
      if (profileData) {
        setProfile(profileData);

        const orgData = await api<Organization>(`/organizations/${profileData.organization_id}`);
        if (orgData) {
          setOrganization(orgData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  /**
   * Called by AuthCallback after a successful token exchange.
   * Stores tokens, derives user, fetches profile, then done.
   */
  const bootstrapSession = async (newTokens: CognitoTokens) => {
    setTokens(newTokens);
    const cognitoUser = userFromIdToken(newTokens.id_token);
    setUser(cognitoUser);

    try {
      await fetchUserData();
    } catch (err) {
      console.error('[Auth] bootstrapSession fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Redirect to AWS Cognito Hosted UI for authentication.
   * Uses PKCE flow — no client secret needed.
   */
  const signInWithCognito = async (provider?: 'google' | 'microsoft') => {
    console.log(`[Auth] Flow: Cognito login/signup via ${provider || 'default'}`);

    const codeVerifier = generateCodeVerifier();
    savePkceVerifier(codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Encode verifier in state so it survives cross-origin redirects
    const statePayload = btoa(JSON.stringify({ v: codeVerifier }));

    const params = new URLSearchParams({
      client_id: COGNITO_CONFIG.clientId,
      response_type: 'code',
      scope: COGNITO_CONFIG.scopes,
      redirect_uri: COGNITO_CONFIG.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: statePayload,
    });

    if (provider === 'microsoft') {
      params.set('identity_provider', COGNITO_CONFIG.identityProviders.microsoft);
    } else if (provider) {
      params.set('identity_provider', COGNITO_CONFIG.identityProviders.google);
    }

    window.location.href = `${COGNITO_CONFIG.authorizeEndpoint}?${params.toString()}`;
  };

  const signOut = async () => {
    clearTokens();
    clearPkceVerifier();

    setProfile(null);
    setOrganization(null);
    setUser(null);
    setTokens(null);

    const logoutParams = new URLSearchParams({
      client_id: COGNITO_CONFIG.clientId,
      logout_uri: COGNITO_CONFIG.logoutUri,
    });
    window.location.href = `${COGNITO_CONFIG.logoutEndpoint}?${logoutParams.toString()}`;
  };

  const setSelectedOrganization = async (orgId: string) => {
    try {
      const orgData = await api<Organization>(`/organizations/${orgId}`);
      if (orgData) {
        setOrganization(orgData);
      }
    } catch (error) {
      console.error('Error setting organization:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, tokens, profile, organization, loading, isAuthenticated,
      signInWithCognito, signOut, setSelectedOrganization, bootstrapSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
