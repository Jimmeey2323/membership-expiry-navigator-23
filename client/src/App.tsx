import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Tickets from "@/pages/tickets";
import NewTicket from "@/pages/ticket-new";
import TicketDetail from "@/pages/ticket-detail";
import Analytics from "@/pages/analytics";
import Teams from "@/pages/teams";
import Studios from "@/pages/studios";
import Categories from "@/pages/categories";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/tickets/new" component={NewTicket} />
      <Route path="/tickets/:id" component={TicketDetail} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/teams" component={Teams} />
      <Route path="/studios" component={Studios} />
      <Route path="/categories" component={Categories} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-white via-blue-50 to-white dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-base font-semibold text-blue-700 dark:text-blue-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden app-glass">
          <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-transparent bg-transparent backdrop-blur-md supports-[backdrop-filter]:bg-transparent shadow-sm">
            <SidebarTrigger className="text-accent hover:text-accent-foreground transition-colors" data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user && (
                <div className="flex items-center gap-4 pl-4 border-l border-blue-200 dark:border-blue-900/50">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold text-accent-foreground">{user.firstName || user.email || 'User'}</span>
                    <span className="text-xs text-accent">{user.email}</span>
                  </div>
                  <button
                    className="text-sm px-4 py-2 rounded-lg border border-accent hover:bg-accent/6 transition-colors font-medium text-accent-foreground"
                    onClick={() => signOut()}
                    data-testid="button-signout"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
            <AuthenticatedRoutes />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="physique57-theme">
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
