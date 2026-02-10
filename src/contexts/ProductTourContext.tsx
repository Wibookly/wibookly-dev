import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

export interface TourStep {
  /** CSS selector or data-tour attribute value to highlight */
  target: string;
  /** Title shown in the tooltip */
  title: string;
  /** Instructional body text */
  content: string;
  /** Tooltip placement relative to the target */
  placement?: 'top' | 'bottom' | 'left' | 'right';
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
  {
    target: '[data-tour="email-selector"]',
    title: 'Connected Emails',
    content: 'Switch between your connected email accounts here. All settings are per-email.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-connections"]',
    title: 'Email & Calendar Connections',
    content: 'Connect your Google or Outlook email and calendar accounts to get started.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-categories"]',
    title: 'Email Categories',
    content: 'Set up categories to organize your inbox. AI will sort incoming emails automatically.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-ai-drafts"]',
    title: 'AI Draft Settings',
    content: 'Configure how AI writes email drafts for you — tone, style, and per-category rules.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-daily-brief"]',
    title: 'Daily Brief',
    content: 'Get an AI-generated summary of your day — emails, meetings, and action items.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-ai-chat"]',
    title: 'AI Chat Assistant',
    content: 'Ask questions about your emails, schedule meetings, or draft replies with AI.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-profile"]',
    title: 'Your Profile & Signature',
    content: 'Set up your name, title, and email signature used in AI-generated drafts.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-activity"]',
    title: 'AI Activity Reports',
    content: 'Track everything AI has done — drafts created, emails categorized, and more.',
    placement: 'right',
  },
];

function getTourStorageKey(userId: string) {
  return `product-tour-completed-${userId}`;
}

export function ProductTourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(true); // default true to avoid flash

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

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

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
      {children}
    </ProductTourContext.Provider>
  );
}

export function useProductTour() {
  const ctx = useContext(ProductTourContext);
  if (!ctx) throw new Error('useProductTour must be used within ProductTourProvider');
  return ctx;
}
