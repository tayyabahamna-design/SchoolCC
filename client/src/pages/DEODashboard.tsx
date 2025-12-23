import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMockTeacherData } from '@/hooks/useMockTeacherData';
import { useMockVisits } from '@/hooks/useMockVisits';
import { useMockAEOActivities } from '@/hooks/useMockAEOActivities';
import { useMockDataRequests } from '@/hooks/useMockDataRequests';
import NotificationBell from '@/components/NotificationBell';
import {
  Building2,
  MapPin,
  Users,
  FileText,
  Award,
  Activity,
  LogOut,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  MessageSquare,
  Image,
  UserCheck,
  UserX,
  UsersRound,
  ChevronRight,
  Eye,
  X,
  Menu,
  Search,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SchoolsTable } from '@/components/deo/SchoolsTable';

export default function DEODashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { getSchoolData, getStaffStats, staff: staffMembers } = useMockTeacherData();
  const { getVisitsForUser } = useMockVisits();
  const { getAllActivities } = useMockAEOActivities();
  const { getRequestsForUser } = useMockDataRequests();

  const [showSchoolsModal, setShowSchoolsModal] = useState(false);
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showMenuSidebar, setShowMenuSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!user || user.role !== 'DEO') {
    navigate('/');
    return null;
  }

  // Get all data
  const schools = getSchoolData();
  const staffStats = getStaffStats();
  const staff = staffMembers;
  const visits = getVisitsForUser(user.id, user.role);
  const requests = getRequestsForUser(user.id, user.role);
  const activities = getAllActivities();

  // Calculate aggregations
  const {
    excellentSchools,
    goodSchools,
    needsAttentionSchools,
    avgCompliance,
    activeVisits,
    totalStaff,
    totalPresent,
    totalAbsent,
    pendingRequests,
    highPriorityCount,
    overdueCount,
    topPerformers,
    bottomPerformers,
    recentActivities,
  } = useMemo(() => {
    // Schools categorization
    const excellent = schools.filter((s) => s.compliance >= 90);
    const good = schools.filter((s) => s.compliance >= 80 && s.compliance < 90);
    const needsAttention = schools.filter((s) => s.compliance < 80);
    const avg =
      schools.length === 0
        ? 0
        : Math.round(
            schools.reduce((sum, s) => sum + s.compliance, 0) / schools.length
          );

    // Active visits
    const active = visits.filter((v) => v.status === 'in_progress');

    // Staff calculations
    const totalPresent =
      staffStats.aeos.present +
      staffStats.headTeachers.present +
      staffStats.teachers.present;
    const totalStaff =
      staffStats.aeos.total +
      staffStats.headTeachers.total +
      staffStats.teachers.total;
    const totalAbsent = totalStaff - totalPresent;

    // Requests
    const pending = requests.filter((r) => r.status === 'active');
    const highPriority = pending.filter((r) => r.priority === 'high').length;
    const overdue = requests.filter(
      (r) => new Date(r.dueDate) < new Date() && r.status !== 'completed'
    ).length;

    // Top and bottom performers
    const sorted = [...schools].sort((a, b) => b.compliance - a.compliance);
    const top = sorted.slice(0, 3);
    const bottom = sorted.slice(-3).reverse();

    // Recent activities
    const allActivities = [
      ...activities.monitoring,
      ...activities.mentoring,
      ...activities.office,
      ...activities.other,
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      excellentSchools: excellent,
      goodSchools: good,
      needsAttentionSchools: needsAttention,
      avgCompliance: avg,
      activeVisits: active,
      totalStaff,
      totalPresent,
      totalAbsent,
      pendingRequests: pending,
      highPriorityCount: highPriority,
      overdueCount: overdue,
      topPerformers: top,
      bottomPerformers: bottom,
      recentActivities: allActivities,
    };
  }, [schools, staffStats, visits, requests, activities]);

  // Menu items for quick access
  const menuItems = [
    {
      label: 'Schools Overview',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      action: () => { setShowSchoolsModal(true); setShowMenuSidebar(false); },
      description: 'View all schools and performance'
    },
    {
      label: 'Active Visits',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
      action: () => { setShowVisitsModal(true); setShowMenuSidebar(false); },
      description: 'Track live AEO field visits'
    },
    {
      label: 'Staff Attendance',
      icon: UsersRound,
      color: 'from-teal-500 to-teal-600',
      action: () => { setShowStaffModal(true); setShowMenuSidebar(false); },
      description: 'View staff presence and absences'
    },
    {
      label: 'Pending Requests',
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
      action: () => { setShowRequestsModal(true); setShowMenuSidebar(false); },
      description: 'Manage data requests'
    },
    {
      label: 'School Performance',
      icon: Award,
      color: 'from-emerald-500 to-emerald-600',
      action: () => { setShowPerformanceModal(true); setShowMenuSidebar(false); },
      description: 'View rankings and compliance'
    },
    {
      label: 'Recent Activities',
      icon: Activity,
      color: 'from-slate-500 to-slate-600',
      action: () => { setShowActivitiesModal(true); setShowMenuSidebar(false); },
      description: 'Latest AEO activities'
    },
    {
      label: 'School Inventory',
      icon: Building2,
      color: 'from-indigo-500 to-indigo-600',
      action: () => { navigate('/school-data'); setShowMenuSidebar(false); },
      description: 'Infrastructure and resources'
    },
    {
      label: 'School Albums',
      icon: Image,
      color: 'from-pink-500 to-pink-600',
      action: () => { navigate('/school-data'); setShowMenuSidebar(false); },
      description: 'School photos and activities'
    },
    {
      label: 'All Data Requests',
      icon: FileText,
      color: 'from-violet-500 to-violet-600',
      action: () => { navigate('/data-requests'); setShowMenuSidebar(false); },
      description: 'View all requests'
    },
    {
      label: 'Leave Calendar',
      icon: Calendar,
      color: 'from-sky-500 to-sky-600',
      action: () => { navigate('/calendar'); setShowMenuSidebar(false); },
      description: 'Staff leave schedules'
    },
    {
      label: 'School Visits',
      icon: MapPin,
      color: 'from-rose-500 to-rose-600',
      action: () => { navigate('/school-visits'); setShowMenuSidebar(false); },
      description: 'All scheduled visits'
    },
    {
      label: 'Queries',
      icon: MessageSquare,
      color: 'from-fuchsia-500 to-fuchsia-600',
      action: () => { navigate('/queries'); setShowMenuSidebar(false); },
      description: 'Staff queries and support'
    },
    {
      label: 'Create Request',
      icon: Plus,
      color: 'from-green-500 to-green-600',
      action: () => { navigate('/create-request'); setShowMenuSidebar(false); },
      description: 'Create new data request'
    },
  ];

  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenuSidebar(true)}
                className="rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DEO Command Center
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.name} • District Education Officer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Sidebar Overlay */}
      {showMenuSidebar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
            onClick={() => setShowMenuSidebar(false)}
          />

          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-left duration-300">
            {/* Sidebar Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Access Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMenuSidebar(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No features found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                filteredMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={item.action}
                      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* Schools Overview Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500"
            onClick={() => setShowSchoolsModal(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{schools.length}</h3>
            <p className="text-sm text-muted-foreground mb-3">Total Schools</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Excellent (≥90%)</span>
                <Badge className="bg-green-500">{excellentSchools.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Good (80-90%)</span>
                <Badge className="bg-blue-500">{goodSchools.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Needs Attention</span>
                <Badge className="bg-red-500">{needsAttentionSchools.length}</Badge>
              </div>
            </div>
          </Card>

          {/* Active Visits Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500"
            onClick={() => setShowVisitsModal(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{activeVisits.length}</h3>
            <p className="text-sm text-muted-foreground mb-3">Active AEO Visits</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Live Tracking</span>
            </div>
          </Card>

          {/* Total Staff Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-teal-500"
            onClick={() => setShowStaffModal(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                <UsersRound className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalStaff}</h3>
            <p className="text-sm text-muted-foreground mb-3">Total Staff</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">AEOs</span>
                <span className="font-medium">{staffStats.aeos.total}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Head Teachers</span>
                <span className="font-medium">{staffStats.headTeachers.total}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Teachers</span>
                <span className="font-medium">{staffStats.teachers.total}</span>
              </div>
            </div>
          </Card>

          {/* Staff Present Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-green-500"
            onClick={() => setShowStaffModal(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalPresent}</h3>
            <p className="text-sm text-muted-foreground mb-3">Staff Present Today</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">AEOs</span>
                <Badge className="bg-green-500">{staffStats.aeos.present}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Head Teachers</span>
                <Badge className="bg-green-500">{staffStats.headTeachers.present}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Teachers</span>
                <Badge className="bg-green-500">{staffStats.teachers.present}</Badge>
              </div>
            </div>
          </Card>

          {/* Staff Absent Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-red-500"
            onClick={() => setShowStaffModal(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalAbsent}</h3>
            <p className="text-sm text-muted-foreground mb-3">Staff Absent Today</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">AEOs</span>
                <Badge className="bg-red-500">{staffStats.aeos.total - staffStats.aeos.present}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Head Teachers</span>
                <Badge className="bg-red-500">{staffStats.headTeachers.total - staffStats.headTeachers.present}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Teachers</span>
                <Badge className="bg-red-500">{staffStats.teachers.total - staffStats.teachers.present}</Badge>
              </div>
            </div>
          </Card>

          {/* Pending Requests Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-amber-500"
            onClick={() => setShowRequestsModal(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{pendingRequests.length}</h3>
            <p className="text-sm text-muted-foreground mb-3">Pending Requests</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">High Priority</span>
                <Badge className="bg-red-500">{highPriorityCount}</Badge>
              </div>
              {overdueCount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Overdue</span>
                  <Badge className="bg-red-600">{overdueCount}</Badge>
                </div>
              )}
            </div>
          </Card>

          {/* School Performance Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-emerald-500"
            onClick={() => setShowPerformanceModal(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{avgCompliance}%</h3>
            <p className="text-sm text-muted-foreground mb-3">Average Compliance</p>
            <div className="text-xs text-muted-foreground">
              View top performers and schools needing attention
            </div>
          </Card>

          {/* Recent Activities Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-slate-500"
            onClick={() => setShowActivitiesModal(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{recentActivities.length}</h3>
            <p className="text-sm text-muted-foreground mb-3">Recent Activities</p>
            <div className="text-xs text-muted-foreground">
              Latest AEO field activities and visits
            </div>
          </Card>

          {/* School Inventory Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-indigo-500"
            onClick={() => navigate('/school-data')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">School Inventory</h3>
            <p className="text-sm text-muted-foreground mb-3">View and manage school data</p>
            <div className="text-xs text-muted-foreground">
              Infrastructure, resources, and facilities
            </div>
          </Card>

          {/* School Albums Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-pink-500"
            onClick={() => navigate('/school-data')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Image className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">School Albums</h3>
            <p className="text-sm text-muted-foreground mb-3">View school photos and activities</p>
            <div className="text-xs text-muted-foreground">
              Photos from all schools in the district
            </div>
          </Card>

          {/* All Data Requests Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-violet-500"
            onClick={() => navigate('/data-requests')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">All Requests</h3>
            <p className="text-sm text-muted-foreground mb-3">View all data requests</p>
            <div className="text-xs text-muted-foreground">
              Manage and track request status
            </div>
          </Card>

          {/* Leave Calendar Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-sky-500"
            onClick={() => navigate('/calendar')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Leave Calendar</h3>
            <p className="text-sm text-muted-foreground mb-3">View staff leave schedules</p>
            <div className="text-xs text-muted-foreground">
              Track absences and approvals
            </div>
          </Card>

          {/* School Visits Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-rose-500"
            onClick={() => navigate('/school-visits')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">School Visits</h3>
            <p className="text-sm text-muted-foreground mb-3">View all scheduled visits</p>
            <div className="text-xs text-muted-foreground">
              Plan and track field visits
            </div>
          </Card>

          {/* Queries Card */}
          <Card
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-fuchsia-500"
            onClick={() => navigate('/queries')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Queries</h3>
            <p className="text-sm text-muted-foreground mb-3">View and respond to queries</p>
            <div className="text-xs text-muted-foreground">
              Staff queries and support requests
            </div>
          </Card>

        </div>
      </main>

      {/* Schools Modal */}
      {showSchoolsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSchoolsModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-6xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                All Schools ({schools.length})
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowSchoolsModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school) => (
                <Card key={school.id} className="p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{school.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compliance:</span>
                      <span className={`font-semibold ${
                        school.compliance >= 90 ? 'text-green-600' :
                        school.compliance >= 80 ? 'text-blue-600' : 'text-red-600'
                      }`}>{school.compliance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students:</span>
                      <span className="font-medium">{school.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teachers:</span>
                      <span className="font-medium">{school.totalTeachers}</span>
                    </div>
                    <Badge className={
                      school.compliance >= 90 ? 'bg-green-500' :
                      school.compliance >= 80 ? 'bg-blue-500' : 'bg-red-500'
                    }>
                      {school.compliance >= 90 ? 'Excellent' :
                       school.compliance >= 80 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Visits Modal */}
      {showVisitsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowVisitsModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Active AEO Visits ({activeVisits.length})
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowVisitsModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {activeVisits.map((visit) => (
                <Card key={visit.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                          {visit.conductedByName?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{visit.conductedByName}</h3>
                          <p className="text-sm text-muted-foreground">{visit.schoolName}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Visit Type:</span>
                          <Badge className="ml-2 bg-blue-500">{visit.visitType}</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-2 font-medium">
                            {Math.floor((new Date().getTime() - new Date(visit.startTime || Date.now()).getTime()) / (1000 * 60))} min
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">GPS Location:</span>
                          <span className="ml-2 font-mono text-xs">
                            {visit.gpsStartLocation?.lat?.toFixed(4)}, {visit.gpsStartLocation?.lng?.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">In Progress</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Staff Details Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStaffModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-5xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Staff Attendance Details
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowStaffModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* AEOs Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Area Education Officers ({staffStats.aeos.total})
                </h3>
                <div className="grid gap-2">
                  {staff.filter(s => s.role === 'AEO').map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.clusterName}</p>
                        </div>
                      </div>
                      <Badge className={
                        member.status === 'present' ? 'bg-green-500' :
                        member.status === 'on_leave' ? 'bg-amber-500' : 'bg-red-500'
                      }>
                        {member.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Head Teachers Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  Head Teachers ({staffStats.headTeachers.total})
                </h3>
                <div className="grid gap-2">
                  {staff.filter(s => s.role === 'HEAD_TEACHER').map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.schoolName}</p>
                        </div>
                      </div>
                      <Badge className={
                        member.status === 'present' ? 'bg-green-500' :
                        member.status === 'on_leave' ? 'bg-amber-500' : 'bg-red-500'
                      }>
                        {member.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teachers Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Teachers ({staffStats.teachers.total})
                </h3>
                <div className="grid gap-2">
                  {staff.filter(s => s.role === 'TEACHER').map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.schoolName} • {member.subject}</p>
                        </div>
                      </div>
                      <Badge className={
                        member.status === 'present' ? 'bg-green-500' :
                        member.status === 'on_leave' ? 'bg-amber-500' : 'bg-red-500'
                      }>
                        {member.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests Modal */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRequestsModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Pending Data Requests
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowRequestsModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {pendingRequests.slice(0, 5).map((request, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">Sample Request #{idx + 1}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Monthly attendance and enrollment data required
                      </p>
                    </div>
                    <Badge className={
                      idx === 0 ? 'bg-red-500' : idx < 3 ? 'bg-amber-500' : 'bg-blue-500'
                    }>
                      {idx === 0 ? 'High Priority' : idx < 3 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Due: {new Date(Date.now() + (idx - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                    <span className="text-muted-foreground">
                      Assigned to: {['AEO Ahmed', 'AEO Sara', 'AEO Bilal'][idx % 3]}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPerformanceModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-6xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                School Performance Rankings
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPerformanceModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Top Performers */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Performers
                </h3>
                <div className="space-y-2">
                  {topPerformers.map((school, idx) => (
                    <div key={school.id} className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{school.name}</p>
                        <p className="text-sm text-muted-foreground">{school.district}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{school.compliance}%</p>
                        <p className="text-xs text-muted-foreground">{school.totalStudents} students</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Needs Attention */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Needs Attention
                </h3>
                <div className="space-y-2">
                  {bottomPerformers.map((school, idx) => (
                    <div key={school.id} className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                        {schools.length - bottomPerformers.length + idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{school.name}</p>
                        <p className="text-sm text-muted-foreground">{school.district}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">{school.compliance}%</p>
                        <p className="text-xs text-muted-foreground">{school.totalStudents} students</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities Modal */}
      {showActivitiesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowActivitiesModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                Recent AEO Activities
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowActivitiesModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.activityType === 'monitoring' ? 'bg-blue-500' :
                      activity.activityType === 'mentoring' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}>
                      {activity.activityType === 'monitoring' ? <Eye className="w-5 h-5 text-white" /> :
                       activity.activityType === 'mentoring' ? <Users className="w-5 h-5 text-white" /> :
                       <Clock className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{activity.aeoName}</h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.schoolName ? `${activity.schoolName} • ` : ''}
                        {activity.activityType.charAt(0).toUpperCase() + activity.activityType.slice(1)} Visit
                      </p>
                      {activity.notes && (
                        <p className="text-sm bg-gray-50 dark:bg-gray-700/30 p-2 rounded">{activity.notes}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Schools Table with Red Flags & Live Visits */}
      <div className="mt-8">
        <SchoolsTable districtId={user.districtId} />
      </div>
    </div>
  );
}
