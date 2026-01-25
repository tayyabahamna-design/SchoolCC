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
    placement: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  } | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Reset to step 1 when guide is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Detect keyboard visibility on mobile
  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      setKeyboardVisible(viewportHeight < windowHeight * 0.75);
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const step = steps[currentStep];

  const calculatePosition = useCallback(() => {
    if (!step?.target) return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const tooltipWidth = Math.min(220, screenWidth * 0.45); // Max 45% of screen, max 220px
    const tooltipMaxHeight = keyboardVisible ? 80 : 110; // Smaller when keyboard is open
    const arrowSize = 6;
    const padding = 8;

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
    const placementOptions: Array<'bottom' | 'top' | 'right' | 'left'> = ['bottom', 'top', 'right', 'left'];
    
    if (placement === 'auto') {
      for (const p of placementOptions) {
        if (tryPlacement(p)) {
          placement = p;
          break;
        }
      }
    } else {
      if (!tryPlacement(placement)) {
        for (const p of placementOptions) {
          if (tryPlacement(p)) {
            placement = p;
            break;
          }
        }
      }
    }

    setTooltipPosition({ top, left, placement: placement as 'top' | 'bottom' | 'left' | 'right' | 'auto' });

    // Scroll element into view gently
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }, [step, keyboardVisible]);

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
    const arrowSize = 6;
    const baseStyle = 'absolute w-0 h-0 border-solid';
    const blueColor = 'rgb(239 246 255)'; // blue-50

    switch (tooltipPosition.placement) {
      case 'top':
        return {
          className: baseStyle,
          style: {
            bottom: -arrowSize,
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
            borderColor: `${blueColor} transparent transparent transparent`,
          }
        };
      case 'bottom':
        return {
          className: baseStyle,
          style: {
            top: -arrowSize,
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
            borderColor: `transparent transparent ${blueColor} transparent`,
          }
        };
      case 'left':
        return {
          className: baseStyle,
          style: {
            right: -arrowSize,
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
            borderColor: `transparent transparent transparent ${blueColor}`,
          }
        };
      case 'right':
        return {
          className: baseStyle,
          style: {
            left: -arrowSize,
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
            borderColor: `transparent ${blueColor} transparent transparent`,
          }
        };
    }
  };

  const arrow = getArrowStyle();

  const screenWidth = window.innerWidth;
  const tooltipMaxWidth = Math.min(220, screenWidth * 0.45);

  return (
    <>
      {/* Minimal backdrop - very subtle, doesn't block interaction */}
      <div className="fixed inset-0 bg-black/5 z-[35] pointer-events-none" />

      {/* Compact tooltip bubble */}
      <div
        className="fixed z-[36] animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          maxWidth: `${tooltipMaxWidth}px`,
          width: `${tooltipMaxWidth}px`,
        }}
      >
        {/* Arrow pointing to target */}
        <div {...arrow} />

        {/* Tooltip content */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg shadow-xl border border-blue-200 dark:border-blue-700 overflow-hidden">
          <div className="px-2.5 py-2">
            {/* Progress dots - compact */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex gap-0.5">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-0.5 rounded-full transition-all ${
                      idx === currentStep
                        ? 'w-3 bg-blue-600 dark:bg-blue-400'
                        : idx < currentStep
                        ? 'w-1.5 bg-blue-400 dark:bg-blue-500'
                        : 'w-1.5 bg-blue-300 dark:bg-blue-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {currentStep + 1}/{steps.length}
              </span>
            </div>

            {/* Title - compact */}
            <h3 className="text-xs font-bold text-blue-900 dark:text-blue-100 mb-0.5 leading-tight">
              {step.title}
            </h3>

            {/* Message - compact, supports multiline for bilingual text */}
            <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-tight mb-2 whitespace-pre-line">
              {step.message}
            </p>

            {/* Navigation buttons */}
            <div className="flex gap-1.5">
              {currentStep > 0 && (
                <Button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[10px] border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                size="sm"
                className={`${currentStep > 0 ? 'flex-1' : 'w-full'} h-7 px-2 text-[10px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md`}
              >
                {currentStep === steps.length - 1 ? 'Got it!' : (
                  <>
                    Next
                    <ChevronRight className="w-3 h-3 ml-0.5" />
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
