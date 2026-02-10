import { ReactNode } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface OnboardingGateProps {
  children: ReactNode;
  /** The route this section belongs to — used to check if it's the active onboarding section */
  sectionRoute: string;
  /** Optional: specific step ID this section maps to */
  stepId?: string;
}

/**
 * Wraps a page section. If onboarding is active and this section's route
 * does NOT match the current onboarding step, it renders grayed out with
 * a lock overlay.
 */
export function OnboardingGate({ children, sectionRoute, stepId }: OnboardingGateProps) {
  const { isOnboardingComplete, currentStep, isActiveRoute } = useOnboarding();
  const navigate = useNavigate();

  // If onboarding is done, always show content
  if (isOnboardingComplete) return <>{children}</>;

  // Check if this section is active for the current step
  const isActive = isActiveRoute(sectionRoute) && (!stepId || currentStep?.id === stepId);

  if (isActive) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-25 blur-[1px] filter grayscale">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-xl">
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 border border-border text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
          onClick={() => currentStep && navigate(currentStep.route)}
        >
          <Lock className="w-4 h-4" />
          <span>Complete Step {currentStep?.number} first</span>
        </div>
      </div>
    </div>
  );
}
