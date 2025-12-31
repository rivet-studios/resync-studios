import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle,
  MessageSquare,
  AlertCircle,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";

const FAQ_ITEMS = [
  {
    category: "Account",
    question: "How do I reset my password?",
    answer:
      "Visit the login page and click 'Forgot Password'. Enter your email and follow the instructions sent to your inbox.",
  },
  {
    category: "Account",
    question: "How do I link my Discord account?",
    answer:
      "Go to Settings > Connections and click 'Link Discord'. You'll be guided through the Discord authorization process.",
  },
  {
    category: "Account",
    question: "How do I link my Roblox account?",
    answer:
      "Go to Settings > Connections and click 'Link Roblox'. Enter your Roblox username to verify ownership. Contact our support team if you cannot complete the roblox integration process.",
  },
  {
    category: "Billing & Subscriptions",
    question: "What are the VIP tiers?",
    answer:
      "We offer Bronze ($10.99), Diamond ($19.99), Founders Edition ($35.99), and Founders Edition Lifetime (64.99) tiers with varying benefits.",
  },
  {
    category: "Billing & Subscriptions",
    question: "When does my VIP subscription renew?",
    answer:
      "VIP subscriptions renew monthly on the same date you purchased. You'll receive an email notification before renewal.",
  },
  {
    category: "Billing & Subscriptions",
    question: "Can I upgrade or downgrade my VIP tier?",
    answer:
      "Yes! You can change your VIP tier at any time from the VIP page. Price adjustments are prorated.",
  },
  {
    category: "Projects",
    question:
      "Why is the Highville Project discontinued if it is still in use?",
    answer:
      "The Highville Project is labled as discontinued because it is no longer supported under the company. The former COO has offered to take over as the Project Manager. In short, the project is mentally labled discontinued because RS is no longer supporting it.",
  },
  {
    category: "Projects",
    question: "What is Project Foxtrot?",
    answer:
      "Project Foxtrot is one of our flagship ROBLOX projects featuring immersive roleplay experiences and community gameplay. The game is currently under active development.",
  },
  {
    category: "Reports",
    question: "How do I report a player or content?",
    answer:
      "In order to report a player or content, you must submit a report via the corresponding forum using the provided format.",
  },
  {
    category: "Appeals",
    question: "How do I appeal an in-game ban or moderation action?",
    answer:
      "In order to appeal a ban or moderation action, you must submit an appeal via the corresponding appeals forum with your case details.",
  },
  {
    category: "Appeals",
    question: "How do I appeal a website ban?",
    answer:
      "Website bans are permanent and cannot be appealed. If you believe this is an error, please contact support.",
  },
  {
    category: "Error Codes",
    question: "What are the error codes and what do they mean?",
    answer: "400        Bad Request",
    answer1: "401       Unauthorized",
    answer2: "402       Payment Required",
    answer3: "403       Forbidden",
    answer4: "404       NotFound",
    answer5: "405       Method Not Allowed",
    answer6: "406       Not Acceptable",
    answer7: "407       Proxy Authentication Required",
    answer8: "408       Request Timeout",
    answer9: "409       Conflict",
    answer10: "410      Gone",
    answer11: "411      Length Required",
    answer12: "412      Precondition Failed",
    answer13: "413      Payload Too Large",
    answer14: "414      URI Too Long",
    answer15: "415      Unsupported Media Type",
    answer16: "416      Range Not Satisfiable",
    answer17: "417      Expectation Failed",
    answer18: "418      ImATeapot",
    answer19: "421      Misdirected Request",
    answer20: "422      Unprocessable Entity",
    answer21: "423      Locked",
    answer22: "424      Failed Dependency",
    answer23: "425      Too Early",
    answer24: "426      Upgrade Required",
    answer25: "428      Precondition Required",
    answer26: "429      Too Many Requests",
    answer27: "431      Request Header Fields TooLarge",
    answer28: "451      Unavailable For Legal Reasons",
    answer29: "500      Internal Server Error",
    answer30: "501      Not Implemented",
    answer31: "502      Bad Gateway",
    answer32: "503      Service Unavailable",
    answer33: "504      Gateway Timeout",
    answer34: "505      HTTP Version Not Supported",
    answer35: "506      Variant Also Negotiates",
    answer36: "507      Insufficient Storage",
    answer37: "508      Loop Detected",
    answer38: "509      Bandwidth Limit Exceeded",
    answer39: "510      Not Extended",
    answer40: "511      Network Authentication Required",
  },
  {
    category: "DMCA",
    question:
      "I've received a DMCA takedown notice on my assets! What do I do?",
    answer:
      "DMCA notices are issued by the DMCA Team which is compiled of select support team specialists. DMCA takedowns are issued when our team finds assets owned by us and/or our partners that have been published anywhere without explicit permission. If you believe that assets you own have been flagged for takedown, please contact Roblox Supprt with details and proof of ownership as our support team cannot access Roblox' backend servers.",
  },
  {
    category: "Partnership",
    question: "How do I apply for a partnership?",
    answer:
      "Visit the Partnerships page and fill out the application form. Our team will review your application and contact you if selected.",
  },
];

// Support page migrated to Freshdesk redirect
export default function Support() {

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <HelpCircle className="w-3.5 h-3.5" />
          Help Center
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          RS Support
        </h1>
        <p className="text-lg text-muted-foreground">
          Get help with your account, billing issues, community issues,
          partnership requests, DMCA issues, and more.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Quick Response</h3>
            <p className="text-sm text-muted-foreground">
              24-hour support response time
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Expert Team</h3>
            <p className="text-sm text-muted-foreground">
              Dedicated support specialists
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">VIP Priority</h3>
            <p className="text-sm text-muted-foreground">
              Priority support for VIP members
            </p>
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

      {/* Contact Form Placeholder Redirect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contact Support
          </CardTitle>
          <CardDescription>
            Need further assistance? Our dedicated support team is ready to help you on Freshdesk.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12 text-center space-y-6">
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-2">Visit our Support Portal</h3>
            <p className="text-muted-foreground mb-6">
              We've moved our support ticketing system to Freshdesk to provide you with a more efficient and streamlined experience.
            </p>
            <Button size="lg" className="w-full sm:w-auto px-8" asChild>
              <a href="https://support.resyncstudios.com" target="_blank" rel="noopener noreferrer">
                Go to Support Portal
              </a>
            </Button>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 max-w-2xl text-left flex gap-4">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-3">
              <p className="text-sm text-blue-800 font-medium">
                Support Guidelines & Expectations
              </p>
              <div className="text-xs text-blue-700 space-y-2 leading-relaxed">
                <p>
                  Our standard response time is 24 hours. During high-volume periods or holidays, response times may be longer. If you haven't heard back within 72 hours, please update your ticket with an escalation request.
                </p>
                <p>
                  <strong>Security Note:</strong> RS Support will <strong>NEVER</strong> ask for sensitive information like passwords or credit card numbers. If you receive such a request, report it immediately through our Trust & Safety portal on Freshdesk.
                </p>
                <p>
                  VIP members enjoy priority support with target response times under 2 hours.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
