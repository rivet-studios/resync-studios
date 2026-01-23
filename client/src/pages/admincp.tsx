import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { type Announcement } from "@shared/schema";

interface User {
  id: string;
  username: string;
  email: string;
  userRank: string;
  additionalRanks?: string[];
  vipTier: string;
}

interface Stats {
  totalMembers: number;
}

const VIP_OPTIONS = [
  { value: "none", label: "None" },
  { value: "Bronze VIP", label: "Bronze ($12.99)" },
  { value: "Diamond VIP", label: "Diamond ($19.99)" },
  { value: "Founders Edition VIP", label: "Founders ($45.99)" },
  { value: "Lifetime", label: "Lifetime ($64.99)" },
];

function AnnouncementForm({ initialData, onSubmit, isLoading }: any) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [type, setType] = useState(initialData?.type || "update");
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished !== false,
  );

  return (
    <div className="space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      />
      <Select value={type} onValueChange={setType}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="launch">Launch</SelectItem>
          <SelectItem value="roadmap">Roadmap</SelectItem>
          <SelectItem value="feature">Feature</SelectItem>
          <SelectItem value="update">Update</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="event">Event</SelectItem>
          <SelectItem value="announcement">Announcement</SelectItem>
          <SelectItem value="news">News</SelectItem>
          <SelectItem value="alert">Alert</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          id="publish"
        />
        <label htmlFor="publish" className="text-sm">
          Publish
        </label>
      </div>
      <Button
        onClick={() =>
          onSubmit({
            title,
            content,
            type,
            details: [],
            isPublished,
          })
        }
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

export default function AdminCP() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVip, setSelectedVip] = useState("none");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userToSetPassword, setUserToSetPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const adminRanks = [
    "Community Administrator",
    "Community Senior Administrator",
    "Community Developer",
    "Staff Internal Affairs",
    "Company Representative",
    "Team Member",
    "MI Trust & Safety Director",
    "Staff Department Director",
    "Operations Manager",
    "Company Director",
  ];
  
  const isAdmin =
    user?.email?.endsWith("@resyncstudios.com") ||
    adminRanks.includes(user?.userRank || "") ||
    (user?.additionalRanks || []).some((r) => adminRanks.includes(r));

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive" />
              <div>
                <h2 className="font-bold text-lg mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have admin access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: stats } = useQuery<Stats>({ queryKey: ["/api/stats"] });
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const { data: searchResults = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/search-users", subscriptionSearch],
    enabled: subscriptionSearch.length > 0,
  });

  const assignSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/assign-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUsername: selectedUser?.username,
          vipTier: selectedVip,
        }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to assign subscription");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Subscription assigned" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUser(null);
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to assign subscription",
        variant: "destructive",
      }),
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to create announcement");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Announcement created" });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error) => {
      const errorMsg =
        (error as Error).message || "Failed to create announcement";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/announcements/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/set-user-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userToSetPassword?.id,
          password: newPassword,
        }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password set successfully" });
      setUserToSetPassword(null);
      setNewPassword("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to set password",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl font-bold">
            Admin Control Panel
          </h1>
          <p className="text-muted-foreground">
            Manage platform, users, subscriptions, and content
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalMembers || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{announcements.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assign Subscription</CardTitle>
              <CardDescription>
                Manually assign VIP tiers to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Search User</label>
                <Input
                  placeholder="Username or email..."
                  value={subscriptionSearch}
                  onChange={(e) => setSubscriptionSearch(e.target.value)}
                />
              </div>

              {subscriptionSearch && searchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-xl p-2 bg-muted/30">
                  {searchResults.map((u: User) => (
                    <div
                      key={u.id}
                      className="p-3 border rounded-xl cursor-pointer hover:bg-background transition-colors"
                      onClick={() => setSelectedUser(u)}
                    >
                      <p className="font-medium">{u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm font-medium">
                    Selected: <span className="text-primary font-bold">{selectedUser.username}</span>
                  </p>
                  <Select value={selectedVip} onValueChange={setSelectedVip}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIP_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => assignSubscriptionMutation.mutate()}
                    disabled={assignSubscriptionMutation.isPending}
                    className="w-full"
                  >
                    {assignSubscriptionMutation.isPending
                      ? "Assigning..."
                      : "Assign Subscription"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Announcements</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <AnnouncementForm
                  onSubmit={(data: any) =>
                    createAnnouncementMutation.mutate(data)
                  }
                  isLoading={createAnnouncementMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-3">
            {announcements.map((a: any) => (
              <Card key={a.id} className="hover-elevate">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{a.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {a.content}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => deleteAnnouncementMutation.mutate(a.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Filter users by username or email..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid gap-3">
            {users
              .filter(
                (u) =>
                  u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                  u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()),
              )
              .slice(0, 50)
              .map((u) => (
                <Card key={u.id} className="hover-elevate">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{u.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.email}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{u.userRank}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{u.vipTier}</Badge>
                      </div>
                    </div>
                    <Dialog
                      open={userToSetPassword?.id === u.id}
                      onOpenChange={(open) => {
                        if (!open) setUserToSetPassword(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUserToSetPassword(u)}
                        >
                          Set Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Set Password for {u.username}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              New Password
                            </label>
                            <Input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minimum 6 characters"
                            />
                          </div>
                          <Button
                            onClick={() => setPasswordMutation.mutate()}
                            disabled={
                              setPasswordMutation.isPending ||
                              newPassword.length < 6
                            }
                            className="w-full"
                          >
                            {setPasswordMutation.isPending ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
