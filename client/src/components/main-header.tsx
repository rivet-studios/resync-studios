import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Search,
  ShoppingCart,
  FolderOpen,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { SearchDialog } from "@/components/search-dialog";
import logoSvg from "@assets/logo.svg";

export function MainHeader() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Forums", href: "/forums" },
    { label: "Store", href: "/store" },
    { label: "Subscriptions", href: "/store/subscriptions" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 border-b border-border/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link
              href="/"
              className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity group"
            >
              <div className="bg-slate-900 p-1.5 rounded-lg">
                <img src={logoSvg} alt="RS" className="w-5 h-5 invert" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                RIVET Studios™
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-8">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={`text-sm font-semibold h-10 px-4 rounded-xl ${window.location.pathname === item.href ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-xl h-10 w-10 text-muted-foreground hover:text-foreground"
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-xl h-10 w-10 text-muted-foreground hover:text-foreground"
                data-testid="button-cart"
              >
                <Link href="/store">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                data-testid="button-policies"
              >
                <Link href="/policies">
                  <FolderOpen className="w-5 h-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                data-testid="button-support"
              >
                <a
                  href="https://support.resyncstudios.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BookOpen className="w-5 h-5" />
                </a>
              </Button>

              <ThemeToggle />

              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  data-testid="button-login"
                >
                  <Link href="/login">Login</Link>
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
                data-testid="button-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
