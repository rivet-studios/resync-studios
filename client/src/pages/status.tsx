import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Shield,
  MessageSquare,
  CreditCard,
  Lock,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceStatus {
  status: "operational" | "degraded" | "offline";
  label: string;
}

interface PlatformStatus {
  overall: "operational" | "degraded" | "maintenance";
  services: Record<string, ServiceStatus>;
  maintenance: { active: boolean; message: string | null };
  lastChecked: string;
}

const SERVICE_ICONS: Record<string, typeof Server> = {
  platform: Server,
  database: Database,
  authentication: Lock,
  forums: MessageSquare,
  moderation: Shield,
  payments: CreditCard,
};

function StatusIcon({ status }: { status: string }) {
  if (status === "operational") {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }
  if (status === "degraded") {
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
  return <XCircle className="h-5 w-5 text-red-500" />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "operational") {
    return (
      <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10" data-testid="badge-operational">
        Operational
      </Badge>
    );
  }
  if (status === "degraded") {
    return (
      <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10" data-testid="badge-degraded">
        Degraded
      </Badge>
    );
  }
  if (status === "maintenance") {
    return (
      <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/10" data-testid="badge-maintenance">
        Maintenance
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10" data-testid="badge-offline">
      Offline
    </Badge>
  );
}

export default function Status() {
  const { data: status, isLoading, refetch, isFetching } = useQuery<PlatformStatus>({
    queryKey: ["/api/platform-status"],
    refetchInterval: 30000,
  });

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-status-title">Platform Status</h1>
        <p className="text-muted-foreground">
          Real-time status of RIVET Studios services
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Checking service status...</p>
          </CardContent>
        </Card>
      ) : status ? (
        <div className="space-y-6">
          <Card data-testid="card-overall-status">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-4 w-4 rounded-full ${
                    status.overall === "operational" ? "bg-green-500" :
                    status.overall === "maintenance" ? "bg-blue-500" :
                    "bg-yellow-500"
                  }`} />
                  <div>
                    <h2 className="text-xl font-semibold">
                      {status.overall === "operational"
                        ? "All Systems Operational"
                        : status.overall === "maintenance"
                        ? "Scheduled Maintenance"
                        : "Some Systems Degraded"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  data-testid="button-refresh-status"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {status.maintenance.active && status.maintenance.message && (
            <Card className="border-blue-500/30" data-testid="card-maintenance-notice">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Wrench className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-500">Maintenance Notice</p>
                    <p className="text-sm text-muted-foreground mt-1">{status.maintenance.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card data-testid="card-services">
            <CardHeader>
              <CardTitle className="text-lg">Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {Object.entries(status.services).map(([key, service], index) => {
                const Icon = SERVICE_ICONS[key] || Server;
                return (
                  <div key={key}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex items-center justify-between py-1" data-testid={`service-row-${key}`}>
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{service.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={service.status} />
                        <StatusIcon status={service.status} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>Status updates every 30 seconds automatically.</p>
            <p className="mt-1">
              For urgent issues, please contact{" "}
              <a href="mailto:support@resyncstudios.com" className="underline hover:opacity-80">
                support@resyncstudios.com
              </a>
            </p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-muted-foreground">Unable to fetch platform status.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()} data-testid="button-retry-status">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
