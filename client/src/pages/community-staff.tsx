import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function CommunityStaff() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Community Staff</h1>
        <p className="text-muted-foreground">Meet the team behind RIVET Studios</p>
      </div>
      <Card>
        <CardContent className="py-16 text-center">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Staff directory coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
