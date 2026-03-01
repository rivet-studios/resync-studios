import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  Users,
  MessageSquare,
  BarChart3,
  Gamepad2,
  Shield,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

const stats = [
  { value: 15, label: "Connected Members", suffix: "K+" },
  { value: 20, label: "Discord Members", suffix: "K+" },
  { value: 25, label: "Roblox Members", suffix: "K+" },
  { value: 36.6, label: "Active Discussions", suffix: "K+" },
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
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://i.imgur.com/a/car-fire-sbi-resync-studios-project-foxtrot-teaser-AjnovPK.png")' }}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
          <div className="space-y-4 max-w-4xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/40 backdrop-blur-md px-4 py-1 hover:bg-white/30 transition-colors">
              Building the Future of Digital Experiences
            </Badge>
            <h1 className="text-6xl sm:text-8xl font-bold tracking-tight text-white leading-tight drop-shadow-2xl">
              RIVET Studios™
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto font-semibold drop-shadow-lg">
              We create open gaming environments accessible to everyone, delivering high-fidelity games through exceptional expertise.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button size="lg" className="bg-[#0071b2] text-white hover:bg-[#005d92] px-10 h-16 text-xl font-bold shadow-2xl rounded-2xl transition-all hover:scale-105 active:scale-95" asChild>
              <Link href="/signup">Join Community</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md px-10 h-16 text-xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-3">
                <div className="text-5xl font-black text-[#0071b2] tracking-tighter">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 space-y-20">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">Everything you need for thriving communities</h2>
            <p className="text-xl text-slate-600 font-medium leading-relaxed">Our gaming platform provides all the essential tools needed to build thriving communities</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-none shadow-xl bg-slate-50 hover:bg-white hover:shadow-2xl transition-all duration-500 group rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-10 space-y-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center group-hover:bg-[#0071b2] group-hover:text-white transition-all duration-500 shadow-lg group-hover:scale-110">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#0071b2] transition-colors">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed font-medium text-lg">{feature.description}</p>
                    </div>
                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-[#0071b2] text-lg font-bold group-hover:gap-3 transition-all">
                      Learn more <ArrowRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
    </div>
  );
}
