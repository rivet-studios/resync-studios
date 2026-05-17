import { useEffect } from "react";
import { Switch, Route, useLocation, Redirect, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ErrorBoundary } from "@/components/error-boundary";
import { WakeGateway } from "@/components/wake-gateway";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider } from "@/components/auth-provider";
import { useNavigationLayout } from "@/hooks/use-navigation-layout";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import MagicLink from "@/pages/magic-link";
import Dashboard from "@/pages/dashboard";

import ForumHome from "@/pages/forums/home";
import ForumCategory from "@/pages/forums/category";
import ForumThread from "@/pages/forums/thread";
import CreateThread from "@/pages/forums/create-thread";
import EditThread from "@/pages/forums/edit-thread";
import Subscriptions from "@/pages/subscriptions";
import UserProfile from "@/pages/user";
import Settings from "@/pages/settings";
import Guidelines from "@/pages/guidelines";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import TeamDirectory from "@/pages/team-directory";
import Announcements from "@/pages/announcements";
import Projects from "@/pages/projects";
import Support from "@/pages/support";
import DMCA from "@/pages/dmca";
import CommunityStaffAgreement from "@/pages/community-staff-agreement";
import CommunityRules from "@/pages/community-rules";
import About from "@/pages/about";

import ModCP from "@/pages/modcp";
import AdminCP from "@/pages/admincp";

import Blog from "@/pages/blog";
import Store from "@/pages/store";
import StoreCategory from "@/pages/store-category";
import ProductDetail from "@/pages/product";
import CaseDetail from "@/pages/case-detail";
import Policies from "@/pages/policies";
import LegalPolicies from "@/pages/policies-legal";
import SubscriptionAgreement from "@/pages/subscription-agreement";
import EUWithdrawal from "@/pages/eu-withdrawal";
import UserSearch from "@/pages/user-search";

import Marketplace from "@/pages/marketplace";
import Appeals from "@/pages/appeals";
import MyCases from "@/pages/my-cases";

import Onboarding from "@/pages/onboarding";
import Status from "@/pages/status";
import Changelog from "@/pages/changelog";
import GiftCards from "@/pages/gift-cards";
import FAQ from "@/pages/faq";
import NotificationsPage from "@/pages/notifications";
import ActivityFeedPage from "@/pages/activity-feed";
import MessagesPage from "@/pages/messages";
import AchievementsPage from "@/pages/achievements";
import ReferralsPage from "@/pages/referrals";
import { BanWall } from "@/components/ban-wall";
import { OfflineGate } from "@/components/offline-gate";
import Intercom from '@intercom/messenger-js-sdk';
import Serrano from "@/pages/serrano";
import ProjectSerranorules from "@/pages/project-serrano-rules";
      

const ADMIN_RANKS = [
  "Gameplay Engineer",
  "Creative Designer",
  "Team Member",
  "Staff Department Director",
  "Operations Manager",
  "Company Director",
];

const MOD_RANKS = [
  "Appeals Moderator",
  "Community Moderator",
  "Community Administrator",
  "Community Senior Administrator",
  ...ADMIN_RANKS,
];

function hasRank(user: any, ranks: string[]): boolean {
  if (!user) return false;
  if (ranks.includes(user.userRank || "")) return true;
  if ((user.additionalRanks || []).some((r: string) => ranks.includes(r)))
    return true;
  return false;
}

function canAccessModCP(user: any): boolean {
  return !!user && (user.isModerator || hasRank(user, MOD_RANKS));
}

function canAccessAdminCP(user: any): boolean {
  return (
    !!user &&
    (user.isAdmin ||
      hasRank(user, ADMIN_RANKS) ||
      user.email?.toLowerCase().endsWith("@resyncstudios.com"))
  );
}

function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const [pathname] = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}

function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border/50 py-10 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">
              <div className="col-span-2 md:col-span-1 space-y-6">
                <div className="flex items-center gap-2.5">
                  <img src="/logo-rs1.png" alt="RS" className="h-10 w-auto" />
                  <h3 className="font-semibold text-base">RIVET Studios™</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Building the future of digital experiences with innovative
                  solutions and community-driven development.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground font-medium">
                  <p className="flex items-center gap-2">
                    {" "}
                    support@rivetstudiosus.com
                  </p>
                  <p className="flex items-center gap-2">
                    101 Duke Street, Sunshine, VIC, 3020, Australia
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-medium text-sm tracking-wider uppercase opacity-50">
                  Navigation
                </h4>
                <ul className="space-y-3 text-sm font-normal">
                  <li>
                    <Link
                      href="/"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/forums"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Forums
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/store"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Store
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/store/subscriptions"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Subscriptions
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="font-medium text-sm tracking-wider uppercase opacity-50">
                  Support & Resources
                </h4>
                <ul className="space-y-3 text-sm font-normal">
                  <li>
                    <Link
                      href="/support"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Knowledge Base
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/policies"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Policies
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://support.rivetstudiosus.com"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Support
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="font-medium text-sm tracking-wider uppercase opacity-50">
                  Other
                </h4>
                <ul className="space-y-3 text-sm font-normal">
                  <li>
                    <Link
                      href="/profile"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/search"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Search
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/team"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      Staff Directory
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border/50 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground font-normal">
                © 2026 RIVET Studios™, All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                Formerly RESYNC Studios™
              </p>
            </div>
          </div>
        </footer>
  );
}

function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-transparent">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 px-4 bg-[#050505]/95 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 w-full">{children}</main>
        <SiteFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}

function HeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <AppHeader />
      <main className="flex-1 w-full">{children}</main>
      <SiteFooter />
    </div>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  const { layout } = useNavigationLayout();

  if (layout === "header") {
    return <HeaderLayout>{children}</HeaderLayout>;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}

  function Router() {
    const { isLoading, user } = useAuth();
    // This watches the "user" variable. When someone logs in, it loads Intercom.
    useEffect(() => {
      if (user) {
        Intercom({
          app_id: 'an81ghfo',
          user_id: user.id,
          username: user.username, 
          email: user.email || undefined, 
          // We add new Date() here to turn the string back into a Date object
          created_at: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : undefined,
        });
      }
    }, [user]);

 const [pathname] = useLocation();
    
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

  // Standalone full-screen routes (no sidebar / header / footer)

  if (pathname === "/onboarding" || pathname.startsWith("/onboarding?")) {
    return (
      <RouteErrorBoundary>
        <ScrollToTop />
        <Route path="/onboarding" component={Onboarding} />
      </RouteErrorBoundary>
    );
  }

  return (
    <PublicLayout>
      <OfflineGate>
        <BanWall>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/magic-link" component={MagicLink} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:id" component={Announcements} />
            <Route path="/store" component={Store} />
            <Route path="/store/category/:category" component={StoreCategory} />
            <Route path="/store/product/:id" component={ProductDetail} />
            <Route path="/store/subscriptions" component={Subscriptions} />

            <Route path="/policies/legal" component={LegalPolicies} />
            <Route path="/policies" component={Policies} />
            <Route path="/policies/legal/subscriptions" component={SubscriptionAgreement} />
            <Route path="/policies/legal/eu-uk-withdrawal" component={EUWithdrawal} />
            <Route path="/forums" component={ForumHome} />
            <Route path="/forums/category/:id" component={ForumCategory} />
            <Route path="/forums/thread/:id/edit" component={EditThread} />
            <Route path="/forums/thread/:id" component={ForumThread} />
            <Route path="/forums/new">
              {user ? <CreateThread /> : <Login />}
            </Route>
            <Route path="/subscriptions">
              <Redirect to="/store/subscriptions" />
            </Route>
            <Route path="/vip">
              <Redirect to="/store/subscriptions" />
            </Route>
            <Route path="/profile" component={UserProfile} />
            <Route path="/profile/:id" component={UserProfile} />
            <Route path="/settings/:tab" component={Settings} />
            <Route path="/settings" component={Settings} />
            <Route path="/team" component={TeamDirectory} />
            <Route path="/search" component={UserSearch} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/appeals" component={Appeals} />
            <Route path="/my-cases" component={MyCases} />
            <Route path="/modcp/case/:type/:id">
              {canAccessModCP(user) ? <CaseDetail /> : <NotFound />}
            </Route>
            <Route path="/modcp/:tab">
              {canAccessModCP(user) ? <ModCP /> : <NotFound />}
            </Route>
            <Route path="/modcp">
              {canAccessModCP(user) ? <ModCP /> : <NotFound />}
            </Route>
            <Route path="/admincp/:tab">
              {canAccessAdminCP(user) ? <AdminCP /> : <NotFound />}
            </Route>
            <Route path="/admincp">
              {canAccessAdminCP(user) ? <AdminCP /> : <NotFound />}
            </Route>
            <Route path="/policies/legal/guidelines" component={Guidelines} />
            <Route path="/policies/legal/privacy" component={Privacy} />
            <Route path="/policies/legal/terms" component={Terms} />
            <Route path="/announcements" component={Announcements} />
            <Route path="/projects" component={Projects} />
            <Route path="/support" component={Support} />
            <Route path="/policies/legal/dmca" component={DMCA} />
            <Route path="/serrano-rules" component={ProjectSerranorules} />
            <Route
              path="/policies/legal/staff-terms"
              component={CommunityStaffAgreement} />
            <Route path="/community-rules" component={CommunityRules} />
            <Route path="/about" component={About} />
            <Route path="/serrano" component={Serrano} />
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/status" component={Status} />
            <Route path="/changelog" component={Changelog} />
            <Route path="/gift-cards" component={GiftCards} />
            <Route path="/faq" component={FAQ} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/activity" component={ActivityFeedPage} />
            <Route path="/messages" component={MessagesPage} />
            <Route path="/achievements" component={AchievementsPage} />
            <Route path="/referrals" component={ReferralsPage} />
            <Route component={NotFound} />
          </Switch>
        </BanWall>
      </OfflineGate>
    </PublicLayout>
  );
}

function AppInit() {
  const savedFontSize = localStorage.getItem("resync-font-size");
  if (savedFontSize === "small")
    document.documentElement.style.fontSize = "14px";
  else if (savedFontSize === "large")
    document.documentElement.style.fontSize = "18px";
  else document.documentElement.style.fontSize = "16px";
  if (localStorage.getItem("resync-reduce-motion") === "true") {
    document.documentElement.classList.add("reduce-motion");
  }
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="rivet-studios-theme">
          <TooltipProvider>
            <AppInit />
            <ScrollToTop />
            <WakeGateway>
              <RouteErrorBoundary>
                <Router />
              </RouteErrorBoundary>
            </WakeGateway>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
