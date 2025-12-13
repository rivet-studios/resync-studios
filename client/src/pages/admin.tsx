import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { secondaryUserRankEnum } from "@shared/schema";

interface User {
  id: string;
  username: string;
  email: string;
  userRank: string;
  secondaryUserRank: string;
  createdAt: string;
}

const RANK_OPTIONS = [
  { value: "banned", label: "Banned" },
  { value: "member", label: "Member" },
  { value: "active_member", label: "Active Member" },
  { value: "trusted_member", label: "Trusted Member" },
  { value: "community_partner", label: "Community Partner" },
  { value: "bronze_vip", label: "Bronze VIP" },
  { value: "sapphire_vip", label: "Sapphire VIP" },
  { value: "diamond_vip", label: "Diamond VIP" },
  { value: "founders_edition_vip", label: "Founders Edition VIP" },
  { value: "founders_edition_lifetime", label: "Lifetime" },
  { value: "rs_trust_&_safety_team", label: "RS Trust & Safety Team" },
  { value: "rs_volunteer_staff", label: "RS Volunteer Staff" },
  { value: "appeals_moderator", label: "Appeals Moderator" },
  { value: "customer_relations", label: "Customer Relations" },
  { value: "community_moderator", label: "Community Moderator" },
  { value: "community_senior_moderator", label: "Community Senior Moderator" },
  { value: "community_administrator", label: "Community Administrator" },
  { value: "community_senior_administrator", label: "Senior Administrator" },
  { value: "community_developer", label: "Community Developer" },
  { value: "staff_internal_affairs", label: "Staff Internal Affairs" },
  { value: "team_member", label: "Team Member" },
  { value: "staff_department_director", label: "Staff Department Director" },
  { value: "leadership_council", label: "Leadership Council" },
  { value: "operations_manager", label: "Operations Manager" },
  { value: "company_director", label: "Company Director" },
];

export default function AdminPanel() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRanks, setSelectedRanks] = useState<Record<string, string>>(
    {},
  );

  const {
    data: users = [],
    isLoading,
    error: queryError,
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Show error toast if there's a query error
  useEffect(() => {
    if (queryError) {
      console.error("Query error:", queryError);
      toast({
        title: "Error",
        description: `Failed to load users: ${(queryError as any).message}`,
        variant: "destructive",
      });
    }
  }, [queryError, toast]);

  const assignRankMutation = useMutation({
    mutationFn: async ({
      userId,
      rank,
      secondaryrank,
    }: {
      userId: string;
      rank: string;
      secondaryrank?: string;
    }) => {
      console.log(`🔐 Assigning rank: user=${userId}, rank=${rank}`);
      const response = await fetch("/api/admin/assign-rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          rank,
          ...(secondaryrank && { secondaryrank }),
        }),
        credentials: "include",
      });

      const data = await response.json();
      console.log(`📊 Response:`, response.status, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(
    (user: User) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRankChange = (userId: string, newRank: string) => {
    setSelectedRanks((prev) => ({ ...prev, [userId]: newRank }));
  };

  const handleAssignRank = (userId: string) => {
    const newRank = selectedRanks[userId];
    if (newRank) {
      assignRankMutation.mutate({
        userId,
        rank: newRank,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Shield className="w-8 h-8" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Manage user ranks and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rank Assignment</CardTitle>
          <CardDescription>
            Search for users and assign them ranks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-users"
          />

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsers.map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`row-user-${user.id}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold">{user.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {RANK_OPTIONS.find((r) => r.value === user.userRank)
                          ?.label || user.userRank}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedRanks[user.id] || ""}
                      onValueChange={(value) =>
                        handleRankChange(user.id, value)
                      }
                    >
                      <SelectTrigger
                        className="w-48"
                        data-testid={`select-rank-${user.id}`}
                      >
                        <SelectValue placeholder="Select new rank" />
                      </SelectTrigger>
                      <SelectContent>
                        {RANK_OPTIONS.map((rank) => (
                          <SelectItem key={rank.value} value={rank.value}>
                            {rank.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => handleAssignRank(user.id)}
                      disabled={
                        !selectedRanks[user.id] || assignRankMutation.isPending
                      }
                      data-testid={`button-assign-${user.id}`}
                    >
                      {assignRankMutation.isPending ? "Assigning..." : "Assign"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-sm text-muted-foreground pt-4 border-t">
            Total users: {users.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
