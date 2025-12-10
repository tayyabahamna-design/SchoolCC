import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CEODashboard from "@/pages/CEODashboard";
import DataRequests from "@/pages/DataRequests";
import CreateRequest from "@/pages/CreateRequest";
import ViewRequest from "@/pages/ViewRequest";
import Calendar from "@/pages/Calendar";
import SchoolData from "@/pages/SchoolData";
import SchoolVisits from "@/pages/SchoolVisits";
import CreateVisit from "@/pages/CreateVisit";
import ViewVisit from "@/pages/ViewVisit";
import SchoolAlbum from "@/pages/SchoolAlbum";
import CreateActivity from "@/pages/CreateActivity";
import CollaborativeForms from "@/pages/CollaborativeForms";
import CreateCollaborativeForm from "@/pages/CreateCollaborativeForm";
import ViewCollaborativeForm from "@/pages/ViewCollaborativeForm";
import EditSchool from "@/pages/EditSchool";
import Queries from "@/pages/Queries";
import CreateQuery from "@/pages/CreateQuery";
import ViewQuery from "@/pages/ViewQuery";
import NotFound from "@/pages/not-found";

function DashboardRoute() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Login />;
  return user?.role === 'CEO' ? <CEODashboard /> : <Dashboard />;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/" component={DashboardRoute} />
      <Route path="/dashboard" component={DashboardRoute} />
      <Route path="/data-requests" component={DataRequests} />
      <Route path="/create-request" component={CreateRequest} />
      <Route path="/request/:id" component={ViewRequest} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/school-data" component={SchoolData} />
      <Route path="/school-visits" component={SchoolVisits} />
      <Route path="/create-visit" component={CreateVisit} />
      <Route path="/visit/:id" component={ViewVisit} />
      <Route path="/album/:schoolId" component={SchoolAlbum} />
      <Route path="/create-activity/:schoolId" component={CreateActivity} />
      <Route path="/collaborative-forms" component={CollaborativeForms} />
      <Route path="/create-collaborative-form" component={CreateCollaborativeForm} />
      <Route path="/collaborative-form/:formId" component={ViewCollaborativeForm} />
      <Route path="/edit-school" component={EditSchool} />
      <Route path="/queries" component={Queries} />
      <Route path="/create-query" component={CreateQuery} />
      <Route path="/query/:id" component={ViewQuery} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
