import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface TooltipStep {
  target: string; // CSS selector for element to point to
  title: string;
  message: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

interface CompactTooltipGuideProps {
  steps: TooltipStep[];
  isOpen: boolean;
  onComplete: () => void;
  storageKey: string;
}

/**
 * COMPACT MOBILE TOOLTIP GUIDE
 * - Small speech bubbles that point directly at form fields
 * - NEVER blocks the element being described
 * - NO dismiss/close buttons - must complete flow
 * - Auto-repositions to avoid PWA banner and other UI
 * - Mobile-optimized sizing (max 280px width, compact height)
 */
export default function CompactTooltipGuide({
  steps,
  isOpen,
  onComplete,
  storageKey
}: CompactTooltipGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    placement: string;
  } | null>(null);

  // Reset to step 1 when guide is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const step = steps[currentStep];

  const calculatePosition = useCallback(() => {
    if (!step?.target) return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipWidth = 280; // Compact width for mobile
    const tooltipMaxHeight = 140; // Compact height
    const arrowSize = 8;
    const padding = 12;

    // Get safe areas (avoid PWA banner at top and sticky button at bottom)
    const pwaBarHeight = 70; // Approximate PWA banner height (with safety margin)
    const stickyButtonHeight = 90; // Approximate sticky PWA button height at bottom
    const safeTop = pwaBarHeight + padding;
    const safeBottom = window.innerHeight - stickyButtonHeight - padding;
    const safeLeft = padding;
    const safeRight = window.innerWidth - padding;

    let placement = step.placement || 'auto';
    let top = 0;
    let left = 0;

    const tryPlacement = (preferredPlacement: string) => {
      switch (preferredPlacement) {
        case 'top':
          top = targetRect.top - tooltipMaxHeight - arrowSize - padding;
          left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
          // Ensure tooltip is within safe top area
          if (top < safeTop) return false;
          break;

        case 'bottom':
          top = targetRect.bottom + arrowSize + padding;
          left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
          // Ensure tooltip doesn't go off bottom
          if (top + tooltipMaxHeight > safeBottom) return false;
          break;

        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipMaxHeight / 2);
          left = targetRect.left - tooltipWidth - arrowSize - padding;
          if (left < safeLeft) return false;
          break;

        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipMaxHeight / 2);
          left = targetRect.right + arrowSize + padding;
          if (left + tooltipWidth > safeRight) return false;
          break;
      }

      // Constrain horizontal position
      if (left < safeLeft) left = safeLeft;
      if (left + tooltipWidth > safeRight) left = safeRight - tooltipWidth;

      // Constrain vertical position
      if (top < safeTop) top = safeTop;
      if (top + tooltipMaxHeight > safeBottom) top = safeBottom - tooltipMaxHeight;

      return true;
    };

    // Try preferred placement first, then fallback
    if (placement === 'auto') {
      // Try placements in order: bottom, top, right, left
      const placements = ['bottom', 'top', 'right', 'left'];
      for (const p of placements) {
        if (tryPlacement(p)) {
          placement = p;
          break;
        }
      }
    } else {
      if (!tryPlacement(placement)) {
        // Fallback to auto if preferred doesn't work
        const placements = ['bottom', 'top', 'right', 'left'];
        for (const p of placements) {
          if (tryPlacement(p)) {
            placement = p;
            break;
          }
        }
      }
    }

    setTooltipPosition({ top, left, placement });

    // Scroll element into view gently
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }, [step]);

  useEffect(() => {
    if (!isOpen || !step) return;

    // Calculate initial position
    const timer = setTimeout(calculatePosition, 200);

    // Recalculate on resize or scroll
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen, step, calculatePosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setTooltipPosition(null); // Clear position during transition
      setTimeout(() => setCurrentStep(prev => prev + 1), 150);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'completed');
    setTooltipPosition(null);
    setTimeout(onComplete, 200);
  };

  if (!isOpen || !step || !tooltipPosition) return null;

  const getArrowStyle = () => {
    const arrowSize = 8;
    const baseStyle = 'absolute w-0 h-0 border-solid';

    switch (tooltipPosition.placement) {
      case 'top':
        return {
          className: `${baseStyle} border-t-amber-100 dark:border-t-amber-900`,
          style: {
            bottom: -arrowSize,
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
            borderColor: 'rgb(254 243 199) transparent transparent transparent',
          }
        };
      case 'bottom':
        return {
          className: `${baseStyle} border-b-amber-100 dark:border-b-amber-900`,
          style: {
            top: -arrowSize,
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
            borderColor: 'transparent transparent rgb(254 243 199) transparent',
          }
        };
      case 'left':
        return {
          className: `${baseStyle} border-l-amber-100 dark:border-l-amber-900`,
          style: {
            right: -arrowSize,
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
            borderColor: 'transparent transparent transparent rgb(254 243 199)',
          }
        };
      case 'right':
        return {
          className: `${baseStyle} border-r-amber-100 dark:border-r-amber-900`,
          style: {
            left: -arrowSize,
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
            borderColor: 'transparent rgb(254 243 199) transparent transparent',
          }
        };
    }
  };

  const arrow = getArrowStyle();

  return (
    <>
      {/* Minimal backdrop - very subtle, doesn't block interaction */}
      <div className="fixed inset-0 bg-black/5 z-[35] pointer-events-none" />

      {/* Compact tooltip bubble */}
      <div
        className="fixed z-[36] animate-in fade-in zoom-in-95 duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          maxWidth: '280px',
          width: 'calc(100vw - 32px)',
        }}
      >
        {/* Arrow pointing to target */}
        <div {...arrow} />

        {/* Tooltip content */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-xl shadow-2xl border-2 border-blue-200 dark:border-blue-700 overflow-hidden">
          <div className="px-4 py-3">
            {/* Progress dots - compact */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all ${
                      idx === currentStep
                        ? 'w-4 bg-blue-600 dark:bg-blue-400'
                        : idx < currentStep
                        ? 'w-2 bg-blue-400 dark:bg-blue-500'
                        : 'w-2 bg-blue-300 dark:bg-blue-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                {currentStep + 1}/{steps.length}
              </span>
            </div>

            {/* Title - compact */}
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
              {step.title}
            </h3>

            {/* Message - compact, supports multiline for bilingual text */}
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-snug mb-3 whitespace-pre-line">
              {step.message}
            </p>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  size="sm"
                  variant="outline"
                  className="h-9 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                size="sm"
                className={`${currentStep > 0 ? 'flex-1' : 'w-full'} h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm shadow-lg`}
              >
                {currentStep === steps.length - 1 ? 'Got it!' : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function useTooltipGuideStatus(storageKey: string) {
  const [hasCompleted, setHasCompleted] = useState(() => {
    return localStorage.getItem(storageKey) === 'completed';
  });

  const markComplete = () => {
    localStorage.setItem(storageKey, 'completed');
    setHasCompleted(true);
  };

  const reset = () => {
    localStorage.removeItem(storageKey);
    setHasCompleted(false);
  };

  return { hasCompleted, markComplete, reset };
}
