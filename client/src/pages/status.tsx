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
  Activity,
  Clock3,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceStatus {
  status:
    | "operational"
    | "degraded"
    | "partial outage"
    | "major outage"
    | "maintenance"
    | "offline";
  label: string;
}

interface PlatformStatus {
  overall:
    | "operational"
    | "degraded"
    | "major outage"
    | "maintenance"
    | "offline";
  services: Record<string, ServiceStatus>;
  maintenance: {
    active: boolean;
    message: string | null;
  };
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

function StatusIcon({
  status,
  size = "default",
}: {
  status: string;
  size?: "default" | "large";
}) {
  const className = size === "large" ? "h-6 w-6" : "h-4 w-4";

  if (status === "operational") {
    return <CheckCircle2 className={`${className} text-green-500`} />;
  }

  if (status === "degraded") {
    return <AlertTriangle className={`${className} text-yellow-500`} />;
  }

  if (status === "partial outage") {
    return <AlertTriangle className={`${className} text-orange-500`} />;
  }

  if (status === "major outage") {
    return <AlertTriangle className={`${className} text-red-500`} />;
  }

  if (status === "maintenance") {
    return <Wrench className={`${className} text-blue-500`} />;
  }

  return <XCircle className={`${className} text-red-500`} />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "operational") {
    return (
      <Badge
        variant="outline"
        className="border-green-500/30 bg-green-500/10 text-green-500"
        data-testid="badge-operational"
      >
        Operational
      </Badge>
    );
  }

  if (status === "degraded") {
    return (
      <Badge
        variant="outline"
        className="border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
        data-testid="badge-degraded"
      >
        Degraded
      </Badge>
    );
  }

  if (status === "partial outage") {
    return (
      <Badge
        variant="outline"
        className="border-orange-500/30 bg-orange-500/10 text-orange-500"
        data-testid="badge-partial-outage"
      >
        Partial Outage
      </Badge>
    );
  }

  if (status === "major outage") {
    return (
      <Badge
        variant="outline"
        className="border-red-500/30 bg-red-500/10 text-red-500"
        data-testid="badge-major-outage"
      >
        Major Outage
      </Badge>
    );
  }

  if (status === "maintenance") {
    return (
      <Badge
        variant="outline"
        className="border-blue-500/30 bg-blue-500/10 text-blue-500"
        data-testid="badge-maintenance"
      >
        Maintenance
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-red-500/30 bg-red-500/10 text-red-500"
      data-testid="badge-offline"
    >
      Offline
    </Badge>
  );
}

function getOverallStyles(overall: PlatformStatus["overall"]) {
  switch (overall) {
    case "operational":
      return {
        dot: "bg-green-500",
        icon: "text-green-500",
        border: "border-green-500/20",
        background: "bg-green-500/[0.04]",
        title: "All Systems Operational",
        description: "All RIVET Studios services are operating normally.",
      };

    case "maintenance":
      return {
        dot: "bg-blue-500",
        icon: "text-blue-500",
        border: "border-blue-500/20",
        background: "bg-blue-500/[0.04]",
        title: "Scheduled Maintenance",
        description: "One or more RIVET Studios services are currently undergoing maintenance.",
      };

    case "major outage":
    case "offline":
      return {
        dot: "bg-red-500",
        icon: "text-red-500",
        border: "border-red-500/20",
        background: "bg-red-500/[0.04]",
        title: "Major Service Disruption",
        description: "One or more critical RIVET Studios services are currently unavailable.",
      };

    case "degraded":
    default:
      return {
        dot: "bg-yellow-500",
        icon: "text-yellow-500",
        border: "border-yellow-500/20",
        background: "bg-yellow-500/[0.04]",
        title: "Some Systems Degraded",
        description: "One or more RIVET Studios services may be experiencing issues.",
      };
  }
}

function formatLastChecked(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function Status() {
  const {
    data: status,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<PlatformStatus>({
    queryKey: ["/api/platform-status"],
    refetchInterval: 30000,
  });

  const serviceEntries = status ? Object.entries(status.services) : [];

  const operationalCount = serviceEntries.filter(
    ([, service]) => service.status === "operational",
  ).length;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            RIVET Studios Infrastructure
          </div>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1
                className="text-3xl font-bold tracking-tight md:text-4xl"
                data-testid="text-status-title"
              >
                Platform Status
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                Live operational status for RIVET Studios services and infrastructure.
              </p>
            </div>

            {status && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                <span>
                  Updated {formatLastChecked(status.lastChecked)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <Card className="border-border/60 bg-card/70">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>

              <h2 className="font-semibold">Checking platform status</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Connecting to RIVET Studios infrastructure...
              </p>
            </CardContent>
          </Card>
        ) : status ? (
          <div className="space-y-6">
            {/* Overall status */}
            {(() => {
              const styles = getOverallStyles(status.overall);

              return (
                <Card
                  className={`overflow-hidden border ${styles.border} ${styles.background}`}
                  data-testid="card-overall-status"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
                      <div className="flex items-start gap-4">
                        <div className="relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/70">
                          <span
                            className={`absolute h-3 w-3 rounded-full ${styles.dot}`}
                          />
                          {status.overall !== "operational" && (
                            <span
                              className={`absolute h-3 w-3 animate-ping rounded-full opacity-40 ${styles.dot}`}
                            />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-semibold tracking-tight">
                              {styles.title}
                            </h2>

                            <Badge
                              variant="outline"
                              className="border-border/60 bg-background/50 text-xs uppercase tracking-wider"
                            >
                              {status.overall}
                            </Badge>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {styles.description}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="shrink-0"
                        data-testid="button-refresh-status"
                      >
                        <RefreshCw
                          className={`mr-2 h-4 w-4 ${
                            isFetching ? "animate-spin" : ""
                          }`}
                        />
                        {isFetching ? "Checking..." : "Refresh"}
                      </Button>
                    </div>

                    <div className="border-t border-border/50 bg-background/20 px-6 py-3 md:px-7">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span>
                            {operationalCount} of {serviceEntries.length} services operational
                          </span>
                        </div>

                        <div className="hidden h-3 w-px bg-border sm:block" />

                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Automatic checks every 30 seconds</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Maintenance notice */}
            {status.maintenance.active && status.maintenance.message && (
              <Card
                className="border-blue-500/25 bg-blue-500/[0.04]"
                data-testid="card-maintenance-notice"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                      <Wrench className="h-4 w-4 text-blue-500" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-blue-500">
                          Maintenance Notice
                        </p>

                        <Badge
                          variant="outline"
                          className="border-blue-500/20 bg-blue-500/10 text-[10px] uppercase tracking-wider text-blue-500"
                        >
                          Active
                        </Badge>
                      </div>

                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        {status.maintenance.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            <Card
              className="overflow-hidden border-border/60 bg-card/70"
              data-testid="card-services"
            >
              <CardHeader className="border-b border-border/50 bg-muted/[0.08]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Services</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Current operational state of RIVET Studios infrastructure.
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden border-border/60 bg-background/50 sm:inline-flex"
                  >
                    {serviceEntries.length} Services
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {serviceEntries.length > 0 ? (
                  <div>
                    {serviceEntries.map(([key, service], index) => {
                      const Icon = SERVICE_ICONS[key] || Server;

                      return (
                        <div key={key}>
                          {index > 0 && (
                            <Separator className="bg-border/50" />
                          )}

                          <div
                            className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/[0.08] md:px-6"
                            data-testid={`service-row-${key}`}
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/20">
                                <Icon className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover:text-foreground" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-medium">
                                  {service.label}
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {key === "platform"
                                    ? "Core RIVET platform"
                                    : key === "database"
                                    ? "Data and persistence"
                                    : key === "authentication"
                                    ? "Account authentication"
                                    : key === "forums"
                                    ? "Community forums"
                                    : key === "moderation"
                                    ? "Moderation infrastructure"
                                    : key === "payments"
                                    ? "Payments and commerce"
                                    : "RIVET Studios service"}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <StatusBadge status={service.status} />
                              <StatusIcon status={service.status} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Server className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No service information is currently available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status information */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/60 bg-card/50">
                <CardContent className="flex gap-4 p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/20">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="font-medium">Automated Monitoring</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Service status is automatically refreshed every 30 seconds
                      while this page is open.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/50">
                <CardContent className="flex gap-4 p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/20">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="font-medium">Need Assistance?</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Report service issues directly to the RIVET Studios support
                      team.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 pt-6 text-center">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                RIVET Studios Platform Operations
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                For urgent platform issues, contact{" "}
                <a
                  href="mailto:support@rivetstudiosus.com"
                  className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  support@rivetstudiosus.com
                </a>
                .
              </p>

              <a
                href="mailto:support@rivetstudiosus.com"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact Support
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : (
          <Card className="border-red-500/20 bg-red-500/[0.03]">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>

              <h2 className="font-semibold">Status Unavailable</h2>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                RIVET Studios could not retrieve the current platform status.
                This does not necessarily indicate a service outage.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => refetch()}
                data-testid="button-retry-status"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}