import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { GripVertical, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  isEditing?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleVisibility?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: () => void;
  isDragging?: boolean;
  isDragTarget?: boolean;
}

export function DashboardWidget({
  id,
  title,
  children,
  isEditing = false,
  canMoveUp = true,
  canMoveDown = true,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onDragStart,
  onDragEnd,
  onDragOver,
  isDragging = false,
  isDragTarget = false,
}: DashboardWidgetProps) {
  return (
    <Card
      className={`p-4 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isDragTarget ? 'ring-2 ring-primary ring-offset-2' : ''} ${
        isEditing ? 'cursor-move' : ''
      }`}
      draggable={isEditing}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.();
      }}
      data-testid={`widget-${id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isEditing && (
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          )}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        
        {isEditing && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              data-testid={`widget-${id}-move-up`}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              data-testid={`widget-${id}-move-down`}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleVisibility}
              data-testid={`widget-${id}-toggle`}
            >
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
      
      <div className={isEditing ? 'pointer-events-none opacity-75' : ''}>
        {children}
      </div>
    </Card>
  );
}
