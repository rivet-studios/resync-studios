import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { VipBadge } from "@/components/vip-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Home,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  User,
  CreditCard,
  ShoppingBag,
  Receipt,
  Store,
  Crown,
  ShoppingCart,
  FileText,
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  BarChart3,
  Activity,
  ScrollText,
  Menu,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import logoSvg from "@assets/logo.svg";
import { useState } from "react";

const ADMIN_RANKS = [
  "Developer",
  "Staff Internal Affairs",
  "Team Member",
  "Staff Department Director",
  "Operations Manager",
  "Company Director",
];

const MOD_RANKS = [
  "Appeals Moderator",
  "Trial Moderator",
  "Moderator",
  "Administrator",
  "Senior Administrator",
  ...ADMIN_RANKS,
];

function hasRank(user: any, ranks: string[]): boolean {
  if (!user) return false;
  if (ranks.includes(user.userRank || "")) return true;
  if ((user.additionalRanks || []).some((r: string) => ranks.includes(r))) return true;
  return false;
}

const platformItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Blog", url: "/blog", icon: BookOpen },
  { title: "Forums", url: "/forums", icon: MessageSquare },
];

const storeItems = [
  { title: "Store", url: "/store", icon: Store },
  { title: "Subscriptions", url: "/store/subscriptions", icon: Crown },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingCart },
];

const supportItems = [
  { title: "Policies", url: "/policies", icon: FileText },
  { title: "Support", url: "/support", icon: HelpCircle },
  { title: "Status", url: "/status", icon: Activity },
  { title: "Changelog", url: "/changelog", icon: ScrollText },
];

export function AppHeader() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showModCP = !!user && (user.isModerator || hasRank(user, MOD_RANKS));
  const showAdminCP =
    !!user &&
    (user.isAdmin ||
      hasRank(user, ADMIN_RANKS) ||
      user.email?.toLowerCase().endsWith("@resyncstudios.com"));

  const getInitials = () => {
    if (user?.username) return user.username.slice(0, 2).toUpperCase();
    return "U";
  };

  const getDisplayName = () => {
    if (user?.username) return user.username;
    return user?.email || "User";
  };

  const isActive = (url: string) => {
    if (url === "/" && location === "/") return true;
    if (url.startsWith("/settings")) {
      return location.startsWith("/settings");
    }
    return url !== "/" && location.startsWith(url);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6 gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="header-logo">
          <img src={logoSvg} alt="RS" className="w-6 h-6" />
          <span className="font-semibold text-sm hidden sm:inline">RIVET Studios™</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1" data-testid="header-nav">
          {platformItems.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isActive(item.url)
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
              data-testid={`header-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {item.title}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  storeItems.some((i) => isActive(i.url))
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                data-testid="header-store-dropdown"
              >
                Store
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {storeItems.map((item) => (
                <DropdownMenuItem key={item.url} asChild>
                  <Link href={item.url} className="cursor-pointer">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  supportItems.some((i) => isActive(i.url))
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                data-testid="header-support-dropdown"
              >
                Support
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {supportItems.map((item) => (
                <DropdownMenuItem key={item.url} asChild>
                  <Link href={item.url} className="cursor-pointer">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {(showModCP || showAdminCP) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive("/modcp") || isActive("/admincp")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  data-testid="header-staff-dropdown"
                >
                  Staff
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {showModCP && (
                  <DropdownMenuItem asChild>
                    <Link href="/modcp" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>ModCP</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {showAdminCP && (
                  <DropdownMenuItem asChild>
                    <Link href="/admincp" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>AdminCP</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/50 transition-colors" data-testid="header-user-menu">
                  <Avatar className="w-7 h-7">
                    <AvatarImage
                      src={user.profileImageUrl || undefined}
                      alt={getDisplayName()}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline max-w-[100px] truncate">{getDisplayName()}</span>
                  {user.vipTier && user.vipTier !== "none" && (
                    <VipBadge tier={user.vipTier as any} size="sm" />
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.id}`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings?tab=account" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings?tab=billing" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings?tab=orders" className="cursor-pointer">
                    <Receipt className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/marketplace" className="cursor-pointer">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Marketplace</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/support" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="cursor-pointer text-destructive"
                  data-testid="header-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild data-testid="header-login">
              <Link href="/login">Login</Link>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="header-mobile-menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 p-4 border-b border-border/50">
                  <img src={logoSvg} alt="RS" className="w-6 h-6" />
                  <span className="font-semibold text-sm">RIVET Studios™</span>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                  <MobileNavSection title="Platform" items={platformItems} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
                  <MobileNavSection title="Store" items={storeItems} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
                  <MobileNavSection title="Support" items={supportItems} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
                  {(showModCP || showAdminCP) && (
                    <MobileNavSection
                      title="Staff"
                      items={[
                        ...(showModCP ? [{ title: "ModCP", url: "/modcp", icon: Shield }] : []),
                        ...(showAdminCP ? [{ title: "AdminCP", url: "/admincp", icon: BarChart3 }] : []),
                      ]}
                      isActive={isActive}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  )}
                </nav>
                <div className="border-t border-border/50 p-4">
                  {user ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-3 py-2 mb-2">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={user.profileImageUrl || undefined} alt={getDisplayName()} className="object-cover" />
                          <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{getDisplayName()}</span>
                        {user.vipTier && user.vipTier !== "none" && (
                          <VipBadge tier={user.vipTier as any} size="sm" />
                        )}
                      </div>
                      <Link href={`/profile/${user.id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => { logoutMutation.mutate(); setMobileOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-destructive hover:bg-accent/50 transition-colors w-full"
                        data-testid="header-mobile-logout"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                      <User className="w-4 h-4" />
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileNavSection({
  title,
  items,
  isActive,
  onNavigate,
}: {
  title: string;
  items: { title: string; url: string; icon: any }[];
  isActive: (url: string) => boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="px-3 mb-4">
      <p className="px-3 mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      {items.map((item) => (
        <Link
          key={item.url}
          href={item.url}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive(item.url)
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }`}
        >
          <item.icon className="w-4 h-4" />
          {item.title}
        </Link>
      ))}
    </div>
  );
}
