import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { ActivitiesProvider } from "@/contexts/activities";
import { VisitSessionProvider } from "@/contexts/visit-session";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CEODashboard from "@/pages/CEODashboard";
import DEODashboard from "@/pages/DEODashboard";
import DataRequests from "@/pages/DataRequests";
import CreateRequest from "@/pages/CreateRequest";
import ViewRequest from "@/pages/ViewRequest";
import Calendar from "@/pages/Calendar";
import SchoolData from "@/pages/SchoolData";
import SchoolVisits from "@/pages/SchoolVisits";
import CreateVisit from "@/pages/CreateVisit";
import ViewVisit from "@/pages/ViewVisit";
import SchoolAlbum from "@/pages/SchoolAlbum";
import CommunityAlbum from "@/pages/CommunityAlbum";
import CreateActivity from "@/pages/CreateActivity";
import CollaborativeForms from "@/pages/CollaborativeForms";
import CreateCollaborativeForm from "@/pages/CreateCollaborativeForm";
import ViewCollaborativeForm from "@/pages/ViewCollaborativeForm";
import EditSchool from "@/pages/EditSchool";
import EditSchoolData from "@/pages/EditSchoolData";
import Queries from "@/pages/Queries";
import CreateQuery from "@/pages/CreateQuery";
import ViewQuery from "@/pages/ViewQuery";
import UserProfile from "@/pages/UserProfile";
import Signup from "@/pages/Signup";
import UserManagement from "@/pages/UserManagement";
import AEOUserManagement from "@/pages/AEOUserManagement";
import HeadTeacherUserManagement from "@/pages/HeadTeacherUserManagement";
import SchoolManagement from "@/pages/SchoolManagement";
import DataExport from "@/pages/DataExport";
import AEOActivityHub from "@/pages/AEOActivityHub";
import AEOActivityLogs from "@/pages/AEOActivityLogs";
import MonitoringVisitForm from "@/pages/MonitoringVisitForm";
import MentoringVisitForm from "@/pages/MentoringVisitForm";
import OfficeVisitForm from "@/pages/OfficeVisitForm";
import OtherActivityForm from "@/pages/OtherActivityForm";
import NotFound from "@/pages/not-found";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { HelpGuide } from "@/components/HelpGuide";

function DashboardRoute() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Show loading state while checking auth - prevents redirect flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Login />;

  // CEO gets CEO Dashboard
  if (user?.role === 'CEO') return <CEODashboard />;

  // DEO and DDEO get DEO Dashboard (same interface, DEO is superior in hierarchy)
  if (user?.role === 'DEO' || user?.role === 'DDEO') return <DEODashboard />;

  // All other roles get general Dashboard
  return <Dashboard />;
}

function Router() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while checking auth - prevents redirect on page refresh
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Announcement Bar - Shows at top when logged in */}
      {isAuthenticated && user && <AnnouncementBar districtId={user.districtId} />}

      <Switch>
        <Route path="/" component={DashboardRoute} />
        <Route path="/dashboard" component={DashboardRoute} />
        <Route path="/deo-dashboard" component={DEODashboard} />
        <Route path="/data-requests" component={DataRequests} />
        <Route path="/create-request" component={DataRequests} />
        <Route path="/request/:id" component={ViewRequest} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/school-data" component={SchoolData} />
        <Route path="/edit-school-data" component={EditSchool} />
        <Route path="/school-visits" component={SchoolVisits} />
        <Route path="/create-visit" component={CreateVisit} />
        <Route path="/visit/:id" component={ViewVisit} />
        <Route path="/album/:schoolId" component={SchoolAlbum} />
        <Route path="/community-album" component={CommunityAlbum} />
        <Route path="/create-activity/:schoolId" component={CreateActivity} />
        <Route path="/create-activity" component={CreateActivity} />
        <Route path="/collaborative-forms" component={CollaborativeForms} />
        <Route path="/create-collaborative-form" component={CreateCollaborativeForm} />
        <Route path="/collaborative-form/:formId" component={ViewCollaborativeForm} />
        <Route path="/edit-school" component={EditSchool} />
        <Route path="/queries" component={Queries} />
        <Route path="/create-query" component={CreateQuery} />
        <Route path="/query/:id" component={ViewQuery} />
        <Route path="/profile" component={UserProfile} />
        <Route path="/signup" component={Signup} />
        <Route path="/user-management" component={UserManagement} />
        <Route path="/aeo-user-management" component={AEOUserManagement} />
        <Route path="/headteacher-user-management" component={HeadTeacherUserManagement} />
        <Route path="/school-management" component={SchoolManagement} />
        <Route path="/data-export" component={DataExport} />
        <Route path="/aeo-activity" component={AEOActivityHub} />
        <Route path="/aeo-activity/logs" component={AEOActivityLogs} />
        <Route path="/aeo-activity/monitoring" component={MonitoringVisitForm} />
        <Route path="/aeo-activity/mentoring" component={MentoringVisitForm} />
        <Route path="/aeo-activity/office" component={OfficeVisitForm} />
        <Route path="/aeo-activity/other-activity" component={OtherActivityForm} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <VisitSessionProvider>
              <ActivitiesProvider>
                <Toaster />
                <PWAInstallBanner />
                <PWAInstallPrompt />
                <HelpGuide />
                <Router />
              </ActivitiesProvider>
            </VisitSessionProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
