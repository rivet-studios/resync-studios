import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/animated-counter";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Gamepad2, 
  Shield, 
  Globe,
  Star,
  ChevronRight,
  Zap,
  Crown,
  Target,
  Swords
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";

const stats = [
  { value: 69300, label: "Connected Members", suffix: "+" },
  { value: 59900, label: "Discord Members", suffix: "+" },
  { value: 293600, label: "Roblox Members", suffix: "+" },
  { value: 34800, label: "Active Discussions", suffix: "+" },
  { value: 99.9, label: "Uptime", suffix: "%" },
  { value: 24, label: "Support", suffix: "/7" },
];

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Comprehensive member management with detailed profiles, statistics tracking, and powerful community moderation tools."
  },
  {
    icon: MessageSquare,
    title: "Community Forums",
    description: "Built-in forum system with real-time chat, announcements, and engaging discussion spaces for your community."
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Advanced analytics providing deep insights into member engagement and community growth to enhance our high-fidelity gaming experiences."
  },
  {
    icon: Gamepad2,
    title: "Game Integration",
    description: "Advanced game development integration supporting high-fidelity experiences across platforms with custom server capabilities."
  },
  {
    icon: Shield,
    title: "Security & Moderation",
    description: "Advanced security systems ensuring fair play and safe gaming environments with robust anti-cheat and monitoring capabilities."
  },
  {
    icon: Globe,
    title: "Global Infrastructure",
    description: "Worldwide server network delivering high-fidelity gaming experiences with low latency and high availability for members globally."
  },
];

const testimonials = [
  {
    quote: "The REACT Studios\u2122 platform revolutionized our community management. The high-fidelity game development tools are exceptional and our players love the seamless experience.",
    company: "GameForge Studios",
    rating: 5
  },
  {
    quote: "Their open gaming environment and advanced development capabilities helped us create high-fidelity experiences that grew our community from 1,000 to 50,000 players in 6 months.",
    company: "Pixel Dynamics",
    rating: 5
  },
  {
    quote: "Outstanding open gaming platform with exceptional development support. The seamless integration enabled us to deliver high-fidelity games and increased community engagement by 300%.",
    company: "Nova Interactive",
    rating: 5
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">REACT Studios</span>
              <Badge variant="secondary" className="hidden sm:inline-flex">Beta</Badge>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">Features</a>
              <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-community">Community</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-testimonials">Testimonials</a>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild data-testid="button-login">
                <a href="/api/login">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-3/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 gap-2">
            <Zap className="w-3.5 h-3.5" />
            <span>The #1 Gaming Community Platform</span>
          </Badge>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Build Thriving
            <span className="gradient-text"> Gaming Communities</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            REACT Studios\u2122 creates an open gaming environment accessible to everyone, 
            delivering high-fidelity games through exceptional development expertise and 
            building online communities.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="glow-primary-hover px-8" asChild data-testid="button-get-started">
              <a href="/api/login">
                Get Started Free
                <ChevronRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
              <a href="#features">Learn More</a>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    <AnimatedCounter 
                      end={stat.value} 
                      suffix={stat.suffix}
                      duration={2000 + index * 200}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Integrations */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-3 text-muted-foreground">
              <SiDiscord className="w-8 h-8" />
              <span className="font-semibold">Discord Integration</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <SiRoblox className="w-8 h-8" />
              <span className="font-semibold">Roblox Integration</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Crown className="w-8 h-8" />
              <span className="font-semibold">VIP Subscriptions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Everything you need for thriving communities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our gaming platform provides all the essential tools needed to build thriving 
              communities and deliver exceptional high-fidelity gaming experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section id="community" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Community</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Connect, Compete, Conquer
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of gamers in our thriving community. Find teammates with LFG matchmaking, 
                build your clan, share strategies, and climb the ranks together.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-chart-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">LFG Matchmaking</h3>
                    <p className="text-muted-foreground">Find the perfect teammates based on skill level, role preferences, and availability.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-chart-2" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Clan Hubs</h3>
                    <p className="text-muted-foreground">Create or join clans with custom pages, rosters, and recruitment systems.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                    <Swords className="w-5 h-5 text-chart-3" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Build & Meta Sharing</h3>
                    <p className="text-muted-foreground">Share and discover the best builds, strategies, and loadouts from top players.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="col-span-2 bg-gradient-to-br from-primary/10 to-chart-3/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">VIP Subscriptions</p>
                      <p className="text-sm text-muted-foreground">Unlock exclusive features</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="vip-bronze border-0">Bronze</Badge>
                    <Badge className="vip-sapphire border-0">Sapphire</Badge>
                    <Badge className="vip-diamond border-0">Diamond</Badge>
                    <Badge className="vip-founders border-0">Founders</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <SiDiscord className="w-10 h-10 text-[#5865F2] mb-3" />
                  <p className="font-semibold">Discord Linking</p>
                  <p className="text-sm text-muted-foreground">Auto role assignment</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <SiRoblox className="w-10 h-10 mb-3" />
                  <p className="font-semibold">Roblox Linking</p>
                  <p className="text-sm text-muted-foreground">In-game perks</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Trusted by developers and members worldwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Members choose us for our commitment to open environments and exceptional development capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.quote}"</p>
                  <p className="font-semibold text-sm">{testimonial.company}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-chart-3/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
            Ready to build your gaming community?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of members who trust REACT Studios\u2122 to deliver exceptional 
            high-fidelity gaming experiences in our open, accessible environment.
          </p>
          <Button size="lg" className="glow-primary-hover px-8" asChild data-testid="button-cta-join">
            <a href="/api/login">
              Join Now - It's Free
              <ChevronRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">REACT Studios\u2122</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Building the future of digital experiences with innovative solutions and community-driven development.
            </p>
            
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiDiscord className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiRoblox className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border/50">
            <a href="/api/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-signin">Sign In</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-privacy">Privacy Policy</a>
            <a href="/guidelines" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-guidelines">Community Guidelines</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
