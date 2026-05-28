import { Router, Switch, Route } from "wouter";

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { ApiErrorHandler } from "@/components/api-error-handler";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ForestMap from "@/pages/forest-map";
import Inventory from "@/pages/inventory";
import Reports from "@/pages/reports";
import Schedule from "@/pages/schedule";
import Users from "@/pages/users";
import Settings from "@/pages/settings";

function AppRouter() {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/forest-map" component={ForestMap} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/reports" component={Reports} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/users" component={Users} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ApiErrorHandler />
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
