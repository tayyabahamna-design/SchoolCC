import { useAuth } from '@/contexts/auth';
import { useActivities } from '@/contexts/activities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMockDataRequests } from '@/hooks/useMockDataRequests';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useMockVisits } from '@/hooks/useMockVisits';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { LogOut, Plus, FileText, TrendingUp, Users, Calendar, Building2, MapPin, ClipboardList, CheckSquare, Award, ChevronRight, User, MessageSquare, Edit, School, Settings2, BookOpen, HelpCircle, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MonitoringVisitForm from '@/pages/MonitoringVisitForm';
import MentoringVisitForm from '@/pages/MentoringVisitForm';
import OfficeVisitForm from '@/pages/OfficeVisitForm';
import OtherActivityForm from '@/pages/OtherActivityForm';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MetricCard, TeacherDetailsDialog, CustomizeDashboardModal } from '@/components/dashboard';
import { analytics } from '@/lib/analytics';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { getRequestsForUser } = useMockDataRequests();
  const { getTeacherStats, getStaffStats, teachers, leaves } = useMockTeacherData(user?.assignedSchools);
  const { getVisitsForUser } = useMockVisits();
  const { getAllActivities } = useActivities();

  const { toast } = useToast();
  const [activeActivityForm, setActiveActivityForm] = useState<string | null>(null);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [teacherDialogType, setTeacherDialogType] = useState<'total' | 'present' | 'onLeave' | 'absent'>('total');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const {
    widgets,
    visibleWidgets,
    draggedWidget,
    toggleWidget,
    moveWidget,
    resetToDefault,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  } = useDashboardWidgets(user?.id || 'guest', user?.role || 'TEACHER');

  // Handle redirects in useEffect to avoid updating state during render
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (user.role === 'CEO') {
      navigate('/');
      return;
    }
    if (user.role === 'DEO' || user.role === 'DDEO') {
      navigate('/deo-dashboard');
      return;
    }
    analytics.navigation.dashboardViewed(user.role);
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      getRequestsForUser(user.id, user.role).then((requests) => {
        if (Array.isArray(requests)) {
          setUserRequests(requests);
        }
      }).catch(() => {
        setUserRequests([]);
      });
    }
  }, [user, getRequestsForUser]);

  // Return null while redirecting
  if (!user || user.role === 'CEO' || user.role === 'DEO') {
    return null;
  }
  
  const activities = user.role === 'AEO' ? getAllActivities() : null;

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'stats':
        if (!stats) return null;
        return (
          <div key="stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 stagger-children" data-testid="widget-stats">
            {stats.map((stat, idx) => {
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-emerald-500 to-emerald-600',
                'from-amber-500 to-amber-600',
              ];
              const getClickHandler = () => {
                // For teachers, all stats show "Coming Soon"
                if (user.role === 'TEACHER') {
                  return () => toast({
                    title: "Coming Soon!",
                    description: "This feature is under development.",
                  });
                }
                if ('taskType' in stat) return () => navigate('/data-requests');
                if ('teacherType' in stat) return () => openTeacherDialog(stat.teacherType);
                return undefined;
              };
              return (
                <MetricCard
                  key={idx}
                  value={stat.value}
                  label={stat.label}
                  icon={stat.icon}
                  iconGradient={gradients[idx % 3]}
                  size="xl"
                  onClick={getClickHandler()}
                  className="hover-lift card-shine"
                />
              );
            })}
          </div>
        );
      
      case 'activities':
        if (user.role !== 'AEO' || !activities) return null;
        return (
          <div key="activities" data-testid="widget-activities">
            <h2 className="text-2xl font-bold gradient-text mb-6">Your Activities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              <MetricCard
                value={activities.monitoring.length}
                label="Monitoring"
                icon={FileText}
                iconGradient="from-blue-400 to-blue-600"
                size="xl"
                onClick={() => setActiveActivityForm('monitoring')}
                className="hover-lift card-shine border-blue-200/50 dark:border-blue-800/50"
                data-testid="card-monitoring-activity"
              />
              <MetricCard
                value={activities.mentoring.length}
                label="Mentoring"
                icon={Award}
                iconGradient="from-purple-400 to-purple-600"
                size="xl"
                onClick={() => setActiveActivityForm('mentoring')}
                className="hover-lift card-shine border-purple-200/50 dark:border-purple-800/50"
                data-testid="card-mentoring-activity"
              />
              <MetricCard
                value={activities.office.length}
                label="Office"
                icon={Building2}
                iconGradient="from-emerald-400 to-emerald-600"
                size="xl"
                onClick={() => setActiveActivityForm('office')}
                className="hover-lift card-shine border-emerald-200/50 dark:border-emerald-800/50"
                data-testid="card-office-activity"
              />
              <MetricCard
                value={activities.other.length}
                label="Other"
                icon={CheckSquare}
                iconGradient="from-slate-400 to-slate-600"
                size="xl"
                onClick={() => setActiveActivityForm('other-activity')}
                className="hover-lift card-shine border-slate-200/50 dark:border-slate-700/50"
                data-testid="card-other-activity"
              />
            </div>
          </div>
        );
      
      case 'requests':
        // Teaching quotes for teachers
        const teachingQuotes = [
          { text: "A teacher affects eternity; they can never tell where their influence stops.", author: "Henry Adams", gradient: "from-purple-500 to-pink-500" },
          { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren", gradient: "from-blue-500 to-cyan-500" },
          { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats", gradient: "from-orange-500 to-red-500" },
          { text: "Teaching is the greatest act of optimism.", author: "Colleen Wilcox", gradient: "from-emerald-500 to-teal-500" },
          { text: "The best teachers teach from the heart, not from the book.", author: "Unknown", gradient: "from-rose-500 to-pink-500" },
          { text: "Teachers plant seeds of knowledge that grow forever.", author: "Unknown", gradient: "from-violet-500 to-purple-500" },
          { text: "A good teacher can inspire hope and ignite the imagination.", author: "Brad Henry", gradient: "from-amber-500 to-orange-500" },
          { text: "Teaching kids to count is fine, but teaching them what counts is best.", author: "Bob Talbert", gradient: "from-indigo-500 to-blue-500" },
          { text: "The influence of a good teacher can never be erased.", author: "Unknown", gradient: "from-pink-500 to-rose-500" },
          { text: "Great teachers empathize with kids and inspire them to learn.", author: "Unknown", gradient: "from-teal-500 to-emerald-500" },
        ];
        
        // Coaching tips for Head Teachers to enhance learning gains
        const coachingTips = [
          { text: "Observe lessons weekly and give specific, actionable feedback within 24 hours.", category: "Classroom Observation", gradient: "from-indigo-500 to-purple-500" },
          { text: "Model effective teaching strategies by co-teaching challenging lessons with your staff.", category: "Lead by Example", gradient: "from-emerald-500 to-teal-500" },
          { text: "Set clear learning goals with each teacher and track student progress together monthly.", category: "Goal Setting", gradient: "from-amber-500 to-orange-500" },
          { text: "Create peer learning groups where teachers share successful strategies with each other.", category: "Collaboration", gradient: "from-blue-500 to-cyan-500" },
          { text: "Celebrate small wins publicly - recognition motivates teachers to keep improving.", category: "Recognition", gradient: "from-pink-500 to-rose-500" },
          { text: "Ask teachers: 'What support do you need?' - then remove obstacles for them.", category: "Support", gradient: "from-violet-500 to-purple-500" },
          { text: "Focus feedback on student learning outcomes, not just teaching techniques.", category: "Student-Centered", gradient: "from-teal-500 to-emerald-500" },
          { text: "Encourage teachers to visit each other's classrooms and share best practices.", category: "Peer Observation", gradient: "from-rose-500 to-pink-500" },
          { text: "Use data from assessments to guide coaching conversations with teachers.", category: "Data-Driven", gradient: "from-cyan-500 to-blue-500" },
          { text: "Build trust first - teachers improve faster when they feel supported, not judged.", category: "Trust Building", gradient: "from-orange-500 to-amber-500" },
        ];
        
        // Shuffle and pick a random quote/tip on each page visit
        const shuffledQuotes = [...teachingQuotes].sort(() => Math.random() - 0.5);
        const shuffledTips = [...coachingTips].sort(() => Math.random() - 0.5);
        const dailyQuote = shuffledQuotes[0];
        const dailyTip = shuffledTips[0];
        
        if (user.role === 'HEAD_TEACHER') {
          return (
            <div key="requests" data-testid="widget-coaching-tip">
              <h2 className="text-2xl font-bold gradient-text mb-6">Coaching Tip of the Day</h2>
              <Card className="p-8 bg-white dark:bg-card border border-border shadow-xl overflow-hidden relative">
                <div className="relative">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-gradient-to-r ${dailyTip.gradient} text-white`}>
                    {dailyTip.category}
                  </div>
                  <p className={`text-xl md:text-2xl font-medium leading-relaxed mb-4 bg-gradient-to-r ${dailyTip.gradient} bg-clip-text text-transparent`}>
                    {dailyTip.text}
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    💡 Tip: Great coaching leads to better teaching and improved student learning!
                  </p>
                </div>
              </Card>
            </div>
          );
        }
        
        if (user.role === 'TEACHER') {
          return (
            <div key="requests" data-testid="widget-quote">
              <h2 className="text-2xl font-bold gradient-text mb-6">Today's Inspiration</h2>
              <Card className="p-8 bg-white dark:bg-card border border-border shadow-xl overflow-hidden relative">
                <div className="relative">
                  <div className={`text-5xl mb-4 bg-gradient-to-r ${dailyQuote.gradient} bg-clip-text text-transparent`}>"</div>
                  <p className={`text-xl md:text-2xl font-medium leading-relaxed mb-4 bg-gradient-to-r ${dailyQuote.gradient} bg-clip-text text-transparent`}>
                    {dailyQuote.text}
                  </p>
                  <p className={`text-sm font-medium bg-gradient-to-r ${dailyQuote.gradient} bg-clip-text text-transparent`}>— {dailyQuote.author}</p>
                </div>
              </Card>
            </div>
          );
        }
        
        return (
          <div key="requests" data-testid="widget-requests">
            <h2 className="text-2xl font-bold gradient-text mb-6">Recent Activity</h2>
            {userRequests.length === 0 ? (
              <Card className="p-12 text-center bg-card border border-border">
                <p className="text-lg text-muted-foreground">No requests yet</p>
              </Card>
            ) : (
              <Card className="p-0 overflow-hidden bg-card border border-border">
                <ul className="divide-y divide-border">
                  {userRequests.slice(0, 5).map((req, idx) => (
                    <li
                      key={req.id}
                      className="flex items-center justify-between p-6 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-all duration-300 cursor-pointer group"
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
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-700"
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
        );
      
      case 'staff':
        if (user.role === 'TEACHER') return null;
        // Head Teacher only sees their school's teachers
        if (user.role === 'HEAD_TEACHER') {
          return (
            <div key="staff" data-testid="widget-staff">
              <h2 className="text-2xl font-bold gradient-text mb-6">My School Staff</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
                <MetricCard
                  value={staffStats.teachers.total}
                  label="Teachers"
                  icon={Users}
                  iconGradient="from-blue-500 to-blue-600"
                  size="lg"
                  breakdown={[
                    { label: 'Present', value: staffStats.teachers.present, valueColor: 'text-emerald-600', showAsBadge: false },
                    { label: 'On Leave', value: staffStats.teachers.onLeave, valueColor: 'text-amber-600', showAsBadge: false },
                  ]}
                  className="hover-lift card-shine"
                />
              </div>
            </div>
          );
        }
        return (
          <div key="staff" data-testid="widget-staff">
            <h2 className="text-2xl font-bold gradient-text mb-6">Staff Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
              <MetricCard
                value={staffStats.aeos.total}
                label="AEOs"
                icon={Award}
                iconGradient="from-purple-500 to-purple-600"
                size="lg"
                breakdown={[
                  { label: 'Present', value: staffStats.aeos.present, valueColor: 'text-emerald-600', showAsBadge: false },
                  { label: 'On Leave', value: staffStats.aeos.onLeave, valueColor: 'text-amber-600', showAsBadge: false },
                ]}
                className="hover-lift card-shine"
              />
              <MetricCard
                value={staffStats.headTeachers.total}
                label="Head Teachers"
                icon={Building2}
                iconGradient="from-teal-500 to-teal-600"
                size="lg"
                breakdown={[
                  { label: 'Present', value: staffStats.headTeachers.present, valueColor: 'text-emerald-600', showAsBadge: false },
                  { label: 'On Leave', value: staffStats.headTeachers.onLeave, valueColor: 'text-amber-600', showAsBadge: false },
                ]}
                className="hover-lift card-shine"
              />
              <MetricCard
                value={staffStats.teachers.total}
                label="Teachers"
                icon={Users}
                iconGradient="from-blue-500 to-blue-600"
                size="lg"
                breakdown={[
                  { label: 'Present', value: staffStats.teachers.present, valueColor: 'text-emerald-600', showAsBadge: false },
                  { label: 'On Leave', value: staffStats.teachers.onLeave, valueColor: 'text-amber-600', showAsBadge: false },
                ]}
                className="hover-lift card-shine"
              />
            </div>
          </div>
        );
      
      case 'visits':
        if (user.role === 'TEACHER' || user.role === 'HEAD_TEACHER') return null;
        return (
          <div key="visits" data-testid="widget-visits">
            <h2 className="text-2xl font-bold gradient-text mb-6">Recent Visits</h2>
            <Card className="p-6 bg-card border border-border">
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">View your school visits</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/school-visits')}
                  data-testid="button-view-all-visits"
                >
                  View All Visits
                </Button>
              </div>
            </Card>
          </div>
        );
      
      case 'calendar':
        // Teaching tips for teachers
        const allTeachingTips = [
          { tip: "Start each class with a quick review of the previous lesson to refresh students' memory.", icon: "🔄", color: "from-blue-500 to-cyan-500" },
          { tip: "Use visual aids like charts and diagrams to explain complex concepts.", icon: "📊", color: "from-purple-500 to-pink-500" },
          { tip: "Encourage students to ask questions - there are no silly questions!", icon: "❓", color: "from-emerald-500 to-teal-500" },
          { tip: "Give positive feedback to boost student confidence and motivation.", icon: "⭐", color: "from-amber-500 to-orange-500" },
          { tip: "Break down large tasks into smaller, manageable steps for students.", icon: "📝", color: "from-rose-500 to-red-500" },
          { tip: "Use real-life examples to make lessons more relatable and engaging.", icon: "🌍", color: "from-indigo-500 to-blue-500" },
          { tip: "Create a safe learning environment where mistakes are seen as opportunities.", icon: "🛡️", color: "from-teal-500 to-emerald-500" },
          { tip: "Include group activities to develop teamwork and communication skills.", icon: "👥", color: "from-violet-500 to-purple-500" },
          { tip: "Take short breaks during long lessons to maintain student attention.", icon: "⏸️", color: "from-pink-500 to-rose-500" },
          { tip: "End each lesson with a summary of key points learned today.", icon: "📌", color: "from-cyan-500 to-blue-500" },
          { tip: "Celebrate small achievements to keep students motivated.", icon: "🎉", color: "from-orange-500 to-amber-500" },
          { tip: "Use storytelling to make lessons memorable and interesting.", icon: "📖", color: "from-red-500 to-rose-500" },
        ];
        
        // Shuffle and pick 3 random tips on each render
        const shuffledTeachingTips = [...allTeachingTips].sort(() => Math.random() - 0.5);
        const randomTips = shuffledTeachingTips.slice(0, 3);
        
        if (user.role === 'TEACHER') {
          return (
            <div key="calendar" data-testid="widget-tips">
              <h2 className="text-2xl font-bold gradient-text mb-6">Teaching Tips</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {randomTips.map((item, idx) => (
                  <Card key={idx} className="p-5 bg-white dark:bg-card border border-border shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{item.icon}</div>
                      <p className={`text-sm font-medium bg-gradient-to-r ${item.color} bg-clip-text text-transparent leading-relaxed`}>
                        {item.tip}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        }
        
        return (
          <div key="calendar" data-testid="widget-calendar">
            <h2 className="text-2xl font-bold gradient-text mb-6">Leave Calendar</h2>
            <Card className="p-6 bg-card border border-border">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Manage leaves and attendance</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/calendar')}
                  data-testid="button-view-calendar"
                >
                  Open Calendar
                </Button>
              </div>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  const pendingCount = userRequests.filter((r) =>
    r.assignees?.some((a: any) => a.userId === user.id && a.status === 'pending')
  ).length;
  const completedCount = userRequests.filter((r) =>
    r.assignees?.some((a: any) => a.userId === user.id && a.status === 'completed')
  ).length;
  const { totalTeachers, presentToday, onLeaveToday, absentToday } = getTeacherStats();
  const staffStats = getStaffStats();

  const openTeacherDialog = (type: 'total' | 'present' | 'onLeave' | 'absent') => {
    setTeacherDialogType(type);
    setTeacherDialogOpen(true);
  };

  const dashboardStats = {
    CEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'bg-blue-50', teacherType: 'total' as const },
      { label: 'Present Today', value: presentToday, icon: TrendingUp, color: 'bg-emerald-50', teacherType: 'present' as const },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar, color: 'bg-amber-50', teacherType: 'onLeave' as const },
    ],
    DEO: null,
    DDEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'bg-blue-50', teacherType: 'total' as const },
      { label: 'Present Today', value: presentToday, icon: TrendingUp, color: 'bg-emerald-50', teacherType: 'present' as const },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar, color: 'bg-amber-50', teacherType: 'onLeave' as const },
    ],
    AEO: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'bg-blue-50', teacherType: 'total' as const },
      { label: 'Present Today', value: presentToday, icon: TrendingUp, color: 'bg-emerald-50', teacherType: 'present' as const },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar, color: 'bg-amber-50', teacherType: 'onLeave' as const },
    ],
    HEAD_TEACHER: [
      { label: 'Pending Tasks', value: pendingCount, icon: FileText, color: 'bg-orange-50', taskType: 'pending' as const },
      { label: 'Completed', value: completedCount, icon: TrendingUp, color: 'bg-emerald-50', taskType: 'completed' as const },
      { label: 'Lesson Plans', value: 0, icon: BookOpen, color: 'bg-blue-50' },
    ],
    TEACHER: [
      { label: 'My Tasks', value: pendingCount, icon: FileText, color: 'bg-orange-50', taskType: 'pending' as const },
      { label: 'Completed', value: completedCount, icon: TrendingUp, color: 'bg-emerald-50', taskType: 'completed' as const },
      { label: 'Lesson Plans', value: 0, icon: BookOpen, color: 'bg-blue-50' },
    ],
    TRAINING_MANAGER: [
      { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'bg-blue-50', teacherType: 'total' as const },
      { label: 'Present Today', value: presentToday, icon: TrendingUp, color: 'bg-emerald-50', teacherType: 'present' as const },
      { label: 'On Leave Today', value: onLeaveToday, icon: Calendar, color: 'bg-amber-50', teacherType: 'onLeave' as const },
    ],
  };

  const stats = dashboardStats[user.role as keyof typeof dashboardStats];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card/95 dark:bg-card backdrop-blur-xl border-r border-border animate-slideInLeft overflow-y-auto"
            data-testid="mobile-sidebar"
          >
            {/* Mobile Sidebar Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/taleemhub-logo.png" alt="TaleemHub Logo" className="w-12 h-12" />
                <div>
                  <h1 className="text-lg font-bold gradient-text-gold">TaleemHub</h1>
                  <p className="text-xs text-muted-foreground">{user.role.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSidebar(false)}
                data-testid="button-close-menu"
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Sidebar Content */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Quick Actions</p>
              
              {user.role === 'TEACHER' && (
                <button
                  onClick={() => { navigate('/leave-calendar'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-cyan-100/80 dark:hover:bg-cyan-900/30 transition-all duration-300 group"
                  data-testid="mobile-button-leave-calendar"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Leave Calendar</span>
                </button>
              )}
              
              {user.role === 'HEAD_TEACHER' && (
                <>
                  <button
                    onClick={() => { navigate('/staff-leave-calendar'); setShowMobileSidebar(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-cyan-100/80 dark:hover:bg-cyan-900/30 transition-all duration-300 group"
                    data-testid="mobile-button-staff-leave"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-foreground">Staff Leave Calendar</span>
                  </button>
                  <button
                    onClick={() => { navigate('/collaborative-forms'); setShowMobileSidebar(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-300 group"
                    data-testid="mobile-button-collab-forms"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-foreground">Collaborative Forms</span>
                  </button>
                  <button
                    onClick={() => { navigate('/headteacher-user-management'); setShowMobileSidebar(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 transition-all duration-300 group"
                    data-testid="mobile-button-manage-teachers"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-md">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-foreground">Manage Teachers</span>
                  </button>
                </>
              )}
              
              {(user.role === 'AEO' || user.role === 'HEAD_TEACHER' || user.role === 'DDEO') && (
                <button
                  onClick={() => { navigate('/create-request'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-300 group"
                  data-testid="mobile-button-create-request"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-md">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Create Request</span>
                </button>
              )}
              
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Navigate</p>
              </div>
              
              <button
                onClick={() => { navigate('/data-requests'); setShowMobileSidebar(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-all duration-300 group"
                data-testid="mobile-button-data-requests"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">Data Requests</span>
              </button>
              
              {user.role === 'TEACHER' || user.role === 'HEAD_TEACHER' ? (
                <button
                  onClick={() => { navigate('/community-album'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-pink-100/80 dark:hover:bg-pink-900/30 transition-all duration-300 group"
                  data-testid="mobile-button-community-album"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-md">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Community Album</span>
                </button>
              ) : (
                <button
                  onClick={() => { navigate('/school-data'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-300 group"
                  data-testid="mobile-button-school-inventory"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-md">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">School Inventory</span>
                </button>
              )}
              
              {(user.role === 'AEO' || user.role === 'DDEO') && (
                <button
                  onClick={() => { navigate('/school-visits'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-rose-100/80 dark:hover:bg-rose-900/30 transition-all duration-300 group"
                  data-testid="mobile-button-school-visits"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center shadow-md">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">School Visits</span>
                </button>
              )}
              
              {user.role === 'DDEO' && (
                <button
                  onClick={() => { navigate('/user-management'); setShowMobileSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-orange-100/80 dark:hover:bg-orange-900/30 transition-all duration-300 group"
                  data-testid="mobile-button-user-management"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">User Management</span>
                </button>
              )}
              
              <button
                onClick={() => { navigate('/queries'); setShowMobileSidebar(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-purple-100/80 dark:hover:bg-purple-900/30 transition-all duration-300 group"
                data-testid="mobile-button-queries"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">Queries</span>
              </button>
              
              <button
                onClick={() => { navigate('/user-profile'); setShowMobileSidebar(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30 transition-all duration-300 group"
                data-testid="mobile-button-profile"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">My Profile</span>
              </button>

              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openHelpGuide'));
                  setShowMobileSidebar(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-sky-100/80 dark:hover:bg-sky-900/30 transition-all duration-300 group"
                data-testid="mobile-button-help-guide"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-md">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">Help Guide</span>
              </button>
            </div>

            {/* Mobile Sidebar Footer */}
            <div className="p-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                data-testid="mobile-button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar - Quick Actions */}
      <aside className="hidden lg:flex flex-col w-72 bg-card/95 dark:bg-card backdrop-blur-xl border-r border-border fixed left-0 top-0 h-screen z-40 animate-slideInLeft">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4 mb-2">
            <img src="/taleemhub-logo.png" alt="TaleemHub Logo" className="w-20 h-20" />
            <div>
              <h1 className="text-2xl font-bold gradient-text-gold">TaleemHub</h1>
              <p className="text-sm text-muted-foreground mt-1">{user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b border-white/20">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl hover-lift cursor-pointer"
            data-testid="user-profile-section"
          >
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover shadow-lg" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-all duration-300 group press-effect"
                  data-testid="button-plan-visit"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Plan a Visit</span>
                </button>
                <button
                  onClick={() => setActiveActivityForm('other-activity')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30 transition-all duration-300 group press-effect"
                  data-testid="button-log-activity"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Log Activity</span>
                </button>
                <button
                  onClick={() => navigate('/aeo-user-management')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 transition-all duration-300 group press-effect"
                  data-testid="button-manage-staff"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Manage Staff</span>
                </button>
              </>
            )}
            {user.role === 'HEAD_TEACHER' && (
              <>
                <button
                  onClick={() => navigate('/edit-school')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-300 group press-effect"
                  data-testid="button-edit-school"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <School className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Edit School</span>
                </button>
                <button
                  onClick={() => navigate('/edit-school-data')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-purple-100/80 dark:hover:bg-purple-900/30 transition-all duration-300 group press-effect"
                  data-testid="button-update-school-data"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Update School Data</span>
                </button>
                <button
                  onClick={() => navigate('/collaborative-forms')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-300 group press-effect"
                  data-testid="button-collaborative-forms"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Collaborative Forms</span>
                </button>
                <button
                  onClick={() => navigate('/headteacher-user-management')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 transition-all duration-300 group press-effect"
                  data-testid="button-manage-teachers"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Manage Teachers</span>
                </button>
              </>
            )}
            {(user.role === 'AEO' || user.role === 'HEAD_TEACHER' || user.role === 'DDEO') && (
              <button
                onClick={() => navigate('/create-request')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-300 group press-effect"
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
              onClick={() => toast({
                title: "Coming Soon!",
                description: "All Requests feature is under development and will be available soon.",
              })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all duration-300 group press-effect"
              data-testid="button-view-requests"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">All Requests</span>
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-300 group press-effect"
              data-testid="button-view-calendar"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">Leave Calendar</span>
            </button>
            {user.role === 'TEACHER' ? (
              <button
                onClick={() => navigate('/community-album')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-pink-100/80 dark:hover:bg-pink-900/30 transition-all duration-300 group press-effect"
                data-testid="button-community-album"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">Community Album</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/school-data')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-300 group press-effect"
                data-testid="button-view-schools"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">School Inventory</span>
              </button>
            )}
            {(user.role === 'AEO' || user.role === 'DDEO') && (
              <button
                onClick={() => navigate('/school-visits')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-rose-100/80 dark:hover:bg-rose-900/30 transition-all duration-300 group press-effect"
                data-testid="button-view-visits"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">School Visits</span>
              </button>
            )}
            {user.role === 'DDEO' && (
              <button
                onClick={() => navigate('/user-management')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-orange-100/80 dark:hover:bg-orange-900/30 transition-all duration-300 group press-effect"
                data-testid="button-user-management"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">User Management</span>
              </button>
            )}
            <button
              onClick={() => navigate('/queries')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-purple-100/80 dark:hover:bg-purple-900/30 transition-all duration-300 group press-effect"
              data-testid="button-view-queries"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">Queries</span>
            </button>
            <button
              onClick={() => toast({
                title: "Coming Soon!",
                description: "Lesson Plans feature is under development and will be available soon.",
              })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 transition-all duration-300 group press-effect"
              data-testid="button-lesson-plans"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">Lesson Plans</span>
            </button>
            
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Support</p>
            </div>
            
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openHelpGuide'))}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-300 group press-effect"
              data-testid="button-help-guide-sidebar"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 animate-pulse">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">Help Guide</span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300"
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
        <div className="lg:hidden bg-card/95 dark:bg-card backdrop-blur-xl border-b border-border sticky top-0 z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSidebar(true)}
                data-testid="button-open-menu"
                className="rounded-full"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-lg font-bold gradient-text-gold">TaleemHub</h1>
                <p className="text-xs text-muted-foreground">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <NotificationBell />
            </div>
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
                onClick={() => toast({
                  title: "Coming Soon!",
                  description: "All Requests feature is under development.",
                })}
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
              <Button
                onClick={() => toast({
                  title: "Coming Soon!",
                  description: "Lesson Plans feature is under development.",
                })}
                size="sm"
                className="rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-0"
                data-testid="button-lesson-plans-mobile"
              >
                <BookOpen className="w-4 h-4" />
                Lesson Plans
              </Button>
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent('openHelpGuide'))}
                size="sm"
                className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-0 animate-pulse"
                data-testid="button-help-guide-mobile"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-card/95 dark:bg-card backdrop-blur-xl border-b border-border sticky top-0 z-30">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Welcome back, {user.name}</h1>
              <p className="text-base text-muted-foreground mt-1">Here's your dashboard overview</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 lg:px-8 py-6 lg:py-8">
          {/* Customizable Widgets Container - renders in user-defined order */}
          <div className="space-y-8">
            {visibleWidgets.map(widget => renderWidget(widget.id))}
          </div>

          <TeacherDetailsDialog
            open={teacherDialogOpen}
            onOpenChange={setTeacherDialogOpen}
            type={teacherDialogType}
            teachers={teachers}
            leaves={leaves}
          />
        </div>
      </div>

      {/* Activity Forms Modal */}
      {user.role === 'AEO' && activeActivityForm === 'visit-selector' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
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
          <div className="w-full max-w-6xl my-8 animate-slideUp">
            <div className="bg-card rounded-2xl shadow-2xl">
              <MonitoringVisitForm onClose={() => setActiveActivityForm(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Mentoring Visit Form */}
      {activeActivityForm === 'mentoring' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-6xl my-8 animate-slideUp">
            <div className="bg-card rounded-2xl shadow-2xl">
              <MentoringVisitForm onClose={() => setActiveActivityForm(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Office Visit Form */}
      {activeActivityForm === 'office' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-5xl my-8 animate-slideUp">
            <div className="bg-card rounded-2xl shadow-2xl">
              <OfficeVisitForm onClose={() => setActiveActivityForm(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Other Activity Form */}
      {activeActivityForm === 'other-activity' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-5xl my-8 animate-slideUp">
            <div className="bg-card rounded-2xl shadow-2xl">
              <OtherActivityForm onClose={() => setActiveActivityForm(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Customize Dashboard Modal */}
      <CustomizeDashboardModal
        open={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        widgets={widgets}
        onToggleWidget={toggleWidget}
        onMoveWidget={moveWidget}
        onResetToDefault={resetToDefault}
      />
    </div>
  );
}
