import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { ArrowLeft, Calendar, Clock, FileText, Award, CheckSquare } from 'lucide-react';
import { useActivities } from '@/contexts/activities';

export default function AEOActivityLogs() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getAllActivities } = useActivities();
  const activities = getAllActivities();

  if (!user || user.role !== 'AEO') {
    navigate('/dashboard');
    return null;
  }

  const allItems = [
    ...activities.monitoring.map((item) => ({
      type: 'Monitoring Visit',
      date: item.visitDate,
      school: item.schoolName,
      status: item.status,
      icon: 'monitor',
      color: 'blue',
    })),
    ...activities.mentoring.map((item) => ({
      type: 'Mentoring Visit',
      date: item.visitDate,
      school: item.schoolName,
      status: item.status,
      icon: 'award',
      color: 'purple',
    })),
    ...activities.office.map((item) => ({
      type: 'Office Visit',
      date: item.visitDate,
      school: '-',
      status: item.status,
      icon: 'building',
      color: 'emerald',
    })),
    ...activities.other.map((item) => ({
      type: item.activityType,
      date: item.activityDate,
      school: '-',
      status: item.status,
      icon: 'checkmark',
      color: 'slate',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'monitor':
        return FileText;
      case 'award':
        return Award;
      case 'building':
        return FileText;
      case 'checkmark':
        return CheckSquare;
      default:
        return FileText;
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; badge: string }> = {
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' },
      emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800' },
      slate: { bg: 'bg-slate-50', icon: 'text-muted-foreground', badge: 'bg-slate-100 text-slate-800' },
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/aeo-activity/hub')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground ml-4">Activity History</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Monitoring Visits</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activities.monitoring.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Mentoring Visits</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activities.mentoring.length}</p>
              </div>
              <Award className="w-8 h-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Office Visits</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activities.office.length}</p>
              </div>
              <FileText className="w-8 h-8 text-emerald-200" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Other Activities</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activities.other.length}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-slate-200" />
            </div>
          </Card>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {allItems.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No activities logged yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start by planning a visit or logging an activity
              </p>
              <Button
                className="mt-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/aeo-activity/hub')}
              >
                Go to Activity Hub
              </Button>
            </Card>
          ) : (
            allItems.map((item, idx) => {
              const Icon = getIconComponent(item.icon);
              const colors = getColorClasses(item.color);
              const dateObj = new Date(item.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <Card key={idx} className={`p-4 border-l-4 ${colors.bg} hover:shadow-md transition-shadow`} data-testid={`activity-card-${idx}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${colors.bg} ${colors.icon}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.type}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formattedDate}
                          </div>
                          {item.school !== '-' && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {item.school}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                        {item.status === 'submitted' ? '✓ Submitted' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
