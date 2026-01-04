import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronUp, ChevronDown, RotateCcw, GripVertical } from 'lucide-react';
import type { WidgetConfig } from '@/hooks/useDashboardWidgets';

interface CustomizeDashboardModalProps {
  open: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onToggleWidget: (widgetId: string) => void;
  onMoveWidget: (widgetId: string, direction: 'up' | 'down') => void;
  onResetToDefault: () => void;
}

export function CustomizeDashboardModal({
  open,
  onClose,
  widgets,
  onToggleWidget,
  onMoveWidget,
  onResetToDefault,
}: CustomizeDashboardModalProps) {
  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Choose which widgets to show and arrange them in your preferred order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {sortedWidgets.map((widget, index) => (
            <div
              key={widget.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                widget.visible 
                  ? 'bg-card border-border' 
                  : 'bg-muted/50 border-muted'
              }`}
              data-testid={`customize-widget-${widget.id}`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              
              <span className={`flex-1 font-medium ${
                widget.visible ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {widget.title}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onMoveWidget(widget.id, 'up')}
                  disabled={index === 0}
                  data-testid={`customize-${widget.id}-up`}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onMoveWidget(widget.id, 'down')}
                  disabled={index === sortedWidgets.length - 1}
                  data-testid={`customize-${widget.id}-down`}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Switch
                  checked={widget.visible}
                  onCheckedChange={() => onToggleWidget(widget.id)}
                  data-testid={`customize-${widget.id}-toggle`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onResetToDefault}
            className="gap-2"
            data-testid="button-reset-layout"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
          <Button onClick={onClose} data-testid="button-done-customizing">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
