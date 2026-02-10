import { useEffect, useState, useCallback, useRef } from 'react';
import { useProductTour } from '@/contexts/ProductTourContext';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function ProductTourOverlay() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour } = useProductTour();
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [ready, setReady] = useState(false);
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updatePosition = useCallback(() => {
    if (!isActive || !steps[currentStep]) return false;

    const step = steps[currentStep];
    const el = document.querySelector(step.target);

    if (!el) {
      setSpotlightRect(null);
      setReady(false);
      return false;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;
    const spotlight: SpotlightRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setSpotlightRect(spotlight);

    // Calculate tooltip position
    const placement = step.placement || 'bottom';
    const tooltipGap = 14;
    const tooltipWidth = 300;
    let style: React.CSSProperties = { position: 'fixed', zIndex: 10002, maxWidth: tooltipWidth };

    switch (placement) {
      case 'right':
        style.top = Math.max(16, Math.min(spotlight.top, window.innerHeight - 250));
        style.left = Math.min(spotlight.left + spotlight.width + tooltipGap, window.innerWidth - tooltipWidth - 16);
        break;
      case 'left':
        style.top = Math.max(16, Math.min(spotlight.top, window.innerHeight - 250));
        style.left = Math.max(16, spotlight.left - tooltipWidth - tooltipGap);
        break;
      case 'bottom':
        style.top = Math.min(spotlight.top + spotlight.height + tooltipGap, window.innerHeight - 250);
        style.left = Math.max(16, Math.min(spotlight.left, window.innerWidth - tooltipWidth - 16));
        break;
      case 'top':
        style.top = Math.max(16, spotlight.top - tooltipGap - 180);
        style.left = Math.max(16, Math.min(spotlight.left, window.innerWidth - tooltipWidth - 16));
        break;
    }

    setTooltipStyle(style);
    setReady(true);

    // Scroll element into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return true;
  }, [isActive, currentStep, steps]);

  // Poll for element to appear after navigation
  useEffect(() => {
    if (!isActive) {
      setReady(false);
      return;
    }

    // Try immediately
    const found = updatePosition();
    if (found) return;

    // Poll every 200ms for up to 3 seconds
    let attempts = 0;
    retryRef.current = setInterval(() => {
      attempts++;
      const found = updatePosition();
      if (found || attempts > 15) {
        if (retryRef.current) clearInterval(retryRef.current);
      }
    }, 200);

    return () => {
      if (retryRef.current) clearInterval(retryRef.current);
    };
  }, [isActive, currentStep, updatePosition]);

  // Update on resize/scroll
  useEffect(() => {
    if (!isActive) return;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isActive, updatePosition]);

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Semi-transparent overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[10000] pointer-events-auto" onClick={skipTour}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlightRect && ready && (
                <rect
                  x={spotlightRect.left}
                  y={spotlightRect.top}
                  width={spotlightRect.width}
                  height={spotlightRect.height}
                  rx="10"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.55)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>

        {/* Spotlight ring glow */}
        {spotlightRect && ready && (
          <div
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              boxShadow: '0 0 0 3px hsl(var(--primary) / 0.6), 0 0 24px hsl(var(--primary) / 0.3)',
              zIndex: 10001,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      {ready && (
        <div
          style={tooltipStyle}
          className={cn(
            'rounded-xl border bg-card p-5 shadow-2xl animate-fade-in pointer-events-auto'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-3 right-3 p-1 rounded-md hover:bg-secondary transition-colors"
            aria-label="Close tour"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Step counter dots */}
          <div className="flex items-center gap-1 mb-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === currentStep ? 'w-5 bg-primary' : i < currentStep ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted-foreground/20'
                )}
              />
            ))}
          </div>

          {/* Step number */}
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Step {currentStep + 1} of {steps.length}
          </p>

          <h4 className="text-sm font-semibold text-foreground mb-1.5">{step.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.content}</p>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-1.5">
              {currentStep > 0 && (
                <Button variant="ghost" size="sm" onClick={prevStep} className="h-7 px-2 text-xs">
                  <ChevronLeft className="w-3 h-3 mr-0.5" />
                  Back
                </Button>
              )}
              <Button variant="default" size="sm" onClick={nextStep} className="h-7 px-3 text-xs">
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-3 h-3 ml-0.5" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
