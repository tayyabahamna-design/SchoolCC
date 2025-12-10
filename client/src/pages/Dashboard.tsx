import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMockDataRequests } from '@/hooks/useMockDataRequests';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useMockVisits } from '@/hooks/useMockVisits';
import { useMockAEOActivities } from '@/hooks/useMockAEOActivities';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { LogOut, Plus, FileText, TrendingUp, Users, Calendar, Building2, MapPin, ClipboardList, CheckSquare, Award, ChevronRight, User, MessageSquare, Edit, School } from 'lucide-react';
import MonitoringVisitForm from '@/pages/MonitoringVisitForm';
import MentoringVisitForm from '@/pages/MentoringVisitForm';
import OfficeVisitForm from '@/pages/OfficeVisitForm';
import OtherActivityForm from '@/pages/OtherActivityForm';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { getRequestsForUser } = useMockDataRequests();
  const { getTeacherStats } = useMockTeacherData();
  const { getVisitsForUser } = useMockVisits();
  const { getAllActivities } = useMockAEOActivities();
  
  const [activeActivityForm, setActiveActivityForm] = useState<string | null>(null);

  if (!user || user.role === 'CEO') {
    navigate('/');
    return null;
  }
  
  const activities = user.role === 'AEO' ? getAllActivities() : null;

  const userRequests = getRequestsForUser(user.id, user.role);
  const pendingCount = userRequests.filter((r) =>
    r.assignees.some((a) => a.userId === user.id && a.status === 'pending')
  ).length;
  const completedCount = userRequests.filter((r) =>
    r.assignees.some((a) => a.userId === user.id && a.status === 'completed')
  ).length;
  const { totalTeachers, presentToday, onLeaveToday, absentToday } = getTeacherStats();

  const dashboardStats = {
    CEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'bg-blue-50' },
      { label: 'Present Today', value: presentToday, icon: TrendingUp, color: 'bg-emerald-50' },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar, color: 'bg-amber-50' },
    ],
    DEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'bg-blue-50' },
      { label: 'Present Today', value: presentToday, icon: TrendingUp, color: 'bg-emerald-50' },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar, color: 'bg-amber-50' },
    ],
    DDEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'bg-blue-50' },
      { label: 'Present Today', value: presentToday, icon: TrendingUp, color: 'bg-emerald-50' },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar, color: 'bg-amber-50' },
    ],
    AEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'bg-blue-50' },
      { label: 'Present Today', value: presentToday, icon: TrendingUp, color: 'bg-emerald-50' },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar, color: 'bg-amber-50' },
    ],
    HEAD_TEACHER: [
      { label: 'Pending Tasks', value: pendingCount, icon: FileText, color: 'bg-orange-50' },
      { label: 'Completed', value: completedCount, icon: TrendingUp, color: 'bg-emerald-50' },
      { label: 'Staff Present Today', value: presentToday, icon: Users, color: 'bg-blue-50' },
    ],
    TEACHER: [
      { label: 'My Tasks', value: pendingCount, icon: FileText, color: 'bg-orange-50' },
      { label: 'Completed', value: completedCount, icon: TrendingUp, color: 'bg-emerald-50' },
      { label: 'Colleagues Present', value: presentToday, icon: Users, color: 'bg-blue-50' },
    ],
  };

  const stats = dashboardStats[user.role];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Quick Actions */}
      <aside className="hidden lg:flex flex-col w-72 glass border-r border-white/20 fixed left-0 top-0 h-screen z-40 animate-slideInLeft">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/20">
          <h1 className="text-xl font-bold gradient-text-gold">SchoolHub</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.role.replace(/_/g, ' ')}</p>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl hover-lift cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
              <p className="text-muted-foreground text-xs truncate">{user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Quick Actions</p>
          <nav className="space-y-2 stagger-children">
            {user.role === 'AEO' && (
              <>
                <button
                  onClick={() => setActiveActivityForm('visit-selector')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-transparent transition-all duration-300 group press-effect"
                  data-testid="button-plan-visit"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Plan a Visit</span>
                </button>
                <button
                  onClick={() => setActiveActivityForm('other-activity')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-emerald-100/80 hover:to-transparent transition-all duration-300 group press-effect"
                  data-testid="button-log-activity"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Log Activity</span>
                </button>
              </>
            )}
            {user.role === 'HEAD_TEACHER' && (
              <>
                <button
                  onClick={() => navigate('/edit-school')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-teal-100/80 hover:to-transparent transition-all duration-300 group press-effect"
                  data-testid="button-edit-school"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <School className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Edit School</span>
                </button>
                <button
                  onClick={() => navigate('/collaborative-forms')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-blue-100/80 hover:to-transparent transition-all duration-300 group press-effect"
                  data-testid="button-collaborative-forms"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Collaborative Forms</span>
                </button>
              </>
            )}
            {(user.role === 'AEO' || user.role === 'HEAD_TEACHER' || user.role === 'DEO' || user.role === 'DDEO') && (
              <button
                onClick={() => navigate('/create-request')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-violet-100/80 hover:to-transparent transition-all duration-300 group press-effect"
                data-testid="button-create-request"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">Create Request</span>
              </button>
            )}
            
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Navigate</p>
            </div>
            
            <button
              onClick={() => navigate('/data-requests')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-transparent transition-all duration-300 group press-effect"
              data-testid="button-view-requests"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">All Requests</span>
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-blue-100/80 hover:to-transparent transition-all duration-300 group press-effect"
              data-testid="button-view-calendar"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">Leave Calendar</span>
            </button>
            <button
              onClick={() => navigate('/school-data')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-teal-100/80 hover:to-transparent transition-all duration-300 group press-effect"
              data-testid="button-view-schools"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">School Inventory</span>
            </button>
            {(user.role === 'AEO' || user.role === 'DEO' || user.role === 'DDEO') && (
              <button
                onClick={() => navigate('/school-visits')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-rose-100/80 hover:to-transparent transition-all duration-300 group press-effect"
                data-testid="button-view-visits"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">School Visits</span>
              </button>
            )}
            <button
              onClick={() => navigate('/queries')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-purple-100/80 hover:to-transparent transition-all duration-300 group press-effect"
              data-testid="button-view-queries"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">Queries</span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20">
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
            onClick={() => {
              logout();
              navigate('/');
            }}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72">
        {/* Mobile Header */}
        <div className="lg:hidden glass border-b border-white/20 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold gradient-text-gold">SchoolHub</h1>
              <p className="text-sm text-muted-foreground">{user.name} • {user.role.replace(/_/g, ' ')}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
              data-testid="button-logout-mobile"
              className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Mobile Quick Actions Scroll */}
          <div className="px-4 pb-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {user.role === 'AEO' && (
                <>
                  <Button
                    onClick={() => setActiveActivityForm('visit-selector')}
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-0"
                    data-testid="button-plan-visit-mobile"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Plan Visit
                  </Button>
                  <Button
                    onClick={() => setActiveActivityForm('other-activity')}
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-0"
                    data-testid="button-log-activity-mobile"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Log Activity
                  </Button>
                </>
              )}
              <Button
                onClick={() => navigate('/data-requests')}
                size="sm"
                className="rounded-full bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-0"
                data-testid="button-view-requests-mobile"
              >
                <FileText className="w-4 h-4" />
                Requests
              </Button>
              <Button
                onClick={() => navigate('/calendar')}
                size="sm"
                className="rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-0"
                data-testid="button-view-calendar-mobile"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </Button>
              <Button
                onClick={() => navigate('/school-data')}
                size="sm"
                className="rounded-full bg-gradient-to-r from-teal-400 to-teal-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-0"
                data-testid="button-view-schools-mobile"
              >
                <Building2 className="w-4 h-4" />
                Schools
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block glass border-b border-white/20 sticky top-0 z-30">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold gradient-text">Welcome back, {user.name}</h1>
            <p className="text-base text-muted-foreground mt-1">Here's your dashboard overview</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 lg:px-8 py-6 lg:py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 stagger-children">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-emerald-500 to-emerald-600',
                'from-amber-500 to-amber-600',
              ];
              return (
                <Card 
                  key={idx} 
                  className="p-6 lg:p-8 hover-lift cursor-pointer card-shine glass border border-white/30"
                  onClick={() => navigate('/data-requests')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm lg:text-base font-medium text-muted-foreground mb-2">{stat.label}</p>
                      <p className="stat-number gradient-text">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${gradients[idx % 3]} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* AEO Activity Summary */}
        {user.role === 'AEO' && activities && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold gradient-text mb-6">Your Activities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              <Card className="p-6 hover-lift cursor-pointer glass border border-blue-200/50 card-shine">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '0s'}}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monitoring</p>
                    <p className="text-3xl font-bold gradient-text">{activities.monitoring.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 hover-lift cursor-pointer glass border border-purple-200/50 card-shine">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '0.5s'}}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mentoring</p>
                    <p className="text-3xl font-bold gradient-text">{activities.mentoring.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 hover-lift cursor-pointer glass border border-emerald-200/50 card-shine">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '1s'}}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Office</p>
                    <p className="text-3xl font-bold gradient-text">{activities.office.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 hover-lift cursor-pointer glass border border-slate-200/50 card-shine">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '1.5s'}}>
                    <CheckSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Other</p>
                    <p className="text-3xl font-bold gradient-text">{activities.other.length}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Recent Requests */}
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-6">Recent Activity</h2>
          {userRequests.length === 0 ? (
            <Card className="p-12 text-center glass border border-white/30">
              <p className="text-lg text-muted-foreground">No requests yet</p>
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden glass border border-white/30">
              <ul className="divide-y divide-white/20">
                {userRequests.slice(0, 5).map((req, idx) => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/request/${req.id}`)}
                    style={{animationDelay: `${idx * 0.1}s`}}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-foreground group-hover:text-amber-700 transition-colors">{req.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Due: {req.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/request/${req.id}`);
                      }}
                      data-testid={`button-view-request-${req.id}`}
                    >
                      View
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
        </div>
      </div>

      {/* Activity Forms Modal */}
      {user.role === 'AEO' && activeActivityForm === 'visit-selector' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Select Visit Type</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveActivityForm(null)}
                  data-testid="button-close-modal"
                  className="rounded-full"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4 mb-8">
                <Card
                  className="p-6 cursor-pointer card-interactive border-2 border-transparent hover:border-blue-400"
                  onClick={() => setActiveActivityForm('monitoring')}
                  data-testid="card-visit-type-monitoring"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">Monitoring Visit</h3>
                      <p className="text-muted-foreground">Infrastructure, attendance & facilities</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                </Card>

                <Card
                  className="p-6 cursor-pointer card-interactive border-2 border-transparent hover:border-purple-400"
                  onClick={() => setActiveActivityForm('mentoring')}
                  data-testid="card-visit-type-mentoring"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                      <Award className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">Mentoring Visit</h3>
                      <p className="text-muted-foreground">Higher-Order Thinking Skills (HOTS)</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                </Card>

                <Card
                  className="p-6 cursor-pointer card-interactive border-2 border-transparent hover:border-emerald-400"
                  onClick={() => setActiveActivityForm('office')}
                  data-testid="card-visit-type-office"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">Office Visit</h3>
                      <p className="text-muted-foreground">Administrative tasks & coordination</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                </Card>
              </div>

              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => setActiveActivityForm(null)}
                data-testid="button-cancel-visit-selector"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Monitoring Visit Form */}
      {activeActivityForm === 'monitoring' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-4xl my-8 animate-slideUp">
            <div className="bg-card rounded-2xl shadow-2xl">
              <MonitoringVisitForm onClose={() => setActiveActivityForm(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Mentoring Visit Form */}
      {activeActivityForm === 'mentoring' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-4xl my-8 animate-slideUp">
            <div className="bg-card rounded-2xl shadow-2xl">
              <MentoringVisitForm onClose={() => setActiveActivityForm(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Office Visit Form */}
      {activeActivityForm === 'office' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl my-8 animate-slideUp">
            <div className="bg-card rounded-2xl shadow-2xl">
              <OfficeVisitForm onClose={() => setActiveActivityForm(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Other Activity Form */}
      {activeActivityForm === 'other-activity' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl my-8 animate-slideUp">
            <div className="bg-card rounded-2xl shadow-2xl">
              <OtherActivityForm onClose={() => setActiveActivityForm(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
