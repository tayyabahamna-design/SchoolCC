import { useState, useEffect, useCallback, useRef } from 'react';

export interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  lastModified: string;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'stats', title: 'Quick Stats', visible: true, order: 0 },
  { id: 'requests', title: 'Data Requests', visible: true, order: 1 },
  { id: 'visits', title: 'Recent Visits', visible: true, order: 2 },
  { id: 'activities', title: 'Activities', visible: true, order: 3 },
  { id: 'staff', title: 'Staff Overview', visible: true, order: 4 },
  { id: 'calendar', title: 'Leave Calendar', visible: true, order: 5 },
];

const STORAGE_KEY = 'dashboard_layout';

function loadWidgetsFromStorage(storageKey: string): WidgetConfig[] {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as DashboardLayout;
      return parsed.widgets.sort((a, b) => a.order - b.order);
    }
  } catch (e) {
    console.error('Error loading dashboard layout:', e);
  }
  return [...DEFAULT_WIDGETS];
}

export function useDashboardWidgets(userId: string, userRole: string) {
  const storageKey = `${STORAGE_KEY}_${userId}_${userRole}`;
  const prevStorageKey = useRef(storageKey);
  
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => loadWidgetsFromStorage(storageKey));

  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  useEffect(() => {
    if (prevStorageKey.current !== storageKey) {
      setWidgets(loadWidgetsFromStorage(storageKey));
      prevStorageKey.current = storageKey;
    }
  }, [storageKey]);

  useEffect(() => {
    if (userId !== 'guest') {
      const layout: DashboardLayout = {
        widgets,
        lastModified: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(layout));
    }
  }, [widgets, storageKey, userId]);

  const toggleWidget = useCallback((widgetId: string) => {
    setWidgets(prev => 
      prev.map(w => 
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    );
  }, []);

  const reorderWidgets = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets(prev => {
      const newWidgets = [...prev];
      const [removed] = newWidgets.splice(fromIndex, 1);
      newWidgets.splice(toIndex, 0, removed);
      return newWidgets.map((w, i) => ({ ...w, order: i }));
    });
  }, []);

  const moveWidget = useCallback((widgetId: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const currentIndex = prev.findIndex(w => w.id === widgetId);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(prev.length - 1, currentIndex + 1);
      
      if (currentIndex === newIndex) return prev;
      
      const newWidgets = [...prev];
      const [removed] = newWidgets.splice(currentIndex, 1);
      newWidgets.splice(newIndex, 0, removed);
      return newWidgets.map((w, i) => ({ ...w, order: i }));
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setWidgets([...DEFAULT_WIDGETS]);
  }, []);

  const getVisibleWidgets = useCallback(() => {
    return widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
  }, [widgets]);

  const handleDragStart = useCallback((widgetId: string) => {
    setDraggedWidget(widgetId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null);
  }, []);

  const handleDragOver = useCallback((targetWidgetId: string) => {
    if (!draggedWidget || draggedWidget === targetWidgetId) return;
    
    const fromIndex = widgets.findIndex(w => w.id === draggedWidget);
    const toIndex = widgets.findIndex(w => w.id === targetWidgetId);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderWidgets(fromIndex, toIndex);
    }
  }, [draggedWidget, widgets, reorderWidgets]);

  return {
    widgets,
    visibleWidgets: getVisibleWidgets(),
    draggedWidget,
    toggleWidget,
    reorderWidgets,
    moveWidget,
    resetToDefault,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  };
}
