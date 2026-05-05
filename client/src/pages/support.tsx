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

// Support page migrated to Freshdesk redirect
export default function Support() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
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

      {/* Contact Form Placeholder Redirect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contact Support
          </CardTitle>
          <CardDescription>
            Need further assistance? Our dedicated support team is ready to help
            you on Freshdesk.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12 text-center space-y-6">
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-2">Visit our Support Portal</h3>
            <p className="text-muted-foreground mb-6">
              We've moved our support ticketing system to Intercom to provide
              you with a more efficient and streamlined experience.
            </p>
            <Button size="lg" className="w-full sm:w-auto px-8" asChild>
              <a
                href="https://support.rivetstudiosus.com"
                target="_blank"
                rel="noopener noreferrer"
              >
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
                  <strong>Security Note:</strong> RS Support will{" "}
                  <strong>NEVER</strong> ask for sensitive information like
                  passwords or credit card numbers. If you receive such a
                  request, report it immediately to the Staff Director at
                  chase@rivetstudiosus.com{" "}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
