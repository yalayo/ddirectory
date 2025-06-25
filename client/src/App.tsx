import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import ContractorProfile from "@/pages/contractor-profile";
import BookService from "@/pages/book-service";
import ManagerDashboard from "@/pages/manager-dashboard";
import ManagerLogin from "@/pages/manager-login";
import LeadsManagement from "@/pages/leads-management";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/contractor/:id" component={ContractorProfile} />
      <Route path="/book-service/:id" component={BookService} />
      <Route path="/manager/login" component={ManagerLogin} />
      <Route path="/manager" component={ManagerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
