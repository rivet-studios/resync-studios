import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  ShoppingCart,
  Shield,
  AlertTriangle,
  Info,
  ExternalLink,
  Inbox,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { Link } from "wouter";
import type { Notification } from "@shared/schema";

const typeIcons: Record<string, any> = {
  message: MessageSquare,
  order: ShoppingCart,
  moderation: Shield,
  warning: AlertTriangle,
  system: Info,
  forum: MessageSquare,
};

const typeStyles: Record<
  string,
  {
    icon: string;
    background: string;
    border: string;
  }
> = {
  message: {
    icon: "text-blue-400",
    background: "bg-blue-500/10",
    border: "border-blue-500/10",
  },
  order: {
    icon: "text-emerald-400",
    background: "bg-emerald-500/10",
    border: "border-emerald-500/10",
  },
  moderation: {
    icon: "text-purple-400",
    background: "bg-purple-500/10",
    border: "border-purple-500/10",
  },
  warning: {
    icon: "text-yellow-400",
    background: "bg-yellow-500/10",
    border: "border-yellow-500/10",
  },
  system: {
    icon: "text-white/50",
    background: "bg-white/[0.05]",
    border: "border-white/5",
  },
  forum: {
    icon: "text-blue-400",
    background: "bg-blue-500/10",
    border: "border-blue-500/10",
  },
};

function formatTimeAgo(dateStr: string | Date | null): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

function formatFullDate(dateStr: string | Date | null): string {
  if (!dateStr) return "";

  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread-count"],
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread-count"],
      });

      toast({
        title: "All notifications marked as read",
      });
    },
    onError: () =>
      toast({
        title: "Failed to mark all as read",
        variant: "destructive",
      }),
  });

  const unreadCount = items.filter((notification) => !notification.isRead).length;

  const readCount = items.length - unreadCount;

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-5">
            <Bell className="w-7 h-7 text-white/20" />
          </div>

          <h1 className="text-lg font-semibold text-white mb-2">
            Sign in required
          </h1>

          <p className="text-sm text-white/40 leading-relaxed mb-6">
            Please sign in to view notifications associated with your account.
          </p>

          <Button
            asChild
            className="bg-white text-black hover:bg-white/90 rounded-xl px-6"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-xl" />

            <div className="space-y-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl hidden sm:block" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 shrink-0 rounded-xl text-white/40 hover:text-white hover:bg-white/5"
              asChild
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/5 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-white/50" />
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  Account
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl font-semibold tracking-tight text-white"
                data-testid="text-notifications-title"
              >
                Notifications
              </h1>

              <p className="text-sm text-white/40 mt-2">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount !== 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="shrink-0 rounded-xl border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:text-white"
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Read all</span>
            </Button>
          )}
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <Card className="bg-card/60 border-white/5 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-400" />
                </div>

                <span className="text-[10px] uppercase tracking-wider text-white/25">
                  Total
                </span>
              </div>

              <p className="text-2xl font-semibold text-white">
                {items.length}
              </p>

              <p className="text-xs text-white/35 mt-1">
                Notification{items.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card
            className={`bg-card/60 rounded-2xl ${
              unreadCount > 0
                ? "border-blue-500/10"
                : "border-white/5"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-400" />
                </div>

                <span className="text-[10px] uppercase tracking-wider text-white/25">
                  Unread
                </span>
              </div>

              <p className="text-2xl font-semibold text-white">
                {unreadCount}
              </p>

              <p className="text-xs text-white/35 mt-1">
                Awaiting attention
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-white/5 rounded-2xl hidden sm:block">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCheck className="w-4 h-4 text-green-400" />
                </div>

                <span className="text-[10px] uppercase tracking-wider text-white/25">
                  Read
                </span>
              </div>

              <p className="text-2xl font-semibold text-white">
                {readCount}
              </p>

              <p className="text-xs text-white/35 mt-1">
                Already reviewed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Recent Activity
              </h2>

              <p className="text-xs text-white/30 mt-1">
                Updates and activity related to your account.
              </p>
            </div>

            {items.length > 0 && (
              <Badge className="bg-white/[0.04] border border-white/5 text-white/40 rounded-lg px-2.5 py-1">
                {items.length}
              </Badge>
            )}
          </div>

          {items.length === 0 ? (
            <Card className="bg-card/50 border-white/5 rounded-2xl">
              <CardContent className="py-16 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-5">
                  <Inbox className="w-6 h-6 text-white/15" />
                </div>

                <h3 className="text-sm font-medium text-white/60">
                  No notifications yet
                </h3>

                <p className="text-xs text-white/30 mt-1 max-w-xs mx-auto leading-relaxed">
                  When there's activity or an update for your account, it'll
                  appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {items.map((notif) => {
                const Icon = typeIcons[notif.type] || Info;

                const style =
                  typeStyles[notif.type] || typeStyles.system;

                return (
                  <Card
                    key={notif.id}
                    className={`group rounded-2xl overflow-hidden transition-all ${
                      !notif.isRead
                        ? "bg-white/[0.035] border-white/10"
                        : "bg-card/60 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 rounded-xl ${
                              !notif.isRead
                                ? style.background
                                : "bg-white/[0.03]"
                            } border ${
                              !notif.isRead
                                ? style.border
                                : "border-white/5"
                            } flex items-center justify-center shrink-0`}
                          >
                            <Icon
                              className={`w-4 h-4 ${
                                !notif.isRead
                                  ? style.icon
                                  : "text-white/20"
                              }`}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium leading-snug ${
                                    !notif.isRead
                                      ? "text-white"
                                      : "text-white/55"
                                  }`}
                                  data-testid={`text-notification-title-${notif.id}`}
                                >
                                  {notif.title}
                                </p>
                              </div>

                              {!notif.isRead && (
                                <Badge className="shrink-0 bg-white text-black hover:bg-white text-[10px] h-5 px-2 rounded-md">
                                  New
                                </Badge>
                              )}
                            </div>

                            {notif.message && (
                              <p
                                className={`text-sm mt-1.5 leading-relaxed line-clamp-2 ${
                                  !notif.isRead
                                    ? "text-white/45"
                                    : "text-white/30"
                                }`}
                              >
                                {notif.message}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3">
                              <span
                                className={`text-[11px] ${
                                  !notif.isRead
                                    ? "text-white/35"
                                    : "text-white/20"
                                }`}
                                title={formatFullDate(notif.createdAt)}
                              >
                                {formatTimeAgo(notif.createdAt)}
                              </span>

                              {notif.type && (
                                <>
                                  <span className="text-white/10">•</span>
                                  <span className="text-[10px] uppercase tracking-wider text-white/20">
                                    {notif.type}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {notif.link && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-white/25 hover:text-white hover:bg-white/5"
                                asChild
                              >
                                <Link href={notif.link}>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </Button>
                            )}

                            {!notif.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-white/25 hover:text-white hover:bg-white/5"
                                onClick={() =>
                                  markReadMutation.mutate(notif.id)
                                }
                                disabled={markReadMutation.isPending}
                                data-testid={`button-read-${notif.id}`}
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {!notif.isRead && (
                        <div className="h-px bg-white/[0.06]" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        {items.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-start gap-3">
              <Bell className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />

              <p className="text-xs text-white/25 leading-relaxed">
                Notifications are generated from activity across your RIVET
                account, including messages, marketplace activity, moderation,
                forums, and system updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}