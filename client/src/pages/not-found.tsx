import { ArrowLeft, Compass, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-background"
      data-testid="page-not-found"
    >
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-2xl shadow-black/10">
          {/* Subtle ambient background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />
          </div>

          <div className="relative px-6 py-10 sm:px-10 sm:py-12 text-center">
            {/* Status icon */}
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
              <Compass className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* Status code */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
              Error 404
            </p>

            {/* Heading */}
            <h1
              className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
              data-testid="text-not-found-title"
            >
              Page not found
            </h1>

            {/* Description */}
            <p
              className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground"
              data-testid="text-not-found-description"
            >
              The page you're looking for doesn't exist, may have been moved,
              or is no longer available.
            </p>

            {/* Actions */}
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2"
                onClick={() => window.history.back()}
                data-testid="button-go-back"
              >
                <ArrowLeft className="h-4 w-4" />
                Go back
              </Button>

              <Button
                className="w-full sm:w-auto gap-2"
                onClick={() => setLocation("/")}
                data-testid="button-go-home"
              >
                <Home className="h-4 w-4" />
                Go home
              </Button>
            </div>
          </div>

          {/* Footer strip */}
          <div className="relative border-t border-border/50 bg-muted/10 px-6 py-3 text-center">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/50">
              RIVET Studios
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}