import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  onBeforeStep?: () => void;
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  storageKey?: string;
}

export function OnboardingTour({ steps, isOpen, onComplete, onSkip, storageKey }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const step = steps[currentStep];

  const updateTargetPosition = useCallback(() => {
    if (!step?.target) return;
    
    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      setIsVisible(true);
      
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step?.target]);

  useEffect(() => {
    if (!isOpen || !step) return;

    step.onBeforeStep?.();
    
    const timer = setTimeout(updateTargetPosition, 100);
    
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [isOpen, step, updateTargetPosition]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsVisible(false);
      setTimeout(() => setCurrentStep(prev => prev + 1), 150);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsVisible(false);
      setTimeout(() => setCurrentStep(prev => prev - 1), 150);
    }
  };

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'completed');
    }
    onComplete();
  };

  const handleSkip = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'skipped');
    }
    onSkip();
  };

  if (!isOpen || !step || !targetRect) return null;

  const getTooltipPosition = () => {
    const preferredPlacement = step.placement || 'bottom';
    const padding = 20;
    const arrowOffset = 16;
    
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    
    const calculatePosition = (placement: string) => {
      let top = 0;
      let left = 0;
      
      switch (placement) {
        case 'top':
          top = targetRect.top - tooltipHeight - arrowOffset;
          left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
          break;
        case 'bottom':
          top = targetRect.bottom + arrowOffset;
          left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
          left = targetRect.left - tooltipWidth - arrowOffset;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
          left = targetRect.right + arrowOffset;
          break;
      }
      
      return { top, left, placement };
    };
    
    let result = calculatePosition(preferredPlacement);
    
    if (result.left < padding) {
      if (preferredPlacement === 'left') {
        result = calculatePosition('right');
      } else {
        result.left = padding;
      }
    }
    if (result.left + tooltipWidth > window.innerWidth - padding) {
      if (preferredPlacement === 'right') {
        result = calculatePosition('left');
      } else {
        result.left = window.innerWidth - tooltipWidth - padding;
      }
    }
    if (result.top < padding) {
      if (preferredPlacement === 'top') {
        result = calculatePosition('bottom');
      } else {
        result.top = padding;
      }
    }
    if (result.top + tooltipHeight > window.innerHeight - padding) {
      if (preferredPlacement === 'bottom') {
        result = calculatePosition('top');
      } else {
        result.top = window.innerHeight - tooltipHeight - padding;
      }
    }
    
    return result;
  };

  const getArrowStyle = (actualPlacement: string) => {
    const baseStyle = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };
    
    switch (actualPlacement) {
      case 'top':
        return {
          ...baseStyle,
          bottom: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '10px 10px 0 10px',
          borderColor: 'white transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 10px 10px 10px',
          borderColor: 'transparent transparent white transparent',
        };
      case 'left':
        return {
          ...baseStyle,
          right: -10,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '10px 0 10px 10px',
          borderColor: 'transparent transparent transparent white',
        };
      case 'right':
        return {
          ...baseStyle,
          left: -10,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '10px 10px 10px 0',
          borderColor: 'transparent white transparent transparent',
        };
    }
  };

  const tooltipPos = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-[9999]" data-testid="onboarding-tour">
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - 8}
              y={targetRect.top - 8}
              width={targetRect.width + 16}
              height={targetRect.height + 16}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Clickable area over the highlighted element - allows users to tap the button */}
      <div
        className="absolute cursor-pointer"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          zIndex: 10001,
        }}
        onClick={() => {
          const targetElement = document.querySelector(`[data-testid="${step.targetId}"]`) as HTMLElement;
          if (targetElement) {
            targetElement.click();
          }
        }}
      />
      
      {/* Visual highlight ring around the target */}
      <div
        className="absolute rounded-2xl ring-4 ring-amber-400 ring-offset-2 pointer-events-none transition-all duration-300"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          opacity: isVisible ? 1 : 0,
          boxShadow: '0 0 0 4px rgba(251, 191, 36, 0.3), 0 0 30px rgba(251, 191, 36, 0.4)',
        }}
      />

      <div
        className={`absolute bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 w-80 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          zIndex: 10000,
        }}
      >
        <div style={getArrowStyle(tooltipPos.placement)} />
        
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          data-testid="tour-skip-button"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {step.content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-amber-500 w-6'
                    : idx < currentStep
                    ? 'bg-amber-300'
                    : 'bg-gray-200 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="h-8"
                data-testid="tour-prev-button"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="h-8 bg-amber-500 hover:bg-amber-600 text-white"
              data-testid="tour-next-button"
            >
              {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useTourStatus(storageKey: string) {
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem(storageKey) !== null;
  });

  const markComplete = () => {
    localStorage.setItem(storageKey, 'completed');
    setHasSeenTour(true);
  };

  const resetTour = () => {
    localStorage.removeItem(storageKey);
    setHasSeenTour(false);
  };

  return { hasSeenTour, markComplete, resetTour };
}
