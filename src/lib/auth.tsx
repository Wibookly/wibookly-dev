import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { COGNITO_CONFIG } from './cognito-config';
import { generateCodeVerifier, generateCodeChallenge } from './pkce';

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
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organization: Organization | null;
  loading: boolean;
  signInWithCognito: (provider?: 'google' | 'microsoft') => Promise<void>;
  signOut: () => Promise<void>;
  setSelectedOrganization: (orgId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setOrganization(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data: profileRows } = await supabase.rpc('get_my_profile');
      const profileData = profileRows?.[0];

      if (profileData) {
        setProfile({
          id: profileData.id,
          user_id: profileData.user_id,
          organization_id: profileData.organization_id,
          email: profileData.email,
          full_name: profileData.full_name,
          title: profileData.title ?? null
        });

        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .maybeSingle();

        if (orgData) {
          setOrganization(orgData as Organization);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Redirect to AWS Cognito Hosted UI for Google authentication.
   *
   * PKCE lifecycle:
   *   1. Generate code_verifier (random 43-char string)
   *   2. Generate code_challenge (SHA-256 → base64url)
   *   3. Store verifier in sessionStorage as "cognito_code_verifier"
   *   4. Redirect to Cognito with code_challenge + S256
   *   5. AuthCallback reads verifier, passes it in token exchange, then removes it
   */
  const signInWithCognito = async (provider?: 'google' | 'microsoft') => {
    console.log(`[Auth] Flow: Cognito login/signup via ${provider || 'default'}`);
    console.log('[Auth] redirect_uri:', COGNITO_CONFIG.redirectUri);

    // 1. Generate PKCE verifier (sync)
    const codeVerifier = generateCodeVerifier();

    // 2. Store verifier IMMEDIATELY — using localStorage (survives external redirects)
    localStorage.setItem('cognito_code_verifier', codeVerifier);
    console.log('[PKCE] generated verifier length:', codeVerifier.length);
    console.log('[PKCE] localStorage set:', localStorage.getItem('cognito_code_verifier')?.length);

    // 3. Derive challenge (async)
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      client_id: COGNITO_CONFIG.clientId,
      response_type: 'code',
      scope: COGNITO_CONFIG.scopes,
      redirect_uri: COGNITO_CONFIG.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    if (provider === 'microsoft') {
      params.set('identity_provider', COGNITO_CONFIG.identityProviders.microsoft);
    } else if (provider) {
      params.set('identity_provider', COGNITO_CONFIG.identityProviders.google);
    }

    const authorizeUrl = `${COGNITO_CONFIG.authorizeEndpoint}?${params.toString()}`;
    console.log('[Auth] Redirecting to Cognito:', authorizeUrl.substring(0, 120) + '…');
    window.location.href = authorizeUrl;
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('cognito_tokens');
      localStorage.removeItem('cognito_code_verifier');

      await supabase.auth.signOut();

      setProfile(null);
      setOrganization(null);
      setUser(null);
      setSession(null);

      const logoutParams = new URLSearchParams({
        client_id: COGNITO_CONFIG.clientId,
        logout_uri: COGNITO_CONFIG.logoutUri,
      });
      window.location.href = `${COGNITO_CONFIG.logoutEndpoint}?${logoutParams.toString()}`;
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/auth';
    }
  };

  const setSelectedOrganization = async (orgId: string) => {
    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .maybeSingle();

      if (orgData) {
        setOrganization(orgData as Organization);
      }
    } catch (error) {
      console.error('Error setting organization:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, organization, loading,
      signInWithCognito, signOut, setSelectedOrganization
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
