import { LucideIcon, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GradientIcon } from './GradientIcon';
import { StatBreakdownRow } from './StatBreakdownRow';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BreakdownItem {
  label: string;
  value: string | number;
  variant?: BadgeVariant;
  valueColor?: string;
  showAsBadge?: boolean;
}

interface MetricBadge {
  text: string;
  variant?: BadgeVariant;
  className?: string;
}

interface MetricCardProps {
  value: string | number;
  label: string;
  icon: LucideIcon;
  iconGradient: string;
  breakdown?: BreakdownItem[];
  badge?: MetricBadge;
  onClick?: () => void;
  showChevron?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  borderColor?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function MetricCard({
  value,
  label,
  icon,
  iconGradient,
  breakdown,
  badge,
  onClick,
  showChevron = false,
  size = 'lg',
  borderColor,
  className,
}: MetricCardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        'p-6 transition-all duration-300',
        isClickable && 'hover:shadow-xl cursor-pointer',
        borderColor && `border-l-4 ${borderColor}`,
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <GradientIcon icon={icon} gradient={iconGradient} animate={isClickable} />
        {showChevron && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
      </div>

      <div className="flex items-center justify-between mb-1">
        <h3 className={cn('font-bold text-gray-900 dark:text-white', sizeClasses[size])}>
          {value}
        </h3>
        {badge && (
          <Badge variant={badge.variant} className={badge.className}>
            {badge.text}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-3">{label}</p>

      {breakdown && breakdown.length > 0 && (
        <div className="space-y-2">
          {breakdown.map((item, index) => (
            <StatBreakdownRow key={index} {...item} />
          ))}
        </div>
      )}
    </Card>
  );
}
