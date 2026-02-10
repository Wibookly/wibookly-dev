import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';

export interface TourStep {
  /** CSS selector or data-tour attribute value to highlight */
  target: string;
  /** Title shown in the tooltip */
  title: string;
  /** Instructional body text */
  content: string;
  /** Tooltip placement relative to the target */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Route to navigate to before showing this step */
  route?: string;
}

interface ProductTourContextValue {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  hasCompletedTour: boolean;
}

const ProductTourContext = createContext<ProductTourContextValue | null>(null);

const TOUR_STEPS: TourStep[] = [
  // Step 1: Welcome — highlight the sidebar email selector
  {
    target: '[data-tour="email-selector"]',
    title: 'Welcome to Your Dashboard!',
    content: 'Let\'s walk through setting up your account step by step. This is where you\'ll switch between connected email accounts.',
    placement: 'right',
    route: '/integrations',
  },
  // Step 2: Navigate to Integrations — connect email
  {
    target: '[data-tour="email-providers"]',
    title: 'Connect Your Email',
    content: 'Start by connecting your Google or Outlook email account. Click the "Connect" button to link your inbox.',
    placement: 'top',
    route: '/integrations',
  },
  // Step 3: Calendar connection on the same page
  {
    target: '[data-tour="calendar-section"]',
    title: 'Connect Your Calendar',
    content: 'After connecting email, enable calendar sync so AI can manage your scheduling.',
    placement: 'top',
    route: '/integrations',
  },
  // Step 4: Navigate to Categories
  {
    target: '[data-tour="categories-list"]',
    title: 'Set Up Email Categories',
    content: 'Create categories to organize your inbox. AI will automatically sort incoming emails into these folders.',
    placement: 'top',
    route: '/categories',
  },
  // Step 5: Navigate to AI Draft Settings
  {
    target: '[data-tour="writing-style"]',
    title: 'Configure AI Draft Style',
    content: 'Choose a writing style for your AI-generated email drafts — professional, friendly, concise, and more.',
    placement: 'top',
    route: '/email-draft',
  },
  // Step 6: Navigate to Profile settings
  {
    target: '[data-tour="profile-section"]',
    title: 'Update Your Profile',
    content: 'Set up your name, title, and contact info. This is used in AI-generated email drafts and signatures.',
    placement: 'top',
    route: '/settings?section=profile',
  },
  // Step 7: Navigate to Signature settings
  {
    target: '[data-tour="signature-section"]',
    title: 'Set Up Your Signature',
    content: 'Create your email signature. AI will include this in drafts it generates for you.',
    placement: 'top',
    route: '/settings?section=signature',
  },
  // Step 8: Daily Brief
  {
    target: '[data-tour="daily-brief"]',
    title: 'Your Daily Brief',
    content: 'Each day, AI generates a summary of your inbox, meetings, and action items. Check it here!',
    placement: 'top',
    route: '/ai-daily-brief',
  },
  // Step 9: AI Chat
  {
    target: '[data-tour="ai-chat"]',
    title: 'AI Chat Assistant',
    content: 'Ask questions about your emails, draft replies, or manage your schedule — all from this chat.',
    placement: 'top',
    route: '/ai-chat',
  },
  // Step 10: AI Activity
  {
    target: '[data-tour="ai-activity"]',
    title: 'Track AI Activity',
    content: 'See everything AI has done — drafts created, emails categorized, and auto-replies sent. You\'re all set!',
    placement: 'top',
    route: '/ai-activity',
  },
];

function getTourStorageKey(userId: string) {
  return `product-tour-completed-${userId}`;
}

export function ProductTourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(true);
  const navigateRef = useRef<ReturnType<typeof useNavigate> | null>(null);

  // Check completion on mount
  useEffect(() => {
    if (!user?.id) return;
    const completed = localStorage.getItem(getTourStorageKey(user.id));
    setHasCompletedTour(completed === 'true');
  }, [user?.id]);

  // Auto-start on first login (FTUX) — delayed to let UI mount
  useEffect(() => {
    if (!user?.id || hasCompletedTour || isActive) return;
    const timer = setTimeout(() => {
      setIsActive(true);
      setCurrentStep(0);
    }, 1500);
    return () => clearTimeout(timer);
  }, [user?.id, hasCompletedTour, isActive]);

  const markComplete = useCallback(() => {
    if (user?.id) {
      localStorage.setItem(getTourStorageKey(user.id), 'true');
      setHasCompletedTour(true);
    }
  }, [user?.id]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    markComplete();
  }, [markComplete]);

  const goToStep = useCallback((stepIndex: number) => {
    const step = TOUR_STEPS[stepIndex];
    if (step?.route && navigateRef.current) {
      navigateRef.current(step.route);
    }
    setCurrentStep(stepIndex);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      endTour();
    }
  }, [currentStep, endTour, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const skipTour = useCallback(() => {
    endTour();
  }, [endTour]);

  return (
    <ProductTourContext.Provider
      value={{
        isActive,
        currentStep,
        steps: TOUR_STEPS,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        hasCompletedTour,
      }}
    >
      <NavigateInjector navigateRef={navigateRef} />
      {children}
    </ProductTourContext.Provider>
  );
}

/** Injects useNavigate into the ref so the context can navigate without being inside Router */
function NavigateInjector({ navigateRef }: { navigateRef: React.MutableRefObject<ReturnType<typeof useNavigate> | null> }) {
  const navigate = useNavigate();
  navigateRef.current = navigate;
  return null;
}

export function useProductTour() {
  const ctx = useContext(ProductTourContext);
  if (!ctx) throw new Error('useProductTour must be used within ProductTourProvider');
  return ctx;
}
