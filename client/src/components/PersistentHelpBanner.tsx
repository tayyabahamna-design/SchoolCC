import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle, X } from 'lucide-react';

export interface HelpStep {
  title: string;
  content: string;
  action?: string;
}

interface PersistentHelpBannerProps {
  steps: HelpStep[];
  isOpen: boolean;
  onComplete: () => void;
  storageKey?: string;
  position?: 'top' | 'bottom';
  allowMinimize?: boolean;
}

/**
 * Persistent help banner that NEVER blocks content
 * - Anchored to top or bottom of screen
 * - Can be minimized but NEVER fully dismissed
 * - Always has a help button to reopen
 * - Never overlays form controls
 * - Mobile-first design
 */
export default function PersistentHelpBanner({
  steps,
  isOpen,
  onComplete,
  storageKey,
  position = 'bottom',
  allowMinimize = true
}: PersistentHelpBannerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const step = steps[currentStep];

  useEffect(() => {
    if (isOpen) {
      // Check if user has minimized before
      const wasMinimized = localStorage.getItem(`${storageKey}-minimized`) === 'true';
      setIsMinimized(wasMinimized);

      // Show banner after small delay
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'completed');
      localStorage.removeItem(`${storageKey}-minimized`);
    }
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    if (storageKey) {
      localStorage.setItem(`${storageKey}-minimized`, 'true');
    }
  };

  const handleExpand = () => {
    setIsMinimized(false);
    if (storageKey) {
      localStorage.removeItem(`${storageKey}-minimized`);
    }
  };

  if (!isOpen) return null;

  const positionClasses = position === 'top'
    ? 'top-0 rounded-b-2xl'
    : 'bottom-0 rounded-t-2xl';

  const transformClass = position === 'top'
    ? isVisible ? 'translate-y-0' : '-translate-y-full'
    : isVisible ? 'translate-y-0' : 'translate-y-full';

  // Minimized state - just a small bar with help icon
  if (isMinimized) {
    return (
      <div
        className={`fixed left-0 right-0 ${positionClasses} z-[45] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-lg transition-transform duration-300 ${transformClass}`}
      >
        <button
          onClick={handleExpand}
          className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-black/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">Need Help? Tap to expand guide</span>
          </div>
          {position === 'bottom' ? (
            <ChevronUp className="w-5 h-5 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 flex-shrink-0" />
          )}
        </button>
      </div>
    );
  }

  // Expanded state - full help content
  return (
    <div
      className={`fixed left-0 right-0 ${positionClasses} z-[45] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/95 dark:to-indigo-900/95 shadow-2xl transition-transform duration-500 ease-out ${transformClass}`}
      style={{
        maxHeight: position === 'bottom' ? '45vh' : '40vh',
      }}
    >
      {/* Handle bar for visual affordance */}
      {position === 'bottom' && (
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-blue-300 dark:bg-blue-600 rounded-full" />
        </div>
      )}

      <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: position === 'bottom' ? 'calc(45vh - 60px)' : 'calc(40vh - 60px)' }}>
        {/* Header with minimize/close */}
        <div className="flex items-center justify-between mb-3 pt-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
              فوری رہنما | Quick Start Guide
            </span>
          </div>
          <div className="flex items-center gap-2">
            {allowMinimize && (
              <button
                onClick={handleMinimize}
                className="p-2 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Minimize help"
              >
                {position === 'bottom' ? (
                  <ChevronDown className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex gap-2 flex-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'flex-1 bg-blue-600 dark:bg-blue-400'
                    : idx < currentStep
                    ? 'w-4 bg-blue-400 dark:bg-blue-500'
                    : 'w-4 bg-blue-200 dark:bg-blue-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300 ml-3 whitespace-nowrap">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Step content */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {step.title}
          </h3>
          {/* Split content into English (LTR) and Urdu (RTL) */}
          {step.content.includes('\n\n') ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed text-left" dir="ltr">
                {step.content.split('\n\n')[0]}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed text-right" dir="rtl">
                {step.content.split('\n\n')[1]}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              {step.content}
            </p>
          )}
          {step.action && (
            <div className="flex items-start gap-2 p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 flex-shrink-0" />
              {step.action.includes('|') ? (
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 text-left" dir="ltr">
                    {step.action.split('|')[0].trim()}
                  </p>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 text-right" dir="rtl">
                    {step.action.split('|')[1].trim()}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {step.action}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-blue-200 dark:border-blue-700">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
            variant="outline"
            className="flex-1 h-11 bg-white dark:bg-blue-900 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800 disabled:opacity-30"
          >
            Previous پچھلا
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
          >
            {currentStep === steps.length - 1 ? 'Got it! سمجھ گیا' : 'Next اگلا'}
          </Button>
        </div>

      </div>

      {/* Handle bar at bottom if top position */}
      {position === 'top' && (
        <div className="flex justify-center py-2">
          <div className="w-12 h-1.5 bg-blue-300 dark:bg-blue-600 rounded-full" />
        </div>
      )}
    </div>
  );
}

export function useHelpBannerStatus(storageKey: string) {
  const [hasCompletedHelp, setHasCompletedHelp] = useState(() => {
    return localStorage.getItem(storageKey) === 'completed';
  });
  const [isViewingGuide, setIsViewingGuide] = useState(false);

  const markComplete = () => {
    localStorage.setItem(storageKey, 'completed');
    setHasCompletedHelp(true);
    setIsViewingGuide(false);
  };

  const resetHelp = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}-minimized`);
    setHasCompletedHelp(false);
  };

  const openGuide = () => {
    setIsViewingGuide(true);
  };

  const closeGuide = () => {
    setIsViewingGuide(false);
  };

  return { hasCompletedHelp, markComplete, resetHelp, isViewingGuide, openGuide, closeGuide };
}

export function PersistentHelpButton({ 
  onClick, 
  position = 'bottom' 
}: { 
  onClick: () => void; 
  position?: 'top' | 'bottom';
}) {
  const positionClasses = position === 'top'
    ? 'top-16 right-4'
    : 'bottom-4 right-4';

  return (
    <button
      onClick={onClick}
      className={`fixed ${positionClasses} z-[40] flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
      data-testid="help-guide-button"
    >
      <HelpCircle className="w-5 h-5" />
      <span className="text-sm font-medium">Let me help you! مدد کے لیے یہاں کلک کریں</span>
    </button>
  );
}
