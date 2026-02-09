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
  signUp: (email: string, password: string, organizationName: string, fullName: string, title?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithCognito: (provider?: 'google' | 'microsoft') => Promise<void>;
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
    // Listen for backend session changes (created by the Cognito bridge)
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

    // Check for existing session on mount
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
   * Redirect to AWS Cognito hosted UI for authentication.
   * Optionally specify a provider to skip the Cognito provider-selection screen.
   */
  const signInWithCognito = async (provider?: 'google' | 'microsoft') => {
    console.log('[Auth] Flow: Cognito login/signup (NOT Connect Gmail)');
    console.log('[Auth] Provider:', provider || 'none (hosted UI)');
    console.log('[Auth] redirect_uri:', COGNITO_CONFIG.redirectUri);

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store PKCE verifier for the callback — AuthCallback reads this to
    // complete the Cognito token exchange (code_challenge was sent with S256).
    sessionStorage.setItem('cognito_code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: COGNITO_CONFIG.clientId,
      response_type: 'code',
      scope: COGNITO_CONFIG.scopes,
      redirect_uri: COGNITO_CONFIG.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    if (provider) {
      const idpName = provider === 'google'
        ? COGNITO_CONFIG.identityProviders.google
        : COGNITO_CONFIG.identityProviders.microsoft;
      params.set('identity_provider', idpName);
    }

    const authorizeUrl = `${COGNITO_CONFIG.authorizeEndpoint}?${params.toString()}`;
    console.log('[Auth] Redirecting to Cognito:', authorizeUrl.substring(0, 120) + '…');
    window.location.href = authorizeUrl;
  };

  // Legacy sign-up – redirects to Cognito (account creation happens there)
  const signUp = async (_email: string, _password: string, _orgName: string, _fullName: string, _title?: string) => {
    await signInWithCognito();
    return { error: null };
  };

  // Legacy sign-in – redirects to Cognito
  const signIn = async (_email: string, _password: string) => {
    await signInWithCognito();
    return { error: null };
  };

  const signOut = async () => {
    try {
      // Clear Cognito tokens
      localStorage.removeItem('cognito_tokens');
      sessionStorage.removeItem('cognito_code_verifier');

      // Clear backend session
      await supabase.auth.signOut();

      setProfile(null);
      setOrganization(null);
      setUser(null);
      setSession(null);

      // Redirect to Cognito logout endpoint (clears SSO session)
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
      signUp, signIn, signOut, signInWithCognito, setSelectedOrganization
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
