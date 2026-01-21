import { Switch, Route, useLocation, Redirect, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { MainHeader } from "@/components/main-header";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider } from "@/components/auth-provider";

import NotFound from "@/pages/not-found";
import Unauthorized from "@/pages/unauthorized";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Groups from "@/pages/groups";
import ForumHome from "@/pages/forums/home";
import ForumCategory from "@/pages/forums/category";
import ForumThread from "@/pages/forums/thread";
import CreateThread from "@/pages/forums/create-thread";
import Subscriptions from "@/pages/subscriptions";
import UserProfile from "@/pages/user";
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
import ProjectCatalinarules from "@/pages/project-catalina-rules";
import VolunteerStaffAgreement from "@/pages/volunteer-staff-agreement";
import LEOGuidelines from "@/pages/leo-guidelines";
import CommunityRules from "@/pages/community-rules";
import AboutRS from "@/pages/about-rs";
import Catalina from "@/pages/catalina";
import Chat from "@/pages/chat";
import Admin from "@/pages/admin";
import ModCP from "@/pages/modcp";
import AdminCP from "@/pages/admincp";
import Builds from "@/pages/builds";
import Blog from "@/pages/blog";
import Store from "@/pages/store";
import Policies from "@/pages/policies";
import UserSearch from "@/pages/user-search";
import Checkout from "@/pages/checkout";

import Onboarding from "@/pages/onboarding";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="bg-card border-t border-border/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-1.5 rounded-lg">
                  <img src="/attached_assets/logo.svg" alt="RS" className="w-5 h-5 invert" />
                </div>
                <h3 className="font-bold text-lg">REACT Studios™</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Building the future of digital experiences with innovative
                solutions and community-driven development.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground font-medium">
                <p className="flex items-center gap-2">✉️ contact@reactstudios.com</p>
                <p className="flex items-center gap-2">📍 3655 Torrance Blvd, 3rd Floor 6015, Torrance, CA, 90503</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-sm tracking-wider uppercase opacity-50">Navigation</h4>
              <ul className="space-y-3 text-sm font-semibold">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">🏠 Home</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-foreground flex items-center gap-2">📰 Blog</Link></li>
                <li><Link href="/forums" className="text-muted-foreground hover:text-foreground flex items-center gap-2">⚖️ Forums</Link></li>
                <li><Link href="/store" className="text-muted-foreground hover:text-foreground flex items-center gap-2">🛒 Store</Link></li>
                <li><Link href="/subscriptions" className="text-muted-foreground hover:text-foreground flex items-center gap-2">🔄 Subscriptions</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-sm tracking-wider uppercase opacity-50">Support & Resources</h4>
              <ul className="space-y-3 text-sm font-semibold">
                <li><Link href="/support" className="text-muted-foreground hover:text-foreground flex items-center gap-2">❓ Knowledge Base</Link></li>
                <li><Link href="/policies" className="text-muted-foreground hover:text-foreground flex items-center gap-2">📋 Policies</Link></li>
                <li><Link href="/guidelines" className="text-muted-foreground hover:text-foreground flex items-center gap-2">📖 Support</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-sm tracking-wider uppercase opacity-50">Other</h4>
              <ul className="space-y-3 text-sm font-semibold">
                <li><Link href="/settings" className="text-muted-foreground hover:text-foreground flex items-center gap-2">👤 My Account</Link></li>
                <li><Link href="/search" className="text-muted-foreground hover:text-foreground flex items-center gap-2">🔍 Search</Link></li>
                <li><Link href="/store" className="text-muted-foreground hover:text-foreground flex items-center gap-2">🛍️ Shopping Cart</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground font-medium">
              © 2026 REACT Studios™. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              Made with <span className="text-red-500">❤️</span> by Deschutes Design Group LLC
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  const { isLoading, user } = useAuth();

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
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/blog" component={Blog} />
        <Route path="/store" component={Store} />
        <Route path="/store/subscriptions" component={Subscriptions} />
        <Route path="/checkout/:tierId" component={Checkout} />
        <Route path="/policies" component={Policies} />
        <Route path="/forums" component={ForumHome} />
        <Route path="/forums/category/:id" component={ForumCategory} />
        <Route path="/forums/thread/:id" component={ForumThread} />
        <Route path="/forums/new">{user ? <CreateThread /> : <Login />}</Route>
        <Route path="/subscriptions">
          <Redirect to="/store/subscriptions" />
        </Route>
        <Route path="/vip">
          <Redirect to="/store/subscriptions" />
        </Route>
        <Route path="/user" component={UserProfile} />
        <Route path="/profile/:id" component={UserProfile} />
        <Route path="/settings" component={Settings} />
        <Route path="/team" component={StaffDirectory} />
        <Route path="/search" component={UserSearch} />
        <Route path="/builds" component={Builds} />
        <Route path="/chat" component={Chat} />
        <Route path="/groups" component={Groups} />
        <Route path="/admin" component={Admin} />
        <Route path="/modcp">
          {user?.isModerator || user?.isAdmin ? <ModCP /> : <Unauthorized />}
        </Route>
        <Route path="/admincp">
          {user?.isAdmin || user?.email?.endsWith("@resyncstudios.com") ? (
            <AdminCP />
          ) : (
            <Unauthorized />
          )}
        </Route>
        <Route path="/guidelines" component={Guidelines} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/news" component={News} />
        <Route path="/projects" component={Projects} />
        <Route path="/support" component={Support} />
        <Route path="/volunteer" component={VolunteerModeration} />
        <Route path="/dmca" component={DMCA} />
        <Route path="/catalina-rules" component={ProjectCatalinarules} />
        <Route
          path="/volunteer-agreement"
          component={VolunteerStaffAgreement}
        />
        <Route path="/leo-guidelines" component={LEOGuidelines} />
        <Route path="/community-rules" component={CommunityRules} />
        <Route path="/about" component={AboutRS} />
        <Route path="/catalina" component={Catalina} />
        <Route path="/onboarding" component={Onboarding} />
        <Route component={NotFound} />
        <Route path="/unauthorized" component={Unauthorized} />
      </Switch>
    </PublicLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="rivet-studios-theme">
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
