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
import { Shield, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Unauthorized from "@/pages/unauthorized";

interface User {
  id: string;
  username: string;
  email: string;
  userRank: string;
  additionalRanks?: string[];
  createdAt: string;
}

const RANK_OPTIONS = [
  { value: "Moderator", label: "Moderator" },
  { value: "Administrator", label: "Administrator" },
  { value: "Senior Administrator", label: "Senior Administrator" },
  { value: "Banned", label: "Banned" },
  { value: "Member", label: "Member" },
  { value: "Active Member", label: "Active Member" },
  { value: "Trusted Member", label: "Trusted Member" },
  { value: "Community Partner", label: "Community Partner" },
  { value: "Bronze VIP", label: "Bronze VIP" },
  { value: "Diamond VIP", label: "Diamond VIP" },
  { value: "Founders Edition VIP", label: "Founders Edition VIP" },
  { value: "Lifetime", label: "Lifetime" },
  { value: "RS Volunteer Staff", label: "RS Volunteer Staff" },
  { value: "RS Trust & Safety Team", label: "RS Trust & Safety Team" },
  { value: "Customer Relations", label: "Customer Relations" },
  { value: "Appeals Moderator", label: "Appeals Moderator" },
  { value: "Community Moderator", label: "Community Moderator" },
  { value: "Community Senior Moderator", label: "Community Senior Moderator" },
  { value: "Community Administrator", label: "Community Administrator" },
  {
    value: "Community Senior Sdministrator",
    label: "Community Senior Administrator",
  },
  { value: "Community Developer", label: "Community Developer" },
  { value: "Staff Internal Affairs", label: "Staff Internal Affairs" },
  { value: "Company Representative", label: "Company Representative" },
  { value: "Team Member", label: "Team Member" },
  { value: "MI Trust & Safety Director", label: "MI Trust & Safety Director" },
  { value: "Staff Department Director", label: "Staff Department Director" },
  { value: "Operations Manager", label: "Operations Manager" },
  { value: "Company Director", label: "Company Director" },
];

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const staffRanks = [
    "Company Representative",
    "Team Member",
    "MI Trust & Safety Director",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];
  const hasAccess =
    currentUser?.email?.endsWith("@resyncstudios.com") ||
    staffRanks.includes(currentUser?.userRank || "") ||
    (currentUser?.additionalRanks || []).some((r: string) =>
      staffRanks.includes(r),
    );

  if (!hasAccess) {
    return <Unauthorized />;
  }
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
    mutationFn: async ({ userId, rank }: { userId: string; rank: string }) => {
      console.log(`🔐 Assigning rank: user=${userId}, rank=${rank}`);
      const response = await fetch("/api/admin/assign-rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rank }),
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
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="outline">
                        {RANK_OPTIONS.find((r) => r.value === user.userRank)
                          ?.label || user.userRank}
                      </Badge>
                      {(user.additionalRanks || []).map((rank) => (
                        <Badge key={rank} variant="secondary">
                          {RANK_OPTIONS.find((r) => r.value === rank)?.label ||
                            rank}
                        </Badge>
                      ))}
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
