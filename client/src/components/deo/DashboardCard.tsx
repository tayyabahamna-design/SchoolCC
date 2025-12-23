import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface BreakdownItem {
  label: string;
  value: number;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  color?: string;
}

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  iconGradient: string;
  mainMetric: string | number;
  metricLabel: string;
  breakdown?: BreakdownItem[];
  additionalInfo?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actionLabel: string;
  onActionClick: () => void;
  className?: string;
}

export default function DashboardCard({
  title,
  icon: Icon,
  iconGradient,
  mainMetric,
  metricLabel,
  breakdown,
  additionalInfo,
  badge,
  actionLabel,
  onActionClick,
  className = '',
}: DashboardCardProps) {
  return (
    <Card className={`p-6 hover-lift glass border border-white/30 card-shine ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Main Metric */}
      <div className="mb-4">
        <div className="text-4xl font-bold gradient-text mb-1">{mainMetric}</div>
        <div className="text-sm text-muted-foreground">{metricLabel}</div>
      </div>

      {/* Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="space-y-2 mb-4">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{item.label}:</span>
              <Badge variant={item.variant || 'secondary'} className={item.color}>
                {item.value}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Additional Info */}
      {additionalInfo && (
        <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted/30 rounded-lg">
          {additionalInfo}
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className="mb-4">
          <Badge variant={badge.variant || 'default'} className="text-xs">
            {badge.text}
          </Badge>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={onActionClick}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        size="sm"
      >
        {actionLabel}
      </Button>
    </Card>
  );
}
