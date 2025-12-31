import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface StatBreakdownRowProps {
  label: string;
  value: string | number;
  variant?: BadgeVariant;
  valueColor?: string;
  showAsBadge?: boolean;
  className?: string;
}

export function StatBreakdownRow({
  label,
  value,
  variant = 'default',
  valueColor,
  showAsBadge = true,
  className,
}: StatBreakdownRowProps) {
  return (
    <div className={cn('flex items-center justify-between text-xs', className)}>
      <span className="text-muted-foreground">{label}</span>
      {showAsBadge ? (
        <Badge variant={variant} className={cn(valueColor)}>
          {value}
        </Badge>
      ) : (
        <span className={cn('font-medium', valueColor)}>{value}</span>
      )}
    </div>
  );
}
