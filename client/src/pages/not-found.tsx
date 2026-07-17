import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Gamepad2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--primary)/0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full gap-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
          <Gamepad2 className="w-8 h-8 text-primary" />
        </div>

        <div>
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Error 404
          </p>
          <h1
            className="text-7xl sm:text-8xl font-black text-foreground leading-none tracking-tight"
            data-testid="text-404-heading"
          >
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-4">
            Page not found
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">
            Looks like this page got sent back to the workshop. It might have
            been moved, removed, or never existed in the first place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
          <Button asChild size="lg" data-testid="link-go-home">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            data-testid="button-go-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground mt-4 pt-4 border-t border-border w-full justify-center">
          <Link href="/forums" className="hover:text-foreground transition-colors">
            Forums
          </Link>
          <Link href="/store" className="hover:text-foreground transition-colors">
            Store
          </Link>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <Link href="/support" className="hover:text-foreground transition-colors">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
