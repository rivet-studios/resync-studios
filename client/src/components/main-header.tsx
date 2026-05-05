import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { rankConfig } from "@/components/user-rank-badge";
import {
  Search,
  ShoppingCart,
  FolderOpen,
  BookOpen,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Shield,
  LayoutDashboard,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { SearchDialog } from "@/components/search-dialog";
import logoSvg from "@assets/logo.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MainHeader() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Forums", href: "/forums" },
    { label: "Store", href: "/store" },
    { label: "Subscriptions", href: "/store/subscriptions" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#050505]/80 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src={logoSvg}
                alt="RS"
                className="w-7 h-7 transition-transform group-hover:scale-105"
              />
              <span className="font-semibold text-[15px] tracking-tight text-white">
                RIVET Studios™
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive(item.href)
                        ? "text-white bg-white/5"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {item.label}
                  </button>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 mr-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-10 w-10 transition-all"
              >
                <Search className="w-5 h-5" />
              </Button>

              <Link href="/store">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-10 w-10 transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/policies">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-10 w-10 transition-all"
                >
                  <FolderOpen className="w-5 h-5" />
                </Button>
              </Link>

              <a
                href="https://support.rivetstudiosus.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-10 w-10 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                </Button>
              </a>
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all overflow-hidden"
                  >
                    <Avatar className="h-full w-full rounded-xl">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-white/5 text-white/40 font-bold uppercase">
                        {(user.username || user.email || "U")[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 mt-2 bg-[#121212] border-white/5 p-2 rounded-xl shadow-2xl"
                  align="end"
                >
                  <div className="flex items-center gap-3 p-4 border-b border-white/5 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      {(() => {
                        const rc = rankConfig[user.userRank || ""];
                        const isLifetime = user.userRank === "Lifetime" && rc?.isGradient;
                        return (
                          <span
                            className="text-sm font-semibold truncate"
                            style={isLifetime ? {
                              color: "transparent",
                              backgroundImage: rc.gradient,
                              WebkitBackgroundClip: "text",
                              backgroundClip: "text",
                            } : { color: "white" }}
                          >
                            {user.username}
                          </span>
                        );
                      })()}
                      <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest truncate">
                        {user.userRank}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-white/5 focus:text-white py-3 cursor-pointer"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 w-full"
                    >
                      <LayoutDashboard className="w-4 h-4 opacity-50" />
                      <span className="font-medium text-sm">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-white/5 focus:text-white py-3 cursor-pointer"
                  >
                    <Link
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 w-full"
                    >
                      <UserIcon className="w-4 h-4 opacity-50" />
                      <span className="font-medium text-sm">My Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  {(user.isAdmin ||
                    user.isModerator ||
                    [
                      "Appeals Moderator",
                      "Trial Moderator",
                      "Community Moderator",
                      "Community Admin",
                      "Communitu Senior Admin",
                      "Gameplay Engineer",
                      "Creative Designer",
                      "Staff Internal Affairs",
                      "Team Member",
                      "Staff Department Director",
                      "Operations Manager",
                      "Company Director",
                    ].includes(user.userRank || "")) && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/modcp" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>ModCP</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admincp" className="cursor-pointer">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          <span>AdminCP</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-white/5 focus:text-white py-3 cursor-pointer"
                  >
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 w-full"
                    >
                      <Settings className="w-4 h-4 opacity-50" />
                      <span className="font-medium text-sm">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  <DropdownMenuItem
                    className="rounded-xl focus:bg-red-500/10 focus:text-red-500 py-3 cursor-pointer text-red-500/70"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="h-10 px-6 bg-white text-black rounded-lg font-medium text-[13px] transition-all active:scale-95">
                  LOGIN
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white/40 hover:text-white hover:bg-white/5 rounded-xl ml-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-[#0a0a0a] border-b border-white/5 p-6 space-y-4 animate-in slide-in-from-top duration-300 shadow-2xl z-50">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full text-left px-5 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive(item.href)
                        ? "text-white bg-white/5"
                        : "text-white/40 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    {item.label}
                  </button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
