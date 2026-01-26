import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { ArrowLeft, Calendar, Clock, FileText, Award, CheckSquare, Trash2, Edit, Eye } from 'lucide-react';
import { useActivities } from '@/contexts/activities';
import { toast } from 'sonner';

export default function AEOActivityLogs() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { getAllActivities, refreshActivities } = useActivities();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const activities = getAllActivities();

  if (!user || user.role !== 'AEO') {
    navigate('/dashboard');
    return null;
  }

  const handleDelete = async (id: string, activityType: 'monitoring' | 'mentoring', aeoId: string) => {
    if (!user?.id || user.id !== aeoId) {
      toast.error('You can only delete your own forms');
      return;
    }

    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/activities/${activityType}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aeoId: user.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete');
      }

      toast.success('Form deleted successfully');
      refreshActivities();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete form');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id: string, activityType: 'monitoring' | 'mentoring') => {
    if (activityType === 'monitoring') {
      navigate(`/edit-monitoring-visit/${id}`);
    } else if (activityType === 'mentoring') {
      navigate(`/edit-mentoring-visit/${id}`);
    }
  };

  const handleView = (id: string, activityType: 'monitoring' | 'mentoring') => {
    if (activityType === 'monitoring') {
      navigate(`/edit-monitoring-visit/${id}`);
    } else if (activityType === 'mentoring') {
      navigate(`/edit-mentoring-visit/${id}`);
    }
  };

  const allItems = [
    ...activities.monitoring.map((item) => ({
      id: item.id,
      aeoId: item.aeoId,
      activityType: 'monitoring' as const,
      type: 'Monitoring Visit',
      date: item.visitDate,
      school: item.schoolName,
      status: item.status,
      icon: 'monitor',
      color: 'blue',
      canDelete: item.aeoId === user?.id,
    })),
    ...activities.mentoring.map((item) => ({
      id: item.id,
      aeoId: item.aeoId,
      activityType: 'mentoring' as const,
      type: 'Mentoring Visit',
      date: item.visitDate,
      school: item.schoolName,
      status: item.status,
      icon: 'award',
      color: 'purple',
      canDelete: item.aeoId === user?.id,
    })),
    ...activities.office.map((item) => ({
      id: item.id,
      aeoId: item.aeoId,
      activityType: 'office' as const,
      type: 'Office Visit',
      date: item.visitDate,
      school: '-',
      status: item.status,
      icon: 'building',
      color: 'emerald',
      canDelete: false,
    })),
    ...activities.other.map((item) => ({
      id: item.id,
      aeoId: item.aeoId,
      activityType: 'other' as const,
      type: item.activityType,
      date: item.activityDate,
      school: '-',
      status: item.status,
      icon: 'checkmark',
      color: 'slate',
      canDelete: false,
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
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
      slate: { bg: 'bg-slate-50 dark:bg-slate-800/30', icon: 'text-muted-foreground', badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-300' },
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
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                        {item.status === 'submitted' ? '✓ Submitted' : 'Draft'}
                      </span>
                      {(item.activityType === 'monitoring' || item.activityType === 'mentoring') && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                            onClick={() => handleView(item.id, item.activityType)}
                            data-testid={`button-view-${item.id}`}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {item.canDelete && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/30"
                                onClick={() => handleEdit(item.id, item.activityType)}
                                data-testid={`button-edit-${item.id}`}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                                onClick={() => handleDelete(item.id, item.activityType, item.aeoId)}
                                disabled={deletingId === item.id}
                                data-testid={`button-delete-${item.id}`}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
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
