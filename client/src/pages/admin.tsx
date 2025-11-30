import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  userRank: string;
  createdAt: string;
}

const RANK_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "none", label: "None" },
  { value: "company_director", label: "Company Director" },
  { value: "leadership_council", label: "Leadership Council" },
  { value: "operations_manager", label: "Operations Manager" },
  { value: "rs_trust_safety_director", label: "Trust & Safety Director" },
  { value: "administrator", label: "Administrator" },
  { value: "senior_administrator", label: "Senior Administrator" },
  { value: "moderator", label: "Moderator" },
  { value: "community_moderator", label: "Community Moderator" },
  { value: "community_senior_moderator", label: "Senior Community Moderator" },
  { value: "community_developer", label: "Community Developer" },
  { value: "customer_relations", label: "Customer Relations" },
  { value: "rs_volunteer_staff", label: "Volunteer Staff" },
];

export default function AdminPanel() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRanks, setSelectedRanks] = useState<Record<string, string>>({});

  const { data: users = [], isLoading, error: queryError } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/users");
      console.log("Admin users response:", response);
      return response;
    },
    retry: false,
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
    mutationFn: async ({ userId, rank }: { userId: string; rank: string }) => {
      return apiRequest("/api/admin/assign-rank", {
        method: "POST",
        body: JSON.stringify({ userId, rank }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Rank assigned: ${data.message}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign rank",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user: User) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRankChange = (userId: string, newRank: string) => {
    setSelectedRanks((prev) => ({ ...prev, [userId]: newRank }));
  };

  const handleAssignRank = (userId: string) => {
    const newRank = selectedRanks[userId];
    if (newRank) {
      assignRankMutation.mutate({ userId, rank: newRank });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Shield className="w-8 h-8" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">Manage user ranks and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rank Assignment</CardTitle>
          <CardDescription>Search for users and assign them ranks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-users"
          />

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
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
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {RANK_OPTIONS.find((r) => r.value === user.userRank)?.label || user.userRank}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedRanks[user.id] || ""}
                      onValueChange={(value) => handleRankChange(user.id, value)}
                    >
                      <SelectTrigger className="w-48" data-testid={`select-rank-${user.id}`}>
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
                      disabled={!selectedRanks[user.id] || assignRankMutation.isPending}
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
