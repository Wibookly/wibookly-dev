import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function OnboardingStepBanner() {
  const { steps, currentStep, currentStepIndex, totalSteps, isOnboardingComplete, loading } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading || isOnboardingComplete) return null;

  const progress = ((currentStepIndex) / totalSteps) * 100;

  // Navigate to the current step's route if user isn't on it
  const handleGoToStep = () => {
    if (currentStep && location.pathname !== currentStep.route.split('?')[0]) {
      navigate(currentStep.route);
    }
  };

  return (
    <div className="w-full bg-card/90 backdrop-blur-sm border-b border-border z-50">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-4 lg:px-8 py-3">
        <div className="flex items-center gap-4">
          {/* Step counter badge */}
          <div 
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[hsl(48_96%_53%)] bg-[hsl(48_96%_53%/0.15)] cursor-pointer"
            onClick={handleGoToStep}
          >
            <span className="text-sm font-bold text-[hsl(48_96%_53%)]">
              Step {currentStep?.number || 0}
            </span>
            <span className="text-xs text-muted-foreground">
              of {totalSteps}
            </span>
          </div>

          {/* Current step title */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {currentStep?.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentStep?.description}
            </p>
          </div>

          {/* Mini step indicators */}
          <div className="hidden md:flex items-center gap-1.5">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2',
                  step.isComplete
                    ? 'bg-primary border-primary text-primary-foreground'
                    : i === currentStepIndex
                      ? 'border-[hsl(48_96%_53%)] bg-[hsl(48_96%_53%/0.15)] text-[hsl(48_96%_53%)] animate-pulse'
                      : 'border-muted bg-muted/50 text-muted-foreground'
                )}
              >
                {step.isComplete ? <Check className="w-3.5 h-3.5" /> : step.number}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
