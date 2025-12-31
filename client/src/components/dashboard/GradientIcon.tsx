import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradientIconProps {
  icon: LucideIcon;
  gradient: string;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'lg' | 'xl' | '2xl';
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const roundedClasses = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export function GradientIcon({
  icon: Icon,
  gradient,
  size = 'md',
  rounded = 'xl',
  animate = false,
  className,
}: GradientIconProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center shadow-lg bg-gradient-to-br',
        gradient,
        sizeClasses[size],
        roundedClasses[rounded],
        animate && 'transition-transform hover:scale-110',
        className
      )}
    >
      <Icon className={cn('text-white', iconSizeClasses[size])} />
    </div>
  );
}
