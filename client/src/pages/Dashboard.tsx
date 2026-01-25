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
import { LogOut, Plus, FileText, TrendingUp, Users, Calendar, Building2, MapPin, ClipboardList, CheckSquare, Award, ChevronRight, User, MessageSquare, Edit, School, Settings2, BookOpen, HelpCircle, Menu, X, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MonitoringVisitForm from '@/pages/MonitoringVisitForm';
import MentoringVisitForm from '@/pages/MentoringVisitForm';
import OfficeVisitForm from '@/pages/OfficeVisitForm';
import OtherActivityForm from '@/pages/OtherActivityForm';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MetricCard, TeacherDetailsDialog, CustomizeDashboardModal } from '@/components/dashboard';
import { TeacherExportDialog } from '@/components/TeacherExportDialog';
import { analytics } from '@/lib/analytics';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { getRequestsForUser } = useMockDataRequests();
  const { getTeacherStats, teachers, leaves } = useMockTeacherData(user?.assignedSchools);
  const { getVisitsForUser } = useMockVisits();
  const { getAllActivities } = useActivities();

  const { toast } = useToast();
  const [activeActivityForm, setActiveActivityForm] = useState<string | null>(null);
  const [viewActivityList, setViewActivityList] = useState<'monitoring' | 'mentoring' | 'office' | 'other' | null>(null);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [teacherDialogType, setTeacherDialogType] = useState<'total' | 'present' | 'onLeave' | 'absent'>('total');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTeacherExportDialog, setShowTeacherExportDialog] = useState(false);
  const [staffStats, setStaffStats] = useState({
    aeos: { total: 0, present: 0, onLeave: 0, absent: 0 },
    headTeachers: { total: 0, present: 0, onLeave: 0, absent: 0 },
    teachers: { total: 0, present: 0, onLeave: 0, absent: 0 },
  });

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

  // Listen for guide sidebar events
  useEffect(() => {
    const handleOpenSidebar = () => setShowSidebar(true);
    const handleCloseSidebar = () => setShowSidebar(false);
    window.addEventListener('openSidebarForGuide', handleOpenSidebar);
    window.addEventListener('closeSidebarForGuide', handleCloseSidebar);
    return () => {
      window.removeEventListener('openSidebarForGuide', handleOpenSidebar);
      window.removeEventListener('closeSidebarForGuide', handleCloseSidebar);
    };
  }, []);

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

  // Fetch real staff statistics from API
  useEffect(() => {
    if (user) {
      fetch(`/api/staff-stats?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setStaffStats(data);
          }
        })
        .catch(err => {
          console.error('Failed to fetch staff stats:', err);
        });
    }
  }, [user]);

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
          <div key="stats" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 stagger-children" data-testid="widget-stats">
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
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 lg:mb-6">Your Activities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 stagger-children">
              <MetricCard
                value={activities.monitoring.length}
                label="Monitoring"
                icon={FileText}
                iconGradient="from-blue-400 to-blue-600"
                size="xl"
                onClick={() => setViewActivityList('monitoring')}
                className="hover-lift card-shine border-blue-200/50 dark:border-blue-800/50"
                data-testid="card-monitoring-activity"
              />
              <MetricCard
                value={activities.mentoring.length}
                label="Mentoring"
                icon={Award}
                iconGradient="from-purple-400 to-purple-600"
                size="xl"
                onClick={() => setViewActivityList('mentoring')}
                className="hover-lift card-shine border-purple-200/50 dark:border-purple-800/50"
                data-testid="card-mentoring-activity"
              />
              <MetricCard
                value={activities.office.length}
                label="Office"
                icon={Building2}
                iconGradient="from-emerald-400 to-emerald-600"
                size="xl"
                onClick={() => setViewActivityList('office')}
                className="hover-lift card-shine border-emerald-200/50 dark:border-emerald-800/50"
                data-testid="card-office-activity"
              />
              <MetricCard
                value={activities.other.length}
                label="Other"
                icon={CheckSquare}
                iconGradient="from-slate-400 to-slate-600"
                size="xl"
                onClick={() => setViewActivityList('other')}
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
        
        // Shuffle and pick random quotes/tips on each page visit
        const shuffledQuotes = [...teachingQuotes].sort(() => Math.random() - 0.5);
        const shuffledTips = [...coachingTips].sort(() => Math.random() - 0.5);
        const dailyQuote = shuffledQuotes[0];
        const randomCoachingTips = shuffledTips.slice(0, 3);
        
        if (user.role === 'HEAD_TEACHER') {
          return (
            <div key="requests" data-testid="widget-coaching-tips">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 lg:mb-6">Quick Coaching Tips</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {randomCoachingTips.map((tip, idx) => (
                  <Card key={idx} className="p-5 bg-white dark:bg-card border border-border shadow-md hover:shadow-lg transition-all duration-300">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-3 bg-gradient-to-r ${tip.gradient} text-white`}>
                      {tip.category}
                    </div>
                    <p className={`text-sm font-medium leading-relaxed bg-gradient-to-r ${tip.gradient} bg-clip-text text-transparent`}>
                      {tip.text}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          );
        }
        
        if (user.role === 'TEACHER') {
          return (
            <div key="requests" data-testid="widget-quote">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 lg:mb-6">Today's Inspiration</h2>
              <Card className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-card border border-border shadow-xl overflow-hidden relative">
                <div className="relative">
                  <div className={`text-3xl sm:text-4xl lg:text-5xl mb-2 sm:mb-4 bg-gradient-to-r ${dailyQuote.gradient} bg-clip-text text-transparent`}>"</div>
                  <p className={`text-base sm:text-lg lg:text-2xl font-medium leading-relaxed mb-2 sm:mb-4 bg-gradient-to-r ${dailyQuote.gradient} bg-clip-text text-transparent`}>
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
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 lg:mb-6">Recent Activity</h2>
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
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 lg:mb-6">My School Staff</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 stagger-children">
                <div 
                  onClick={() => setShowTeacherExportDialog(true)}
                  className="cursor-pointer"
                  data-testid="card-teachers-clickable"
                >
                  <MetricCard
                    value={staffStats.teachers.total}
                    label="Teachers (Tap to export)"
                    icon={Users}
                    iconGradient="from-blue-500 to-blue-600"
                    size="lg"
                    breakdown={[
                      { label: 'Present', value: staffStats.teachers.present, valueColor: 'text-emerald-600', showAsBadge: false },
                      { label: 'On Leave', value: staffStats.teachers.onLeave, valueColor: 'text-amber-600', showAsBadge: false },
                    ]}
                    className="hover-lift card-shine ring-2 ring-blue-200 dark:ring-blue-800"
                  />
                </div>
              </div>
            </div>
          );
        }
        return (
          <div key="staff" data-testid="widget-staff">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 lg:mb-6">Staff Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 stagger-children">
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
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 lg:mb-6">Recent Visits</h2>
            <Card className="p-4 sm:p-6 bg-card border border-border">
              <div className="text-center py-6 sm:py-8">
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
        // Head Teacher doesn't need this widget - they have the sidebar link
        if (user.role === 'HEAD_TEACHER') return null;
        
        // Teaching tips for teachers
        const allTeachingTips = [
          { tip: "Start each class with a quick review of the previous lesson.", tipUr: "ہر کلاس کا آغاز پچھلے سبق کے مختصر جائزے سے کریں۔", icon: "🔄", color: "from-blue-500 to-cyan-500" },
          { tip: "Use visual aids like charts and diagrams to explain concepts.", tipUr: "تصویریں اور نقشے استعمال کر کے تصورات سمجھائیں۔", icon: "📊", color: "from-purple-500 to-pink-500" },
          { tip: "Encourage students to ask questions freely.", tipUr: "طلباء کو آزادانہ سوالات پوچھنے کی ترغیب دیں۔", icon: "❓", color: "from-emerald-500 to-teal-500" },
          { tip: "Give positive feedback to boost student confidence.", tipUr: "بچوں کی حوصلہ افزائی کریں تاکہ ان کا اعتماد بڑھے۔", icon: "⭐", color: "from-amber-500 to-orange-500" },
          { tip: "Break down large tasks into smaller steps.", tipUr: "بڑے کاموں کو چھوٹے آسان حصوں میں تقسیم کریں۔", icon: "📝", color: "from-rose-500 to-red-500" },
          { tip: "Use real-life examples to make lessons engaging.", tipUr: "روزمرہ زندگی کی مثالیں دے کر سبق دلچسپ بنائیں۔", icon: "🌍", color: "from-indigo-500 to-blue-500" },
          { tip: "Create a safe environment where mistakes are learning opportunities.", tipUr: "ایسا ماحول بنائیں جہاں غلطیاں سیکھنے کا موقع ہوں۔", icon: "🛡️", color: "from-teal-500 to-emerald-500" },
          { tip: "Include group activities to develop teamwork skills.", tipUr: "گروپ سرگرمیوں سے ٹیم ورک کی مہارت بڑھائیں۔", icon: "👥", color: "from-violet-500 to-purple-500" },
          { tip: "Take short breaks during long lessons.", tipUr: "لمبے اسباق میں چھوٹے وقفے لیں۔", icon: "⏸️", color: "from-pink-500 to-rose-500" },
          { tip: "End each lesson with a summary of key points.", tipUr: "ہر سبق کے آخر میں اہم نکات کا خلاصہ بیان کریں۔", icon: "📌", color: "from-cyan-500 to-blue-500" },
          { tip: "Celebrate small achievements to keep students motivated.", tipUr: "چھوٹی کامیابیوں کو مناکر بچوں کی حوصلہ افزائی کریں۔", icon: "🎉", color: "from-orange-500 to-amber-500" },
          { tip: "Use storytelling to make lessons memorable.", tipUr: "کہانی سنا کر سبق یادگار بنائیں۔", icon: "📖", color: "from-red-500 to-rose-500" },
        ];
        
        // Shuffle and pick 3 random tips on each render
        const shuffledTeachingTips = [...allTeachingTips].sort(() => Math.random() - 0.5);
        const randomTips = shuffledTeachingTips.slice(0, 3);
        
        if (user.role === 'TEACHER') {
          return (
            <div key="calendar" data-testid="widget-tips">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 lg:mb-6">
                Teaching Tips <span className="text-muted-foreground font-normal text-base">/ تدریسی مشورے</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {randomTips.map((item, idx) => (
                  <Card key={idx} className="p-4 sm:p-5 bg-white dark:bg-card border border-border shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98]">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-2xl sm:text-3xl">{item.icon}</div>
                      <div className="flex-1">
                        <p className={`text-xs sm:text-sm font-medium bg-gradient-to-r ${item.color} bg-clip-text text-transparent leading-relaxed`}>
                          {item.tip}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed" dir="rtl">
                          {item.tipUr}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        }
        
        return (
          <div key="calendar" data-testid="widget-calendar">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 lg:mb-6">Leave Calendar</h2>
            <Card className="p-4 sm:p-6 bg-card border border-border">
              <div className="text-center py-6 sm:py-8">
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
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card dark:bg-card border-r border-border animate-slideInLeft flex flex-col"
            data-testid="mobile-sidebar"
          >
            {/* Mobile Sidebar Header */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
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
                onClick={() => setShowSidebar(false)}
                data-testid="button-close-menu"
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <nav className="space-y-2">
                {user.role === 'AEO' && (
                  <>
                    <button
                      onClick={() => { setActiveActivityForm('visit-selector'); setShowSidebar(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-all duration-300 group press-effect"
                      data-testid="mobile-button-plan-visit"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <ClipboardList className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-foreground">Plan a Visit</span>
                    </button>
                    <button
                      onClick={() => { setActiveActivityForm('other-activity'); setShowSidebar(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30 transition-all duration-300 group press-effect"
                      data-testid="mobile-button-log-activity"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <CheckSquare className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-foreground">Log Activity</span>
                    </button>
                    <button
                      onClick={() => { navigate('/aeo-user-management'); setShowSidebar(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 transition-all duration-300 group press-effect"
                      data-testid="mobile-button-manage-staff"
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
                      onClick={() => { navigate('/school-data'); setShowSidebar(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-300 group press-effect"
                      data-testid="mobile-button-school-management"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <School className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-foreground">School Management</span>
                    </button>
                    <button
                      onClick={() => { navigate('/headteacher-user-management'); setShowSidebar(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 transition-all duration-300 group press-effect"
                      data-testid="mobile-button-manage-teachers"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-foreground">Manage Teachers</span>
                    </button>
                  </>
                )}
                {(user.role === 'AEO' || user.role === 'HEAD_TEACHER' || user.role === 'DDEO' || user.role === 'DEO') && (
                  <button
                    onClick={() => { navigate('/data-requests'); setShowSidebar(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-300 group press-effect"
                    data-testid="mobile-button-data-requests"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-foreground">Data Requests</span>
                  </button>
                )}
                {user.role === 'TEACHER' && (
                  <button
                    onClick={() => { navigate('/data-requests-preview'); setShowSidebar(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-300 group press-effect"
                    data-testid="mobile-button-data-requests-preview"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-foreground">Data Requests</span>
                  </button>
                )}
                
                <button
                  onClick={() => { navigate('/calendar'); setShowSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-300 group press-effect"
                  data-testid="mobile-button-leave-calendar"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Leave Calendar</span>
                </button>
                <button
                  onClick={() => { navigate('/community-album'); setShowSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-pink-100/80 dark:hover:bg-pink-900/30 transition-all duration-300 group press-effect"
                  data-testid="mobile-button-community-album"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Community Album</span>
                </button>
                {user.role !== 'TEACHER' && user.role !== 'HEAD_TEACHER' && (
                  <button
                    onClick={() => { navigate('/school-data'); setShowSidebar(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-300 group press-effect"
                    data-testid="mobile-button-school-inventory"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-foreground">School Inventory</span>
                  </button>
                )}
                {(user.role === 'AEO' || user.role === 'DDEO') && (
                  <button
                    onClick={() => { navigate('/school-visits'); setShowSidebar(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-rose-100/80 dark:hover:bg-rose-900/30 transition-all duration-300 group press-effect"
                    data-testid="mobile-button-school-visits"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-foreground">School Visits</span>
                  </button>
                )}
                {user.role === 'DDEO' && (
                  <button
                    onClick={() => { navigate('/user-management'); setShowSidebar(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-orange-100/80 dark:hover:bg-orange-900/30 transition-all duration-300 group press-effect"
                    data-testid="mobile-button-user-management"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-foreground">User Management</span>
                  </button>
                )}
                <button
                  onClick={() => { navigate('/queries'); setShowSidebar(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-purple-100/80 dark:hover:bg-purple-900/30 transition-all duration-300 group press-effect"
                  data-testid="mobile-button-queries"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Queries</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/lesson-plans');
                    setShowSidebar(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 transition-all duration-300 group press-effect"
                  data-testid="mobile-button-lesson-plans"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Lesson Plans</span>
                </button>
                
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openHelpGuide'));
                    setShowSidebar(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-300 group press-effect"
                  data-testid="mobile-button-help-guide"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 animate-pulse">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Help Guide</span>
                </button>
              </nav>
            </div>

            {/* Mobile Sidebar Footer */}
            <div className="p-3 border-t border-border shrink-0 mt-auto">
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

      {/* Desktop Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="hidden lg:block fixed inset-0 bg-black/50 z-[55]"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      <aside className={`hidden lg:flex flex-col w-72 bg-card dark:bg-card border-r border-border fixed left-0 top-0 h-screen z-[60] transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header - matches main header height */}
        <div className="px-6 py-6 border-b border-border h-[88px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/taleemhub-logo.png" alt="TaleemHub Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold gradient-text-gold">TaleemHub</h1>
              <p className="text-xs text-muted-foreground">{user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(false)}
            data-testid="button-close-desktop-sidebar"
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
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
                  onClick={() => navigate('/school-data')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-300 group press-effect"
                  data-testid="button-edit-school"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <School className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">School Management</span>
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
            {(user.role === 'AEO' || user.role === 'HEAD_TEACHER' || user.role === 'DDEO' || user.role === 'DEO') && (
              <button
                onClick={() => navigate('/data-requests')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-300 group press-effect"
                data-testid="button-data-requests"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">Data Requests</span>
              </button>
            )}
            {user.role === 'TEACHER' && (
              <button
                onClick={() => navigate('/data-requests-preview')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-300 group press-effect"
                data-testid="button-data-requests-preview"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">Data Requests</span>
              </button>
            )}
            
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
            {user.role !== 'TEACHER' && user.role !== 'HEAD_TEACHER' && (
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
              onClick={() => navigate('/lesson-plans')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 transition-all duration-300 group press-effect"
              data-testid="button-lesson-plans"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">Lesson Plans</span>
            </button>
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
      <div className="flex-1">
        {/* Mobile Header - matches desktop style */}
        <div className="lg:hidden bg-card/95 dark:bg-card backdrop-blur-xl border-b border-border sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                data-testid="button-toggle-menu"
                className="rounded-full"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-base font-bold gradient-text">Welcome, {user.name.split(' ')[0]}</h1>
                <p className="text-xs text-muted-foreground">Dashboard overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
              <div
                onClick={() => navigate('/profile')}
                className="cursor-pointer"
                data-testid="mobile-profile-button"
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-9 h-9 rounded-full object-cover shadow-md ring-2 ring-primary/20" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md ring-2 ring-primary/20">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header - matches sidebar header height */}
        <div className="hidden lg:block bg-card/95 dark:bg-card backdrop-blur-xl border-b border-border sticky top-0 z-30 h-[88px]">
          <div className="px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                data-testid="button-toggle-menu"
                className="rounded-full"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Welcome back, {user.name}</h1>
                <p className="text-base text-muted-foreground mt-1">Here's your dashboard overview</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-sm text-muted-foreground hidden xl:inline">Theme</span>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <span className="text-sm text-muted-foreground hidden xl:inline">Alerts</span>
              </div>
              <div
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200"
                data-testid="header-profile-button"
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-primary/20" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md ring-2 ring-primary/20">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-sm text-muted-foreground hidden xl:inline">Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Mobile-optimized layout */}
        <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Customizable Widgets Container - tighter spacing on mobile */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
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

      {/* Activity List Modal */}
      {viewActivityList && activities && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl my-8 animate-slideUp">
            <div className="bg-card rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {viewActivityList === 'monitoring' && 'Monitoring Visits'}
                  {viewActivityList === 'mentoring' && 'Mentoring Visits'}
                  {viewActivityList === 'office' && 'Office Visits'}
                  {viewActivityList === 'other' && 'Other Activities'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setViewActivityList(null)} data-testid="button-close-activity-list">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {(() => {
                const items = viewActivityList === 'monitoring' ? activities.monitoring
                  : viewActivityList === 'mentoring' ? activities.mentoring
                  : viewActivityList === 'office' ? activities.office
                  : activities.other;
                
                if (items.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No {viewActivityList} activities yet</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => {
                          setViewActivityList(null);
                          setActiveActivityForm(viewActivityList === 'other' ? 'other-activity' : viewActivityList);
                        }}
                        data-testid="button-add-first-activity"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First {viewActivityList === 'monitoring' ? 'Monitoring Visit' : viewActivityList === 'mentoring' ? 'Mentoring Visit' : viewActivityList === 'office' ? 'Office Visit' : 'Activity'}
                      </Button>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {items.map((item: any, index: number) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                item.status === 'Completed' || item.status === 'completed' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : item.status === 'Pending' || item.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            {viewActivityList !== 'other' && viewActivityList !== 'office' && (
                              <p className="font-medium text-foreground">{item.schoolName || 'School Visit'}</p>
                            )}
                            {viewActivityList === 'other' && (
                              <p className="font-medium text-foreground">{item.activityType || 'Activity'}</p>
                            )}
                            {viewActivityList === 'office' && (
                              <p className="font-medium text-foreground">{item.purpose || 'Office Visit'}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {item.visitDate || item.activityDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              
              <div className="mt-6 pt-4 border-t border-border flex justify-between">
                <Button variant="outline" onClick={() => setViewActivityList(null)} data-testid="button-close-list">
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setViewActivityList(null);
                    setActiveActivityForm(viewActivityList === 'other' ? 'other-activity' : viewActivityList);
                  }}
                  data-testid="button-add-new-activity"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
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

      {/* Teacher Export Dialog for Head Teachers */}
      <TeacherExportDialog
        isOpen={showTeacherExportDialog}
        onClose={() => setShowTeacherExportDialog(false)}
        userId={user?.id || ''}
      />
    </div>
  );
}
