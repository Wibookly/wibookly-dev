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
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!isActive || !steps[currentStep]) return;

    const step = steps[currentStep];
    const el = document.querySelector(step.target);

    if (!el) {
      setSpotlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 6;
    const spotlight: SpotlightRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setSpotlightRect(spotlight);

    // Calculate tooltip position
    const placement = step.placement || 'right';
    const tooltipGap = 12;
    let style: React.CSSProperties = { position: 'fixed', zIndex: 10002 };

    switch (placement) {
      case 'right':
        style.top = spotlight.top + spotlight.height / 2;
        style.left = spotlight.left + spotlight.width + tooltipGap;
        style.transform = 'translateY(-50%)';
        break;
      case 'left':
        style.top = spotlight.top + spotlight.height / 2;
        style.right = window.innerWidth - spotlight.left + tooltipGap;
        style.transform = 'translateY(-50%)';
        break;
      case 'bottom':
        style.top = spotlight.top + spotlight.height + tooltipGap;
        style.left = spotlight.left + spotlight.width / 2;
        style.transform = 'translateX(-50%)';
        break;
      case 'top':
        style.bottom = window.innerHeight - spotlight.top + tooltipGap;
        style.left = spotlight.left + spotlight.width / 2;
        style.transform = 'translateX(-50%)';
        break;
    }

    setTooltipStyle(style);

    // Scroll element into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isActive, currentStep, steps]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Semi-transparent overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[10000] pointer-events-auto">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left}
                  y={spotlightRect.top}
                  width={spotlightRect.width}
                  height={spotlightRect.height}
                  rx="8"
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
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>

        {/* Spotlight ring glow */}
        {spotlightRect && (
          <div
            className="absolute rounded-lg pointer-events-none"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              boxShadow: '0 0 0 3px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.3)',
              zIndex: 10001,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className={cn(
          'w-72 rounded-xl border bg-card p-4 shadow-xl animate-fade-in',
          'pointer-events-auto'
        )}
      >
        {/* Close button */}
        <button
          onClick={skipTour}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-secondary transition-colors"
          aria-label="Close tour"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {/* Step counter */}
        <div className="flex items-center gap-1.5 mb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === currentStep ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        <h4 className="text-sm font-semibold text-foreground mb-1">{step.title}</h4>
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
    </>
  );
}
