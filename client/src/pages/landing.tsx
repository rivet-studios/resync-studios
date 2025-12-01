import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/animated-counter";
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Gamepad2, 
  Shield, 
  Globe,
  Star,
  ChevronRight,
} from "lucide-react";
import { SiDiscord, SiRoblox } from "react-icons/si";

const stats = [
  { value: 69600, label: "Connected Members", suffix: "+" },
  { value: 0, label: "Discord Members", suffix: "+" },
  { value: 295100, label: "Roblox Members", suffix: "+" },
  { value: 34900, label: "Active Discussions", suffix: "+" },
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
    description: "Advanced analytics providing deep insights into member engagement and community growth."
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
    description: "Worldwide server network delivering high-fidelity gaming experiences with low latency and high availability globally."
  },
];

const testimonials = [
  {
    quote: "The REACT Studios™ platform revolutionized our community management. The high-fidelity game development tools are exceptional and our players love the seamless experience.",
    author: "Alex Chen",
    company: "Lead Developer, Pixel Studios",
    avatar: "A"
  },
  {
    quote: "Their open gaming environment and advanced development capabilities helped us create high-fidelity experiences that grew our community from 1,000 to 50,000 players in 6 months.",
    author: "Sarah Johnson",
    company: "Community Manager, GameForge",
    avatar: "S"
  },
  {
    quote: "Outstanding open gaming platform with exceptional development support. The seamless integration enabled us to deliver high-fidelity games and increased community engagement by 300%.",
    author: "Mike Rodriguez",
    company: "Founder, Indie Game Collective",
    avatar: "M"
  },
];

const tiers = [
  {
    name: "Bronze VIP®",
    price: 13.99,
    features: [
      "[RS Discord Server] Exclusive Role, Less Chat Restrictions",
      "[RS Discord Server] Post Images / Videos / Files",
      "[RS HelpDesk] Priority Ticket Support",
      "[RS Moderation] Priority Appeals and Player Reports",
      "+ 8 more benefits"
    ]
  },
  {
    name: "Diamond VIP®",
    price: 34.99,
    features: [
      "[RS Discord Server] Exclusive Role, Less Chat Restrictions",
      "[RS Discord Server] Post Images / Videos / Files",
      "[RS HelpDesk] High Priority Ticket Support",
      "[RS Moderation] High Priority Appeals and Player Reports",
      "+ 13 more benefits"
    ]
  },
  {
    name: "Founder's Edition VIP®",
    price: 64.99,
    features: [
      "[RS Discord Server] Exclusive Role, Less Chat Restrictions",
      "[RS Discord Server] Post Images / Videos / Files",
      "[RS HelpDesk] Urgent Priority Ticket Support",
      "[RS Moderation] Urgent Priority Appeals and Player Reports",
      "+ 15 more benefits"
    ]
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">REACT Studios™</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <a href="/forums">Join The Community</a>
              </Button>
              <Button asChild size="sm">
                <a href="/vip">Browse Store</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            The number one online gaming community platform
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            REACT Studios™ creates an open gaming environment accessible to everyone, delivering high-fidelity games through our exceptional game development expertise and building online communities.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="px-8" asChild>
              <a href="/signup">
                Join The Community
                <ChevronRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/vip">Browse Store</a>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card/50 border-border/50">
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

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Everything you need for thriving communities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our gaming platform provides all the essential tools needed to build thriving communities and deliver exceptional high-fidelity gaming experiences through advanced development capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
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
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits you best. No long term contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <Card key={index} className="hover-elevate flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground text-sm ml-2">/ month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full">
                    <a href="/vip">Get started</a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-chart-3/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
            Ready to join the community?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of members who trust REACT Studios™ to deliver exceptional high-fidelity gaming experiences in our open, accessible environment.
          </p>
          <Button size="lg" className="px-8" asChild>
            <a href="/forums">
              Start Connecting
              <ChevronRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">REACT Studios™</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/guidelines" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community Guidelines</a>
            <a href="/dmca" className="text-sm text-muted-foreground hover:text-foreground transition-colors">DMCA Policy</a>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2025 REACT Studios™. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
