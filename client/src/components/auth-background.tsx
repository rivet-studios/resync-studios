import { ReactNode } from "react";

export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_60%)]" />
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08)_0%,transparent_60%)]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.06)_0%,transparent_60%)]" />
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.05)_0%,transparent_60%)]" />
      <div className="relative z-10 w-full max-w-[420px]">{children}</div>
    </div>
  );
}
