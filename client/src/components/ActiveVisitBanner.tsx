import { useState } from 'react';
import { useVisitSession } from '@/contexts/visit-session';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Clock, Square, FileText, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActiveVisitBannerProps {
  onOpenMonitoringForm?: () => void;
  onOpenMentoringForm?: () => void;
}

export function ActiveVisitBanner({ onOpenMonitoringForm, onOpenMentoringForm }: ActiveVisitBannerProps) {
  const { activeSession, endVisit, cancelVisit, isLoading } = useVisitSession();
  const [showEndOptions, setShowEndOptions] = useState(false);

  if (!activeSession) return null;

  const startTime = new Date(activeSession.startTimestamp);
  const duration = formatDistanceToNow(startTime, { addSuffix: false });

  const handleEndVisit = async () => {
    const completedSession = await endVisit();
    if (completedSession) {
      setShowEndOptions(true);
    }
  };

  return (
    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              Active Visit: {activeSession.schoolName}
            </h3>
            <div className="flex items-center gap-4 text-sm text-green-600 dark:text-green-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {duration}
              </span>
              {activeSession.startLatitude && activeSession.startLongitude && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  GPS Tracked
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMonitoringForm && (
            <Button
              size="sm"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={onOpenMonitoringForm}
              data-testid="button-open-monitoring-form"
            >
              <FileText className="w-4 h-4 mr-1" />
              Monitoring Form
            </Button>
          )}
          {onOpenMentoringForm && (
            <Button
              size="sm"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={onOpenMentoringForm}
              data-testid="button-open-mentoring-form"
            >
              <FileText className="w-4 h-4 mr-1" />
              Mentoring Form
            </Button>
          )}
          <Button
            size="sm"
            variant="default"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleEndVisit}
            disabled={isLoading}
            data-testid="button-end-visit"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Square className="w-4 h-4 mr-1" />
                End Visit
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
