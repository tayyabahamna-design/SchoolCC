import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleGradient?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl';
  maxHeight?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
};

export function DashboardModal({
  open,
  onClose,
  title,
  titleGradient,
  description,
  maxWidth = '2xl',
  maxHeight = 'max-h-[85vh]',
  children,
  showCloseButton = true,
  className,
}: DashboardModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full overflow-hidden',
          maxWidthClasses[maxWidth],
          maxHeight,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={cn(
                  'text-2xl font-bold',
                  titleGradient
                    ? `bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`
                    : 'text-gray-900 dark:text-white'
                )}
              >
                {title}
              </h2>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
