import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  Users,
  MessageSquare,
  BarChart3,
  Gamepad2,
  Shield,
  Globe,
} from "lucide-react";
import { Link } from "wouter";

const stats = [
  { value: 75.7, label: "Connected Members", suffix: "K+" },
  { value: 61.2, label: "Discord Members", suffix: "K+" },
  { value: 310.9, label: "Roblox Members", suffix: "K+" },
  { value: 31.2, label: "Active Discussions", suffix: "K+" },
  { value: 99.9, label: "Uptime", suffix: "%" },
  { value: 24, label: "Support", suffix: "/7" },
];

const features = [
  {
    icon: Users,
    title: "Member Management",
    description:
      "Comprehensive member management with detailed profiles, statistics tracking, and powerful community moderation tools.",
  },
  {
    icon: MessageSquare,
    title: "Community Forums",
    description:
      "Built-in forum system with real-time discussions, announcements, and engaging spaces for our community.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Advanced analytics providing deep insights into member engagement and community growth metrics.",
  },
  {
    icon: Gamepad2,
    title: "Game Integration",
    description:
      "Advanced game development integration supporting high-fidelity experiences across platforms.",
  },
  {
    icon: Shield,
    title: "Security & Moderation",
    description:
      "Advanced security systems ensuring fair play and safe gaming environments with robust monitoring.",
  },
  {
    icon: Globe,
    title: "Global Infrastructure",
    description:
      "Worldwide server network delivering high-fidelity gaming experiences with low latency globally.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-400/20 blur-[150px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-pink-400/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-32 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-12 max-w-5xl mx-auto">
          <div className="space-y-6">
             <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-muted-foreground bg-white/50 dark:bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full w-fit mx-auto border border-border/50">
                <span className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">🚀 Now powering <span className="text-foreground font-bold">75.7K+</span> members</span>
                <span className="opacity-20">|</span>
                <span className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">👥 <span className="text-foreground font-bold">10.1K</span> online</span>
                <span className="opacity-20">|</span>
                <span className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">🎮 <span className="text-foreground font-bold">310.9K</span> members</span>
             </div>
            
            <h1 className="text-6xl sm:text-8xl font-bold tracking-tight text-foreground leading-[1.1]">
              The number one online <br />
              <span className="text-foreground">gaming community platform</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
              REACT Studios™ creates an open gaming environment accessible to everyone, delivering high-fidelity games through our exceptional game development expertise and building online communities.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 px-10 h-14 text-lg font-bold rounded-xl" asChild>
              <Link href="/signup">Join The Community</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white dark:bg-transparent border-border hover:bg-muted px-10 h-14 text-lg font-bold rounded-xl" asChild>
              <Link href="/store">Browse Store</Link>
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 border-t border-border/50 pt-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <div className="text-4xl font-bold text-foreground tracking-tighter">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Features Section */}
        <section className="space-y-20 pt-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">Everything you need for thriving communities</h2>
            <p className="text-lg text-muted-foreground font-medium">Our gaming platform provides all the essential tools needed to build thriving communities</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border border-border/50 shadow-sm bg-card hover:shadow-xl transition-all duration-300 group rounded-2xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}}      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-32">
        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="text-4xl font-black text-slate-900 tracking-tighter">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Features Grid */}
        <section className="space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Innovative Solutions</h2>
            <p className="text-lg text-slate-500 font-medium">Our platform provides the essential tools needed to build thriving communities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-none shadow-sm bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-slate-900" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
