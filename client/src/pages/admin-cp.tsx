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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Users,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { type Announcement, type User } from "@shared/schema";

interface Stats {
  totalMembers: number;
}

const ADMIN_RANKS = [
  "community_administrator",
  "community_senior_administrator",
  "staff_department_director",
  "leadership_council",
  "operations_manager",
  "team_member",
  "staff_internal_affairs",
  "company_director",
];

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

const VIP_OPTIONS = [
  { value: "none", label: "None" },
  { value: "bronze", label: "Bronze ($10.99)" },
  { value: "sapphire", label: "Sapphire ($14.99)" },
  { value: "diamond", label: "Diamond ($19.99)" },
  { value: "founders", label: "Founders ($35.99)" },
];

function AnnouncementForm({ initialData, onSubmit, isLoading }: any) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [type, setType] = useState(initialData?.type || "update");
  const [details] = useState(
    initialData?.details ? JSON.parse(initialData.details) : [""],
  );
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
            details: details.filter((d: string) => d.trim()),
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
  const { user } = useAuth() as { user?: User };
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedVip, setSelectedVip] = useState("none");
  const [offlineMessage, setOfflineMessage] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [userToSetPassword, setUserToSetPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");

  const isAdmin = user?.userRank && ADMIN_RANKS.includes(user.userRank);

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

  const updateSiteSettingsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/admin/site-settings", {
        isOffline,
        offlineMessage,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Settings updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to update settings",
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
      console.error("Announcement creation error:", errorMsg);
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
          userId: userToSetPassword.id,
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
        <TabsList className="grid w-full grid-cols-7 overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="text-xs">
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs">
            Announcements
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs">
            Users
          </TabsTrigger>
          <TabsTrigger value="ranks" className="text-xs">
            Ranks
          </TabsTrigger>
          <TabsTrigger value="site" className="text-xs">
            Site
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs">
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalMembers || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Announcements</CardTitle>
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
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                  {searchResults.map((u: User) => (
                    <div
                      key={u.id}
                      className="p-2 border rounded cursor-pointer hover:bg-muted"
                      onClick={() => setSelectedUser(u)}
                    >
                      <p className="font-medium">{u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Selected: {selectedUser.username}
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
                    className="w-full mt-2"
                  >
                    {assignSubscriptionMutation.isPending
                      ? "Assigning..."
                      : "Assign"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Announcements</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New
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
          <div className="space-y-2">
            {announcements.map((a: any) => (
              <Card key={a.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{a.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {a.content}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
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
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {users
              .filter(
                (u) =>
                  (u.username
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ??
                    false) ||
                  (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                    false),
              )
              .map((u) => (
                <Card key={u.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{u.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {u.email}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{u.userRank}</Badge>
                          <Badge variant="outline">{u.vipTier}</Badge>
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
                          <div className="space-y-4">
                            <div>
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
                              {setPasswordMutation.isPending
                                ? "Setting..."
                                : "Set Password"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ranks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rank System</CardTitle>
              <CardDescription>Staff ranks and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {RANK_OPTIONS.map((rank) => (
                <div
                  key={rank.value}
                  className="flex justify-between p-2 border rounded"
                >
                  <span className="font-medium">{rank.label}</span>
                  <Badge variant="outline">
                    {users.filter((u) => u.userRank === rank.value).length}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isOffline}
                  onChange={(e) => setIsOffline(e.target.checked)}
                  id="offline"
                />
                <label htmlFor="offline" className="font-medium">
                  Take Site Offline
                </label>
              </div>
              {isOffline && (
                <Textarea
                  value={offlineMessage}
                  onChange={(e) => setOfflineMessage(e.target.value)}
                  placeholder="Enter offline message..."
                />
              )}
              <Button
                onClick={() => updateSiteSettingsMutation.mutate()}
                disabled={updateSiteSettingsMutation.isPending}
              >
                {updateSiteSettingsMutation.isPending
                  ? "Updating..."
                  : "Update"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-muted-foreground">PostgreSQL</p>
              </div>
              <div>
                <p className="text-sm font-medium">Platform</p>
                <p className="text-muted-foreground">RESYNC Studios v1.0</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
