import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { LogOut, ClipboardList, CheckSquare, HistoryIcon } from 'lucide-react';
import { useState } from 'react';
import AEOVisitTypeSelector from '@/pages/AEOVisitTypeSelector';

export default function AEOActivityHub() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [showVisitSelector, setShowVisitSelector] = useState(false);
  const [showActivityHistory, setShowActivityHistory] = useState(false);

  if (!user || user.role !== 'AEO') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Activity Management</h1>
            <p className="text-sm text-slate-600 mt-1">Welcome, {user.name}</p>
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">
            Plan Your Next Activity
          </h2>
          <p className="text-lg text-slate-600">
            Start a school visit or log other professional activities
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Plan a Visit Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-slate-200 hover:border-blue-400">
            <div
              onClick={() => setShowVisitSelector(true)}
              data-testid="card-plan-visit"
              className="space-y-6"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Plan a Visit</h3>
                <p className="text-slate-600 mb-4">
                  Conduct school monitoring, mentoring, or office visits
                </p>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Monitoring Visit - Infrastructure & Attendance
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Mentoring Visit - HOTS Development
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Office Visit - Administrative
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-plan-visit">
                Start a Visit
              </Button>
            </div>
          </Card>

          {/* Other Activities Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-slate-200 hover:border-emerald-400">
            <div
              onClick={() => navigate('/aeo-activity/other-activity')}
              data-testid="card-other-activity"
              className="space-y-6"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Other Activities</h3>
                <p className="text-slate-600 mb-4">
                  Log training, meetings, reports, and other professional tasks
                </p>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Training & Professional Development
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Administrative & Coordination
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Community Engagement
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="button-other-activity">
                Log Activity
              </Button>
            </div>
          </Card>
        </div>

        {/* History Card */}
        <Card className="p-8 border-2 border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <HistoryIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Activity History</h3>
                <p className="text-sm text-slate-600">View all your submitted visits and activities</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/aeo-activity/logs')}
              data-testid="button-view-history"
            >
              View History
            </Button>
          </div>
        </Card>
      </div>

      {/* Visit Type Selector Modal */}
      {showVisitSelector && (
        <AEOVisitTypeSelector
          onClose={() => setShowVisitSelector(false)}
          onSelectType={(visitType: string) => {
            setShowVisitSelector(false);
            navigate(`/aeo-activity/${visitType}`);
          }}
        />
      )}
    </div>
  );
}
