import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown, Clock, X, Plus } from "lucide-react";

interface AdminSubscription {
  id: string;
  username: string;
  email: string | null;
  vipTier: string;
  stripeSubscriptionId: string | null;
  vipTrialEndsAt: string | null;
  isTrial: boolean;
}

const VIP_TIERS = ["Bronze VIP", "Diamond VIP", "Founders Edition VIP", "Lifetime"];

export function SubscriptionsTab() {
  const { toast } = useToast();
  const [grantUsername, setGrantUsername] = useState("");
  const [grantTier, setGrantTier] = useState("Bronze VIP");
  const [grantDays, setGrantDays] = useState("7");
  const [extendMap, setExtendMap] = useState<Record<string, string>>({});

  const { data: subscriptions = [], isLoading } = useQuery<AdminSubscription[]>({
    queryKey: ["/api/admin/subscriptions"],
  });

  const grantTrialMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/subscriptions/grant-trial", {
        targetUsername: grantUsername,
        vipTier: grantTier,
        trialDays: Number(grantDays),
      });
    },
    onSuccess: () => {
      toast({ title: "Trial granted", description: `${grantUsername} now has ${grantTier}` });
      setGrantUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to grant trial", description: err.message, variant: "destructive" });
    },
  });

  const extendMutation = useMutation({
    mutationFn: async ({ username, extraDays }: { username: string; extraDays: number }) => {
      await apiRequest("POST", "/api/admin/subscriptions/extend-trial", {
        targetUsername: username,
        extraDays,
      });
    },
    onSuccess: () => {
      toast({ title: "Trial extended" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to extend trial", description: err.message, variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (username: string) => {
      await apiRequest("POST", "/api/admin/subscriptions/cancel", {
        targetUsername: username,
      });
    },
    onSuccess: () => {
      toast({ title: "Subscription cancelled" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to cancel", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" data-testid="text-subscriptions-title">
          Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage VIP tiers, grant free trials, and cancel subscriptions
        </p>
      </div>

      <Card data-testid="card-grant-trial">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" /> Grant a Free Trial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              placeholder="Username"
              value={grantUsername}
              onChange={(e) => setGrantUsername(e.target.value)}
              data-testid="input-grant-trial-username"
            />
            <Select value={grantTier} onValueChange={setGrantTier}>
              <SelectTrigger data-testid="select-grant-trial-tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIP_TIERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              placeholder="Trial days"
              value={grantDays}
              onChange={(e) => setGrantDays(e.target.value)}
              data-testid="input-grant-trial-days"
            />
            <Button
              onClick={() => grantTrialMutation.mutate()}
              disabled={!grantUsername || grantTrialMutation.isPending}
              data-testid="button-grant-trial"
            >
              {grantTrialMutation.isPending ? "Granting..." : "Grant Trial"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Trials automatically revert to no VIP tier once they expire, unless the user has a real Stripe subscription.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No active VIP subscribers right now
            </p>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-md border border-border"
                  data-testid={`row-subscription-${sub.id}`}
                >
                  <div className="min-w-[160px]">
                    <p className="font-medium text-sm text-foreground" data-testid={`text-subscription-username-${sub.id}`}>
                      {sub.username}
                    </p>
                    <p className="text-xs text-muted-foreground">{sub.email}</p>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="w-3 h-3" /> {sub.vipTier}
                  </Badge>
                  {sub.isTrial ? (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Trial ends {sub.vipTrialEndsAt ? new Date(sub.vipTrialEndsAt).toLocaleDateString() : "-"}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {sub.stripeSubscriptionId ? "Stripe subscription" : "Manually assigned"}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    {sub.isTrial && (
                      <>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Days"
                          className="w-20 h-8"
                          value={extendMap[sub.id] ?? ""}
                          onChange={(e) =>
                            setExtendMap((prev) => ({ ...prev, [sub.id]: e.target.value }))
                          }
                          data-testid={`input-extend-trial-${sub.id}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            extendMutation.mutate({
                              username: sub.username,
                              extraDays: Number(extendMap[sub.id] || 7),
                            })
                          }
                          data-testid={`button-extend-trial-${sub.id}`}
                        >
                          Extend
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => cancelMutation.mutate(sub.username)}
                      data-testid={`button-cancel-subscription-${sub.id}`}
                    >
                      <X className="w-3 h-3 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
