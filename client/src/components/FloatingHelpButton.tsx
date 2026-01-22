import { HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FloatingHelpButtonProps {
  onClick: () => void;
  show: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

/**
 * Floating help button that appears when help is minimized
 * Always accessible, never blocks critical UI
 * Positioned away from main interactive elements
 */
export default function FloatingHelpButton({
  onClick,
  show,
  position = 'bottom-right'
}: FloatingHelpButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  if (!show) return null;

  const positionClasses = position === 'bottom-right'
    ? 'bottom-20 right-4'
    : 'bottom-20 left-4';

  return (
    <button
      onClick={onClick}
      className={`fixed ${positionClasses} z-[44] w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
      style={{
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
      }}
      aria-label="Open help guide"
    >
      <HelpCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />

      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20" />

      {/* Bilingual Tooltip */}
      <div className="absolute bottom-full mb-3 right-0 bg-gray-900 text-white text-xs font-medium py-2 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-center">
        <div>Need help? Tap here</div>
        <div dir="rtl">مدد کے لیے یہاں کلک کریں</div>
        <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </button>
  );
}
