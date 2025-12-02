import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMockDataRequests } from '@/hooks/useMockDataRequests';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useMockVisits } from '@/hooks/useMockVisits';
import { useLocation } from 'wouter';
import { LogOut, Plus, FileText, TrendingUp, Users, Calendar, Building2, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { getRequestsForUser } = useMockDataRequests();
  const { getTeacherStats } = useMockTeacherData();
  const { getVisitsForUser } = useMockVisits();

  if (!user) {
    navigate('/');
    return null;
  }

  const userRequests = getRequestsForUser(user.id, user.role);
  const pendingCount = userRequests.filter((r) =>
    r.assignees.some((a) => a.userId === user.id && a.status === 'pending')
  ).length;
  const completedCount = userRequests.filter((r) =>
    r.assignees.some((a) => a.userId === user.id && a.status === 'completed')
  ).length;
  const { totalTeachers, presentToday, onLeaveToday, absentToday } = getTeacherStats();

  const dashboardStats = {
    DEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users },
      { label: 'Present Today', value: presentToday, icon: TrendingUp },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar },
    ],
    DDEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users },
      { label: 'Present Today', value: presentToday, icon: TrendingUp },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar },
    ],
    AEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users },
      { label: 'Present Today', value: presentToday, icon: TrendingUp },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar },
    ],
    HEAD_TEACHER: [
      { label: 'Pending Tasks', value: pendingCount, icon: FileText },
      { label: 'Completed', value: completedCount, icon: TrendingUp },
      { label: 'Staff Present Today', value: presentToday, icon: Users },
    ],
    TEACHER: [
      { label: 'My Tasks', value: pendingCount, icon: FileText },
      { label: 'Completed', value: completedCount, icon: TrendingUp },
      { label: 'Colleagues Present', value: presentToday, icon: Users },
    ],
  };

  const stats = dashboardStats[user.role];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.role.replace(/_/g, ' ')}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              navigate('/');
            }}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 text-primary/20" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.role === 'HEAD_TEACHER' && (
              <Button
                onClick={() => navigate('/collaborative-forms')}
                size="lg"
                className="h-auto py-4"
                data-testid="button-collaborative-forms"
              >
                <Plus className="w-5 h-5 mr-2" />
                Collaborative Forms
              </Button>
            )}
            {(user.role === 'AEO' || user.role === 'HEAD_TEACHER' || user.role === 'DEO' || user.role === 'DDEO') && (
              <Button
                onClick={() => navigate('/create-request')}
                size="lg"
                className="h-auto py-4"
                data-testid="button-create-request"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Data Request
              </Button>
            )}
            <Button
              onClick={() => navigate('/data-requests')}
              variant="secondary"
              size="lg"
              className="h-auto py-4"
              data-testid="button-view-requests"
            >
              <FileText className="w-5 h-5 mr-2" />
              View All Requests
            </Button>
            <Button
              onClick={() => navigate('/calendar')}
              variant="secondary"
              size="lg"
              className="h-auto py-4"
              data-testid="button-view-calendar"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Staff Leave Calendar
            </Button>
            <Button
              onClick={() => navigate('/school-data')}
              variant="secondary"
              size="lg"
              className="h-auto py-4"
              data-testid="button-view-schools"
            >
              <Building2 className="w-5 h-5 mr-2" />
              School Inventory
            </Button>
            {(user.role === 'AEO' || user.role === 'DEO' || user.role === 'DDEO') && (
              <Button
                onClick={() => navigate('/school-visits')}
                variant="secondary"
                size="lg"
                className="h-auto py-4"
                data-testid="button-view-visits"
              >
                <MapPin className="w-5 h-5 mr-2" />
                School Visits
              </Button>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
          {userRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No requests yet</p>
            </Card>
          ) : (
            <Card className="p-6">
              <ul className="space-y-4">
                {userRequests.slice(0, 5).map((req) => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{req.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {req.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/request/${req.id}`)}
                      data-testid={`button-view-request-${req.id}`}
                    >
                      View
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
