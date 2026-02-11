import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useSubscription } from '@/lib/subscription';

// Check if user has super_admin or admin role
async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['super_admin', 'admin']);
  return (data?.length || 0) > 0;
}

export interface OnboardingStepDef {
  id: string;
  number: number;
  title: string;
  description: string;
  /** The route the user must be on to complete this step */
  route: string;
  isComplete: boolean;
}

interface OnboardingContextType {
  /** All required steps in order */
  steps: OnboardingStepDef[];
  /** The current active (first incomplete) step, or null if all done */
  currentStep: OnboardingStepDef | null;
  /** Index of current step (0-based) */
  currentStepIndex: number;
  /** Total required steps */
  totalSteps: number;
  /** Whether onboarding is fully complete */
  isOnboardingComplete: boolean;
  /** Whether data is still loading */
  loading: boolean;
  /** Re-fetch progress from DB */
  refreshProgress: () => Promise<void>;
  /** Check if a given route is the active onboarding route */
  isActiveRoute: (route: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const STEP_DEFINITIONS: Omit<OnboardingStepDef, 'isComplete'>[] = [
  { id: 'account', number: 1, title: 'Create Account', description: 'Your account is ready', route: '/integrations' },
  { id: 'subscribe', number: 2, title: 'Choose a Plan', description: 'Subscribe to unlock features', route: '/integrations' },
  { id: 'email', number: 3, title: 'Connect Email', description: 'Link Google or Outlook', route: '/integrations' },
  { id: 'calendars', number: 4, title: 'Connect Calendars', description: 'Link your calendars', route: '/integrations' },
  { id: 'categories', number: 5, title: 'Setup Email Folders', description: 'Organize your inbox', route: '/categories' },
  { id: 'signature', number: 6, title: 'Update Profile & Signature', description: 'Set up your email signature', route: '/settings' },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, organization, profile } = useAuth();
  const { status, isFreeOverride } = useSubscription();
  const hasActiveSub = status === 'active' || status === 'trialing';
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [steps, setSteps] = useState<OnboardingStepDef[]>(
    STEP_DEFINITIONS.map(s => ({ ...s, isComplete: s.id === 'account' }))
  );
  const [loading, setLoading] = useState(true);

  // Check admin role
  useEffect(() => {
    if (!user?.id) { setIsAdmin(false); return; }
    checkIsAdmin(user.id).then(setIsAdmin);
  }, [user?.id]);

  const fetchProgress = useCallback(async () => {
    if (!organization?.id) return;

    try {
      const { data: connections } = await supabase
        .from('provider_connections')
        .select('is_connected, provider, calendar_connected')
        .eq('organization_id', organization.id);

      const hasEmailConnected = connections?.some(c => c.is_connected) || false;
      const hasCalendarConnected = connections?.some(c => c.calendar_connected) || false;

      const { count: categoriesCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('is_enabled', true);

      const { data: emailProfile } = await supabase
        .from('email_profiles')
        .select('email_signature, signature_enabled')
        .eq('organization_id', organization.id)
        .limit(1)
        .single();

      setSteps(STEP_DEFINITIONS.map(s => {
        let isComplete = false;
        if (s.id === 'account') isComplete = true;
        if (s.id === 'subscribe') isComplete = hasActiveSub || isFreeOverride;
        if (s.id === 'email') isComplete = hasEmailConnected;
        if (s.id === 'calendars') isComplete = hasCalendarConnected;
        if (s.id === 'categories') isComplete = (categoriesCount || 0) > 0;
        if (s.id === 'signature') isComplete = !!emailProfile?.signature_enabled;
        return { ...s, isComplete };
      }));
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  }, [organization?.id, hasActiveSub, isFreeOverride]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const currentStep = isAdmin ? null : (steps.find(s => !s.isComplete) || null);
  const currentStepIndex = currentStep ? steps.findIndex(s => s.id === currentStep.id) : steps.length;
  const isOnboardingComplete = isAdmin || !currentStep;

  const isActiveRoute = (route: string) => {
    if (isOnboardingComplete) return true;
    if (!currentStep) return true;
    // Match by base path (ignore query params)
    const baseRoute = route.split('?')[0];
    const stepBaseRoute = currentStep.route.split('?')[0];
    return baseRoute === stepBaseRoute;
  };

  return (
    <OnboardingContext.Provider value={{
      steps,
      currentStep,
      currentStepIndex,
      totalSteps: steps.length,
      isOnboardingComplete,
      loading,
      refreshProgress: fetchProgress,
      isActiveRoute,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}
