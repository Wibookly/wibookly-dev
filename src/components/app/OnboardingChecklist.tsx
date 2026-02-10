import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Mail, FolderOpen, User, X, ChevronDown, ChevronUp, FileText, Sparkles, Calendar, PenLine, Send, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useSubscription } from '@/lib/subscription';
import confetti from 'canvas-confetti';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  isComplete: boolean;
  isOptional?: boolean;
  section: 'required' | 'optional';
  /** data-onboarding attribute value to highlight the target section */
  highlightTarget?: string;
  /** Optional: instead of navigating, fire a custom action */
  action?: () => void;
}

interface OnboardingChecklistProps {
  onStepClick?: () => void;
  onOpenPlanModal?: () => void;
}

export function OnboardingChecklist({ onStepClick, onOpenPlanModal }: OnboardingChecklistProps) {
  const { organization, profile } = useAuth();
  const { status } = useSubscription();
  const hasActiveSub = status === 'active' || status === 'trialing';
  const navigate = useNavigate();
  const location = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRequiredCollapsed, setIsRequiredCollapsed] = useState(false);
  const [isOptionalCollapsed, setIsOptionalCollapsed] = useState(true);
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);
  const hasAnimated = useRef<Set<string>>(new Set());
  
  const [steps, setSteps] = useState<OnboardingStep[]>([
    // Required steps
    {
      id: 'account',
      title: 'Create Account',
      description: 'Your account is ready',
      icon: User,
      href: '/settings',
      isComplete: true,
      section: 'required',
    },
    {
      id: 'subscribe',
      title: 'Choose a Plan',
      description: 'Subscribe to unlock features',
      icon: CreditCard,
      href: '/integrations',
      isComplete: false,
      section: 'required',
      highlightTarget: 'subscription-card',
    },
    {
      id: 'email',
      title: 'Connect Email',
      description: 'Link Google or Outlook',
      icon: Mail,
      href: '/integrations',
      isComplete: false,
      section: 'required',
      highlightTarget: 'email-providers',
    },
    {
      id: 'calendars',
      title: 'Connect Calendars',
      description: 'Link your calendars',
      icon: Calendar,
      href: '/integrations',
      isComplete: false,
      section: 'required',
      highlightTarget: 'email-providers',
    },
    {
      id: 'categories',
      title: 'Setup Email Folders/Labels',
      description: 'Organize your inbox',
      icon: FolderOpen,
      href: '/categories',
      isComplete: false,
      section: 'required',
    },
    {
      id: 'signature',
      title: 'Update Profile & Signature',
      description: 'Set up your email signature',
      icon: PenLine,
      href: '/settings',
      isComplete: false,
      section: 'required',
    },
    // Optional steps
    {
      id: 'rules',
      title: 'Setup Rules',
      description: 'Create email rules',
      icon: FileText,
      href: '/categories',
      isComplete: false,
      isOptional: true,
      section: 'optional',
    },
    {
      id: 'ai-drafts',
      title: 'Setup AI Drafts',
      description: 'Enable AI drafts on categories',
      icon: Sparkles,
      href: '/categories',
      isComplete: false,
      isOptional: true,
      section: 'optional',
    },
    {
      id: 'ai-auto-reply',
      title: 'Setup AI Auto Reply',
      description: 'Enable auto-reply on categories',
      icon: Send,
      href: '/categories',
      isComplete: false,
      isOptional: true,
      section: 'optional',
    }
  ]);
  const [loading, setLoading] = useState(true);

  // Check localStorage for dismissed state
  useEffect(() => {
    const dismissed = localStorage.getItem(`onboarding-dismissed-${organization?.id}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [organization?.id]);

  useEffect(() => {
    if (!organization?.id) return;

    const fetchProgress = async () => {
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

        const { count: rulesCount } = await supabase
          .from('rules')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('is_enabled', true);

        const { count: aiDraftCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('ai_draft_enabled', true);

        const { count: autoReplyCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('auto_reply_enabled', true);

        const { data: emailProfile } = await supabase
          .from('email_profiles')
          .select('email_signature, signature_enabled')
          .eq('organization_id', organization.id)
          .limit(1)
          .single();

        setSteps(prev => prev.map(step => {
          let isComplete = step.isComplete;
          if (step.id === 'account') isComplete = true;
          if (step.id === 'subscribe') isComplete = hasActiveSub;
          if (step.id === 'email') isComplete = hasEmailConnected;
          if (step.id === 'calendars') isComplete = hasCalendarConnected;
          if (step.id === 'categories') isComplete = (categoriesCount || 0) > 0;
          if (step.id === 'signature') isComplete = !!emailProfile?.signature_enabled;
          if (step.id === 'rules') isComplete = (rulesCount || 0) > 0;
          if (step.id === 'ai-drafts') isComplete = (aiDraftCount || 0) > 0;
          if (step.id === 'ai-auto-reply') isComplete = (autoReplyCount || 0) > 0;
          return { ...step, isComplete };
        }));
      } catch (error) {
        console.error('Error fetching onboarding progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [organization?.id, hasActiveSub]);

  // Count only required steps for progress
  const requiredSteps = steps.filter(s => s.section === 'required');
  const optionalSteps = steps.filter(s => s.section === 'optional');
  const completedRequiredCount = requiredSteps.filter(s => s.isComplete).length;
  const completedCount = steps.filter(s => s.isComplete).length;
  const progress = (completedRequiredCount / requiredSteps.length) * 100;
  const allRequiredComplete = completedRequiredCount === requiredSteps.length;

  // Find the first incomplete required step
  const firstIncompleteRequiredIndex = requiredSteps.findIndex(s => !s.isComplete);
  const firstIncompleteRequiredId = firstIncompleteRequiredIndex >= 0 ? requiredSteps[firstIncompleteRequiredIndex].id : null;
  const firstIncompleteStep = firstIncompleteRequiredId ? requiredSteps.find(s => s.id === firstIncompleteRequiredId) : null;

  // Highlight the target section for the next incomplete step
  useEffect(() => {
    if (!firstIncompleteStep?.highlightTarget) return;
    
    const target = document.querySelector(`[data-onboarding="${firstIncompleteStep.highlightTarget}"]`);
    if (target) {
      target.classList.add('onboarding-highlight');
      return () => {
        target.classList.remove('onboarding-highlight');
      };
    }
  }, [firstIncompleteStep?.highlightTarget, firstIncompleteStep?.id]);

  // Trigger confetti only when a step NEWLY completes
  const initialCompletedRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (loading) return;
    
    if (initialCompletedRef.current === null) {
      initialCompletedRef.current = new Set(steps.filter(s => s.isComplete).map(s => s.id));
      setPrevCompletedCount(completedCount);
      return;
    }
    
    steps.forEach(step => {
      if (step.isComplete && 
          !hasAnimated.current.has(step.id) && 
          !initialCompletedRef.current?.has(step.id)) {
        hasAnimated.current.add(step.id);
        triggerConfetti();
      }
    });

    if (allRequiredComplete && prevCompletedCount < requiredSteps.length && initialCompletedRef.current.size < requiredSteps.length) {
      triggerBigConfetti();
    }

    setPrevCompletedCount(completedCount);
  }, [steps, loading, completedCount, allRequiredComplete, prevCompletedCount, requiredSteps.length]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7, x: 0.2 },
      colors: ['#00b4d8', '#00d4aa', '#48cae4']
    });
  };

  const triggerBigConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00b4d8', '#00d4aa', '#48cae4', '#90e0ef']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00b4d8', '#00d4aa', '#48cae4', '#90e0ef']
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (organization?.id) {
      localStorage.setItem(`onboarding-dismissed-${organization.id}`, 'true');
    }
  };

  const handleStepClick = (step: OnboardingStep) => {
    // For subscribe step, open plan modal if available
    if (step.id === 'subscribe' && !step.isComplete && onOpenPlanModal) {
      onOpenPlanModal();
      onStepClick?.();
      return;
    }
    
    navigate(step.href);
    onStepClick?.();
    
    // After navigating, scroll to the highlighted section
    if (step.highlightTarget) {
      setTimeout(() => {
        const target = document.querySelector(`[data-onboarding="${step.highlightTarget}"]`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  };

  if (isDismissed) return null;

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="h-4 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Custom step indicator component with yellow highlight for next step
  const StepIndicator = ({ step, isNextIncomplete }: { step: OnboardingStep; isNextIncomplete: boolean }) => {
    const Icon = step.icon;
    
    if (step.isComplete) {
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
          <Check className="w-4 h-4" />
        </div>
      );
    }
    
    // Next incomplete step — yellow pulsing ring
    if (isNextIncomplete) {
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative bg-muted onboarding-pulse-ring">
          <Icon className="w-4 h-4 relative z-10 text-foreground" />
        </div>
      );
    }
    
    // Future incomplete steps
    return (
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Onboarding highlight CSS */}
      <style>{`
        .onboarding-highlight {
          position: relative;
          animation: onboarding-glow 2s ease-in-out infinite;
          border-color: hsl(48 96% 53%) !important;
          box-shadow: 0 0 0 3px hsl(48 96% 53% / 0.4), 0 0 30px hsl(48 96% 53% / 0.2);
        }
        .onboarding-highlight-strong {
          position: relative;
          animation: onboarding-glow-strong 1.5s ease-in-out infinite;
          border: 2px solid hsl(48 96% 53%) !important;
          border-radius: 12px;
          box-shadow: 0 0 0 4px hsl(48 96% 53% / 0.5), 0 0 40px hsl(48 96% 53% / 0.3), inset 0 0 20px hsl(48 96% 53% / 0.05);
        }
        @keyframes onboarding-glow {
          0%, 100% { box-shadow: 0 0 0 3px hsl(48 96% 53% / 0.4), 0 0 30px hsl(48 96% 53% / 0.2); }
          50% { box-shadow: 0 0 0 6px hsl(48 96% 53% / 0.6), 0 0 50px hsl(48 96% 53% / 0.35); }
        }
        @keyframes onboarding-glow-strong {
          0%, 100% { box-shadow: 0 0 0 4px hsl(48 96% 53% / 0.5), 0 0 40px hsl(48 96% 53% / 0.3), inset 0 0 20px hsl(48 96% 53% / 0.05); }
          50% { box-shadow: 0 0 0 8px hsl(48 96% 53% / 0.7), 0 0 60px hsl(48 96% 53% / 0.45), inset 0 0 30px hsl(48 96% 53% / 0.08); }
        }
        .onboarding-pulse-ring {
          box-shadow: 0 0 0 0 hsl(48 96% 53% / 0.7);
          animation: onboarding-ring-pulse 1.5s ease-in-out infinite;
        }
        @keyframes onboarding-ring-pulse {
          0% { box-shadow: 0 0 0 0 hsl(48 96% 53% / 0.7); }
          70% { box-shadow: 0 0 0 8px hsl(48 96% 53% / 0); }
          100% { box-shadow: 0 0 0 0 hsl(48 96% 53% / 0); }
        }
      `}</style>

      {/* Required Steps Dropdown */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <button 
          onClick={() => setIsRequiredCollapsed(!isRequiredCollapsed)}
          className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Required Setup</span>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {completedRequiredCount}/{requiredSteps.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {allRequiredComplete && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {isRequiredCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>
        
        {/* Progress bar */}
        <div className="px-3 pb-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div 
          className={cn(
            'transition-all duration-300 ease-out overflow-hidden',
            isRequiredCollapsed ? 'max-h-0' : 'max-h-[30rem]'
          )}
        >
          <div className="p-2 pt-0">
            {requiredSteps.map((step) => {
              const wasJustCompleted = step.isComplete && hasAnimated.current.has(step.id);
              const isNextIncomplete = step.id === firstIncompleteRequiredId;
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-all duration-200',
                    isNextIncomplete && 'bg-accent/50',
                    !isNextIncomplete && 'hover:bg-muted/50',
                    wasJustCompleted && 'animate-scale-in'
                  )}
                >
                  <StepIndicator step={step} isNextIncomplete={isNextIncomplete} />
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium transition-all duration-200',
                      step.isComplete && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </p>
                  </div>

                  {isNextIncomplete && (
                    <span className="text-xs font-medium text-primary shrink-0">
                      Do this →
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {allRequiredComplete && (
            <div className="p-2 border-t border-border bg-primary/10">
              <p className="text-xs text-center text-primary font-medium">
                🎉 All set! You're ready to go
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Optional Steps Dropdown */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <button 
          onClick={() => setIsOptionalCollapsed(!isOptionalCollapsed)}
          className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Optional Setup</span>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {optionalSteps.filter(s => s.isComplete).length}/{optionalSteps.length}
            </span>
          </div>
          {isOptionalCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        <div 
          className={cn(
            'transition-all duration-300 ease-out overflow-hidden',
            isOptionalCollapsed ? 'max-h-0' : 'max-h-[20rem]'
          )}
        >
          <div className="p-2 pt-0">
            {optionalSteps.map((step) => {
              const wasJustCompleted = step.isComplete && hasAnimated.current.has(step.id);
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-all duration-200 hover:bg-muted/50',
                    wasJustCompleted && 'animate-scale-in'
                  )}
                >
                  <StepIndicator step={step} isNextIncomplete={false} />
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium transition-all duration-200',
                      step.isComplete && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
