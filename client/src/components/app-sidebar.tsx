import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { VipBadge } from "@/components/vip-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsernameColor } from "@/components/user-rank-badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
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
  ChevronUp,
  Shield,
  BarChart3,
  Activity,
  ScrollText,
  Gift,
  Bell,
  Rss,
  Mail,
  Trophy,
  UserPlus,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import logoSvg from "@assets/logo-rs.png";

const ADMIN_RANKS = [
  "Creative Designer",
  "Gameplay Engineer",
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

const platformItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Blog", url: "/blog", icon: BookOpen },
  { title: "Forums", url: "/forums", icon: MessageSquare },
];

const accountItems = [
  { title: "My Account", url: "/settings?tab=account", icon: User },
  { title: "Billing", url: "/settings?tab=billing", icon: CreditCard },
  { title: "Orders", url: "/settings?tab=orders", icon: Receipt },
  { title: "Payment Methods", url: "/settings?tab=payments", icon: ShoppingBag },
];

const storeItems = [
  { title: "Store", url: "/store", icon: Store },
  { title: "Subscriptions", url: "/store/subscriptions", icon: Crown },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingCart },
  { title: "Gift Cards", url: "/gift-cards", icon: Gift },
];

const supportItems = [
  { title: "Policies", url: "/policies", icon: FileText },
  { title: "Support", url: "/support", icon: HelpCircle },
  { title: "Knowledge Base", url: "/knowledge-base", icon: HelpCircle },
  { title: "Status", url: "/status", icon: Activity },
  { title: "Changelog", url: "/changelog", icon: ScrollText },
];

const communityItems = [
  { title: "Messages", url: "/messages", icon: Mail },
  { title: "Activity Feed", url: "/activity", icon: Rss },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Referrals", url: "/referrals", icon: UserPlus },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();

  const getInitials = () => {
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
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
    if (url !== "/" && location.startsWith(url.split("?")[0])) return true;
    return false;
  };

  const showModCP = user && (user.isModerator || hasRank(user, MOD_RANKS));
  const showAdminCP =
    user &&
    (user.isAdmin ||
      hasRank(user, ADMIN_RANKS) ||
      user.email?.toLowerCase().endsWith("@resyncstudios.com"));

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src={logoSvg} alt="RS" className="w-6 h-6" />
            <span className="font-semibold text-base tracking-tight">
              RIVET Studios™
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {user && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {accountItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />
          </>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {storeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Community</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {communityItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {(showModCP || showAdminCP) && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Staff Resources</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {showModCP && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive("/modcp")}
                        data-testid="sidebar-modcp"
                      >
                        <Link href="/modcp">
                          <Shield className="w-4 h-4" />
                          <span>Moderator Panel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {showAdminCP && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive("/admincp")}
                        data-testid="sidebar-admincp"
                      >
                        <Link href="/admincp">
                          <BarChart3 className="w-4 h-4" />
                          <span>Website Management</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        {user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    className="w-full justify-between"
                    data-testid="button-sidebar-user-menu"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user.profileImageUrl || undefined}
                          alt={getDisplayName()}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium truncate max-w-[120px]">
                          {getDisplayName()}
                        </span>
                        {user.vipTier && user.vipTier !== "none" && (
                          <VipBadge tier={user.vipTier as any} size="sm" />
                        )}
                      </div>
                    </div>
                    <ChevronUp className="w-4 h-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuContent
                    side="right" 
                    align="end"
                    sideOffset={16}
                    className="z-[9999] w-64 p-0 bg-zinc-900 text-zinc-50 border border-zinc-800 shadow-2xl rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-3 py-3 bg-zinc-900">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={user.profileImageUrl || undefined}
                          alt={getDisplayName()}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {(() => {
                            const styling = getUsernameColor(
                              (user as any).vipTier,
                              (user as any).userRank,
                              (user as any).additionalRanks,
                            );
                            return (
                              <span
                                className={`text-sm font-semibold uppercase tracking-wide truncate ${styling.className || ""}`}
                                style={styling.color ? { color: styling.color } : undefined}
                                data-testid="text-sidebar-username"
                              >
                                {getDisplayName()}
                              </span>
                            );
                          })()}
                          {user.vipTier && user.vipTier !== "none" && (
                            <VipBadge tier={user.vipTier as any} size="sm" />
                          )}
                        </div>
                        {user.email && (
                          <span className="text-xs text-white/40 truncate">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator className="my-0 bg-white/10" />
                    <div className="p-1">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/settings?tab=account"
                          className="cursor-pointer focus:bg-white/10"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>My Account</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/settings?tab=billing"
                          className="cursor-pointer focus:bg-white/10"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Billing</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/settings?tab=orders"
                          className="cursor-pointer focus:bg-white/10"
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          <span>Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/settings?tab=payments"
                          className="cursor-pointer focus:bg-white/10"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Payment Methods</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="my-0 bg-white/10" />
                    <div className="p-1">
                      <DropdownMenuItem asChild>
                        <Link href="/marketplace" className="cursor-pointer focus:bg-white/10">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          <span>Marketplace</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer focus:bg-white/10">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/support" className="cursor-pointer focus:bg-white/10">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          <span>Support</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="my-0 bg-white/10" />
                    <div className="p-1">
                      <DropdownMenuItem
                        onClick={() => logoutMutation.mutate()}
                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                        data-testid="button-sidebar-logout"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild data-testid="sidebar-login">
                <Link href="/login">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}