import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Clock, User, School } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActiveVisit {
  id: string;
  aeoId: string;
  aeoName: string;
  schoolName: string;
  startTimestamp: string;
  startLatitude?: string;
  startLongitude?: string;
  status: string;
}

export function ActiveVisitsWidget() {
  const [activeVisits, setActiveVisits] = useState<ActiveVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveVisits = async () => {
      try {
        const response = await fetch('/api/visit-sessions');
        if (response.ok) {
          const allSessions = await response.json();
          const active = allSessions.filter((s: ActiveVisit) => s.status === 'in_progress');
          setActiveVisits(active);
        }
      } catch (error) {
        console.error('Failed to fetch active visits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveVisits();
    const interval = setInterval(fetchActiveVisits, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-500" />
          Active Field Visits
        </h3>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  if (activeVisits.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-500" />
          Active Field Visits
        </h3>
        <p className="text-sm text-muted-foreground">No AEOs are currently on field visits.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-green-500" />
        Active Field Visits
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
          {activeVisits.length} Active
        </span>
      </h3>
      <div className="space-y-3">
        {activeVisits.map((visit) => {
          const startTime = new Date(visit.startTimestamp);
          const duration = formatDistanceToNow(startTime, { addSuffix: false });
          
          return (
            <div
              key={visit.id}
              className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              data-testid={`active-visit-${visit.id}`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="truncate">{visit.aeoName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <School className="w-3 h-3" />
                  <span className="truncate">{visit.schoolName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {duration}
                  </span>
                  {visit.startLatitude && visit.startLongitude && (
                    <span className="flex items-center gap-1 text-green-600">
                      <MapPin className="w-3 h-3" />
                      GPS
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
