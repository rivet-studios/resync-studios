import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { MainHeader } from "@/components/main-header";
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
import Subscriptions from "@/pages/subscriptions";
import User from "@/pages/user";
import Settings from "@/pages/settings";
import Guidelines from "@/pages/guidelines";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import StaffDirectory from "@/pages/staff-directory";
import News from "@/pages/news";
import Projects from "@/pages/projects";
import Support from "@/pages/support";
import VolunteerModeration from "@/pages/volunteer-moderation";
import DMCA from "@/pages/dmca";
import ProjectFoxtrotrules from "@/pages/project-foxtrot-rules";
import VolunteerStaffAgreement from "@/pages/volunteer-staff-agreement";
import LEOGuidelines from "@/pages/leo-guidelines";
import CommunityRules from "@/pages/community-rules";
import AboutRS from "@/pages/about-rs";
import FortLoredo from "@/pages/fort-loredo";
import Chat from "@/pages/chat";
import Admin from "@/pages/admin";
import ModCP from "@/pages/modcp";
import AdminCP from "@/pages/admincp";
import Builds from "@/pages/builds";
import Blog from "@/pages/blog";
import Store from "@/pages/store";
import Policies from "@/pages/policies";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-card border-t border-border/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">RIVET Studios™</h3>
              <p className="text-sm text-muted-foreground">
                Building the future of digital experiences with innovative
                solutions and community-driven development.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/forums"
                    className="hover:text-foreground transition-colors"
                  >
                    Forums
                  </a>
                </li>
                <li>
                  <a
                    href="/subscriptions"
                    className="hover:text-foreground transition-colors"
                  >
                    Subscriptions
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">
                Support & Resources
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/support"
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="/policies"
                    className="hover:text-foreground transition-colors"
                  >
                    Policies
                  </a>
                </li>
                <li>
                  <a
                    href="/guidelines"
                    className="hover:text-foreground transition-colors"
                  >
                    Guidelines
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Other</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/team"
                    className="hover:text-foreground transition-colors"
                  >
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="/news"
                    className="hover:text-foreground transition-colors"
                  >
                    News
                  </a>
                </li>
                <li>
                  <a
                    href="/projects"
                    className="hover:text-foreground transition-colors"
                  >
                    Projects
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8">
            <p className="text-xs text-muted-foreground text-center">
              © 2025 RIVET Studios™. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  const { isLoading } = useAuth();

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

  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route
          path="/api/auth/discord"
          component={() => {
            // This route should be handled by the backend, but we add it to the frontend
            // to prevent 404s if the browser tries to render it before the redirect
            window.location.href = "/dashboard";
            return null;
          }}
        />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/blog" component={Blog} />
        <Route path="/store" component={Store} />
        <Route path="/policies" component={Policies} />
        <Route path="/forums" component={Forums} />
        <Route path="/forums/thread/:id" component={ForumThread} />
        <Route path="/subscriptions" component={Subscriptions} />
        <Route path="/user" component={User} />
        <Route path="/settings" component={Settings} />
        <Route path="/team" component={StaffDirectory} />
        <Route path="/staff" component={StaffDirectory} />
        <Route path="/staff-directory" component={StaffDirectory} />
        <Route path="/builds" component={Builds} />
        <Route path="/chat" component={Chat} />
        <Route path="/clans" component={Clans} />
        <Route path="/admin" component={Admin} />
        <Route path="/modcp" component={ModCP} />
        <Route path="/admincp" component={AdminCP} />
        <Route path="/guidelines" component={Guidelines} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/news" component={News} />
        <Route path="/projects" component={Projects} />
        <Route path="/support" component={Support} />
        <Route path="/volunteer" component={VolunteerModeration} />
        <Route path="/dmca" component={DMCA} />
        <Route path="/project-foxtrot-rules" component={ProjectFoxtrotrules} />
        <Route
          path="/volunteer-agreement"
          component={VolunteerStaffAgreement}
        />
        <Route path="/leo-guidelines" component={LEOGuidelines} />
        <Route path="/community-rules" component={CommunityRules} />
        <Route path="/about" component={AboutRS} />
        <Route path="/fort-loredo" component={FortLoredo} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="resync-studios-theme">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
