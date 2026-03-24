import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, CheckCircle, Gift, Link as LinkIcon, Loader2 } from "lucide-react";

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading } = useQuery<{ code: string; referralCount: number }>({
    queryKey: ["/api/referral/code"],
    enabled: !!user,
  });

  const copyLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralData?.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-3xl p-6 text-center py-20">
        <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Sign in to get your referral link</h2>
        <p className="text-muted-foreground">Earn reputation points by inviting friends.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-referrals-title">Referral Program</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invite friends and earn reputation points for every successful signup
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LinkIcon className="w-5 h-5" />
              Your Referral Link
            </CardTitle>
            <CardDescription>Share this link with friends to earn 10 reputation points per signup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : referralData ? (
              <>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/signup?ref=${referralData.code}`}
                    className="font-mono text-sm"
                    data-testid="input-referral-link"
                  />
                  <Button onClick={copyLink} data-testid="button-copy-referral">
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Referral code: <code className="bg-muted px-1 rounded">{referralData.code}</code>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card data-testid="card-referral-count">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{referralData?.referralCount || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Friends Referred</p>
            </CardContent>
          </Card>
          <Card data-testid="card-referral-earnings">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-3xl font-bold">{(referralData?.referralCount || 0) * 10}</p>
              <p className="text-sm text-muted-foreground mt-1">Points Earned</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <Badge variant="secondary" className="rounded-full w-8 h-8 flex items-center justify-center shrink-0">1</Badge>
                <div>
                  <p className="font-medium text-sm">Share your link</p>
                  <p className="text-xs text-muted-foreground">Copy your referral link and share it with friends</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Badge variant="secondary" className="rounded-full w-8 h-8 flex items-center justify-center shrink-0">2</Badge>
                <div>
                  <p className="font-medium text-sm">They sign up</p>
                  <p className="text-xs text-muted-foreground">When they create an account using your link, they're linked to you</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Badge variant="secondary" className="rounded-full w-8 h-8 flex items-center justify-center shrink-0">3</Badge>
                <div>
                  <p className="font-medium text-sm">Earn rewards</p>
                  <p className="text-xs text-muted-foreground">You earn 10 reputation points for each successful referral</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
