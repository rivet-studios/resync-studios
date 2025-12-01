import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, MessageSquare, AlertCircle, Users, Clock, CheckCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    category: "Account",
    question: "How do I reset my password?",
    answer: "Visit the login page and click 'Forgot Password'. Enter your email and follow the instructions sent to your inbox.",
  },
  {
    category: "Account",
    question: "How do I link my Discord account?",
    answer: "Go to Settings > Connections and click 'Link Discord'. You'll be guided through the Discord authorization process.",
  },
  {
    category: "Account",
    question: "How do I link my Roblox account?",
    answer: "Go to Settings > Connections and click 'Link Roblox'. Enter your Roblox username to verify ownership.",
  },
  {
    category: "VIP",
    question: "What are the VIP tiers?",
    answer: "We offer Bronze ($12.99), Sapphire ($29.99), Diamond ($44.99), and Founders Edition ($120) tiers with varying benefits.",
  },
  {
    category: "VIP",
    question: "When does my VIP subscription renew?",
    answer: "VIP subscriptions renew monthly on the same date you purchased. You'll receive an email notification before renewal.",
  },
  {
    category: "VIP",
    question: "Can I upgrade or downgrade my VIP tier?",
    answer: "Yes! You can change your VIP tier at any time from the VIP page. Price adjustments are prorated.",
  },
  {
    category: "Projects",
    question: "How do I join a RESYNC Studios project?",
    answer: "Visit the Projects page to see all available projects. Follow the specific join instructions for each project.",
  },
  {
    category: "Projects",
    question: "What is Project Foxtrot?",
    answer: "Project Foxtrot is one of our flagship ROBLOX projects featuring immersive roleplay experiences and community gameplay.",
  },
  {
    category: "Community",
    question: "How do I report a player or content?",
    answer: "Use the Report button on the player's profile or the specific content. Our Trust & Safety team will review reports within 24 hours.",
  },
  {
    category: "Community",
    question: "How do I appeal a ban or moderation action?",
    answer: "VIP members get priority moderation appeals. Submit an appeal ticket through the Support page with your case details.",
  },
];

export default function Support() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("Account");
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [...new Set(FAQ_ITEMS.map((item) => item.category))];
  const filtered = FAQ_ITEMS.filter((item) => item.category === activeCategory);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to submit");
      toast({
        title: "Message Sent",
        description: "Our support team will respond within 24 hours.",
      });
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <HelpCircle className="w-3.5 h-3.5" />
          Help Center
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">RESYNC Support</h1>
        <p className="text-lg text-muted-foreground">
          Get help with your account, subscriptions, and community issues
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Quick Response</h3>
            <p className="text-sm text-muted-foreground">24-hour support response time</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Expert Team</h3>
            <p className="text-sm text-muted-foreground">Dedicated support specialists</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">VIP Priority</h3>
            <p className="text-sm text-muted-foreground">Priority support for VIP members</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contact Support
          </CardTitle>
          <CardDescription>Can't find what you're looking for? Send us a message</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="What is this about?"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Describe your issue or question..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                className="min-h-32"
              />
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600">
                VIP members receive priority support with responses within 2 hours.
              </p>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
