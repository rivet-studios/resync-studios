import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Shield, Users, BarChart3, AlertTriangle, Trash2, UserCheck, Edit2, Plus } from "lucide-react";
import { type Announcement } from "@shared/schema";

interface User {
  id: string;
  username: string;
  email: string;
  userRank: string;
  vipTier: string;
  createdAt: string;
}

interface Stats {
  totalMembers: number;
  activeLfg: number;
  totalClans: number;
  totalBuilds: number;
}

const RANK_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "moderator", label: "Moderator" },
  { value: "community_moderator", label: "Community Moderator" },
  { value: "community_senior_moderator", label: "Senior Community Moderator" },
  { value: "administrator", label: "Administrator" },
  { value: "senior_administrator", label: "Senior Administrator" },
  { value: "rs_trust_safety_director", label: "Trust & Safety Director" },
  { value: "leadership_council", label: "Leadership Council" },
  { value: "company_director", label: "Company Director" },
];

function AnnouncementForm({ initialData, onSubmit, isLoading }: { initialData?: any; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [type, setType] = useState(initialData?.type || "update");
  const [details, setDetails] = useState(initialData?.details ? JSON.parse(initialData.details) : [""]);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished !== false);

  const handleAddDetail = () => setDetails([...details, ""]);
  const handleRemoveDetail = (idx: number) => setDetails(details.filter((_: string, i: number) => i !== idx));
  const handleDetailChange = (idx: number, value: string) => {
    const newDetails = [...details];
    newDetails[idx] = value;
    setDetails(newDetails);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" data-testid="input-announcement-title" />
      </div>
      <div>
        <label className="text-sm font-medium">Content</label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Main announcement text" data-testid="input-announcement-content" />
      </div>
      <div>
        <label className="text-sm font-medium">Type</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger data-testid="select-announcement-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="launch">Launch</SelectItem>
            <SelectItem value="roadmap">Roadmap</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="update">Update</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Key Features</label>
          <Button size="sm" variant="ghost" onClick={handleAddDetail} data-testid="button-add-detail">
            Add Detail
          </Button>
        </div>
        <div className="space-y-2">
          {details.map((detail: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={detail}
                onChange={(e) => handleDetailChange(idx, e.target.value)}
                placeholder={`Detail ${idx + 1}`}
                data-testid={`input-detail-${idx}`}
              />
              <Button size="sm" variant="ghost" onClick={() => handleRemoveDetail(idx)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          id="publish"
          data-testid="checkbox-publish"
        />
        <label htmlFor="publish" className="text-sm font-medium">Publish Immediately</label>
      </div>
      <Button
        onClick={() => onSubmit({ title, content, type, details: details.filter((d: string) => d.trim()), isPublished })}
        disabled={isLoading || !title || !content}
        className="w-full"
        data-testid="button-save-announcement"
      >
        {isLoading ? "Saving..." : "Save Announcement"}
      </Button>
    </div>
  );
}

export default function AdminCP() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRanks, setSelectedRanks] = useState<Record<string, string>>({});

  // Check if user is admin
  const isAdmin = user?.userRank && [
    'administrator',
    'senior_administrator',
    'rs_trust_safety_director',
    'leadership_council',
    'company_director'
  ].includes(user.userRank);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive" />
              <div>
                <h2 className="font-bold text-lg mb-2">Access Denied</h2>
                <p className="text-muted-foreground">You don't have permission to access the Admin Control Panel.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const assignRankMutation = useMutation({
    mutationFn: async ({ userId, rank }: { userId: string; rank: string }) => {
      const response = await fetch("/api/admin/assign-rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rank }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to assign rank");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User rank updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user rank", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create announcement");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Announcement created" });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create announcement", variant: "destructive" });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update announcement");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Announcement updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update announcement", variant: "destructive" });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/announcements/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Announcement deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
    },
  });

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Control Panel</h1>
          <p className="text-muted-foreground">Manage users, system settings, and platform administration</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active LFG</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeLfg || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active matchmaking posts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalClans || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Community clans</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Builds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBuilds || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Shared builds</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="outline" className="bg-green-500/10">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Discord Bot</span>
                <Badge variant="outline" className="bg-green-500/10">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Server</span>
                <Badge variant="outline" className="bg-green-500/10">Operational</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Announcements</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="button-create-announcement">
                  <Plus className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <AnnouncementForm 
                  onSubmit={(data) => createAnnouncementMutation.mutate(data)}
                  isLoading={createAnnouncementMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {announcements.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No announcements. Create one to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="hover-elevate">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{announcement.content}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{announcement.type}</Badge>
                          {announcement.isPublished && <Badge variant="outline">Published</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Announcement</DialogTitle>
                            </DialogHeader>
                            <AnnouncementForm 
                              initialData={announcement}
                              onSubmit={(data) => updateAnnouncementMutation.mutate({ id: announcement.id, data })}
                              isLoading={updateAnnouncementMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-2">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                                className="bg-destructive"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-users"
            />
          </div>

          {usersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No users found
                  </CardContent>
                </Card>
              ) : (
                filteredUsers.map((u) => (
                  <Card key={u.id} className="hover-elevate">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold">{u.username}</h3>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <div className="flex gap-2 mt-2">
                            {u.userRank && u.userRank !== 'member' && (
                              <Badge variant="outline">{u.userRank}</Badge>
                            )}
                            {u.vipTier && u.vipTier !== 'none' && (
                              <Badge variant="outline">{u.vipTier}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Rank</DialogTitle>
                                <DialogDescription>
                                  Select a new rank for {u.username}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Select
                                  value={selectedRanks[u.id] || u.userRank}
                                  onValueChange={(value) => setSelectedRanks({ ...selectedRanks, [u.id]: value })}
                                >
                                  <SelectTrigger data-testid={`select-rank-${u.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {RANK_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  onClick={() => {
                                    assignRankMutation.mutate({
                                      userId: u.id,
                                      rank: selectedRanks[u.id] || u.userRank,
                                    });
                                  }}
                                  disabled={assignRankMutation.isPending}
                                  className="w-full"
                                >
                                  {assignRankMutation.isPending ? "Updating..." : "Update Rank"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {u.username}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex gap-2">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUserMutation.mutate(u.id)}
                                  className="bg-destructive"
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>Platform hierarchy and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {RANK_OPTIONS.map((role) => (
                <div key={role.value} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.value}</p>
                  </div>
                  <Badge variant="outline">{users.filter(u => u.userRank === role.value).length} users</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Platform Version</p>
                <p className="text-muted-foreground">1.0.0</p>
              </div>
              <div>
                <p className="text-sm font-medium">Database Type</p>
                <p className="text-muted-foreground">PostgreSQL (Neon)</p>
              </div>
              <div>
                <p className="text-sm font-medium">API Framework</p>
                <p className="text-muted-foreground">Express.js</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dangerous Actions</CardTitle>
              <CardDescription>Proceed with caution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="destructive" disabled className="w-full">
                Clear All Cache
              </Button>
              <Button variant="destructive" disabled className="w-full">
                Reset Database (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
