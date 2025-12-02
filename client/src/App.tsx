import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import DataRequests from "@/pages/DataRequests";
import CreateRequest from "@/pages/CreateRequest";
import ViewRequest from "@/pages/ViewRequest";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Dashboard : Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/data-requests" component={DataRequests} />
      <Route path="/create-request" component={CreateRequest} />
      <Route path="/request/:id" component={ViewRequest} />
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
