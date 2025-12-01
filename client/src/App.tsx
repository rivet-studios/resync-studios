import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Clans from "@/pages/clans";
import Forums from "@/pages/forums";
import ForumThread from "@/pages/forums/thread";
import VIP from "@/pages/vip";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Guidelines from "@/pages/guidelines";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import StaffDirectory from "@/pages/staff-directory";
import Announcements from "@/pages/announcements";
import Projects from "@/pages/projects";
import Support from "@/pages/support";
import VolunteerModeration from "@/pages/volunteer-moderation";
import DMCA from "@/pages/dmca";
import ProjectReimaginedrules from "@/pages/project-reimagined-rules";
import VolunteerStaffAgreement from "@/pages/volunteer-staff-agreement";
import LEOGuidelines from "@/pages/leo-guidelines";
import CommunityRules from "@/pages/community-rules";
import AboutMetro from "@/pages/about-metro";
import FortLoredo from "@/pages/fort-loredo";
import Chat from "@/pages/chat";
import Admin from "@/pages/admin";
import ModCP from "@/pages/modcp";
import AdminCP from "@/pages/admin-cp";

// Full layout with sidebar (authenticated users)
function AppLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (response.ok) {
        setLocation("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between h-14 px-4 border-b shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                data-testid="button-logout"
                className="text-sm px-3 py-1 rounded hover:bg-muted transition-colors"
              >
                Logout
              </button>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Simple layout for public pages (unauthenticated users)
function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="flex items-center justify-between h-14 px-4 border-b shrink-0">
        <div className="font-display font-bold text-lg">RESYNC Studios</div>
        <div className="flex gap-2">
          {!user ? (
            <>
              <a href="/login" className="text-sm hover:underline">Login</a>
              <a href="/signup" className="text-sm hover:underline">Sign Up</a>
            </>
          ) : null}
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}

// Protected route component - redirects to login if not authenticated
function ProtectedRoute({ component: Component }: { component: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}

function AuthenticatedRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/landing" component={Landing} />
        <Route path="/clans" component={Clans} />
        <Route path="/forums" component={Forums} />
        <Route path="/forums/thread/:id" component={ForumThread} />
        <Route path="/chat" component={Chat} />
        <Route path="/vip" component={VIP} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/admin" component={Admin} />
        <Route path="/modcp" component={ModCP} />
        <Route path="/admin-cp" component={AdminCP} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function PublicRoutes() {
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/forums" component={Forums} />
        <Route path="/forums/thread/:id" component={ForumThread} />
        <Route path="/staff" component={StaffDirectory} />
        <Route path="/guidelines" component={Guidelines} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/announcements" component={Announcements} />
        <Route path="/projects" component={Projects} />
        <Route path="/support" component={Support} />
        <Route path="/volunteer" component={VolunteerModeration} />
        <Route path="/dmca" component={DMCA} />
        <Route path="/project-reimagined-rules" component={ProjectReimaginedrules} />
        <Route path="/volunteer-agreement" component={VolunteerStaffAgreement} />
        <Route path="/leo-guidelines" component={LEOGuidelines} />
        <Route path="/community-rules" component={CommunityRules} />
        <Route path="/about" component={AboutMetro} />
        <Route path="/fort-loredo" component={FortLoredo} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PublicRoutes />;
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="react-studios-theme">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
