import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const REPORT_REASONS = [
  "Harassment",
  "Spam",
  "Inappropriate Content",
  "Cheating",
  "Impersonation",
  "Other",
] as const;

interface ReportDialogProps {
  targetId: string;
  targetType: "user" | "thread" | "reply" | "product";
  trigger: React.ReactNode;
}

export function ReportDialog({ targetId, targetType, trigger }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const { toast } = useToast();

  const reportMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reports", {
        targetId,
        targetType,
        reason,
        details: details || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. Our team will review it shortly.",
      });
      setOpen(false);
      setReason("");
      setDetails("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Submit Report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      toast({
        title: "Reason Required",
        description: "Please select a reason for your report.",
        variant: "destructive",
      });
      return;
    }
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild data-testid="button-report-trigger">
        {trigger}
      </DialogTrigger>
      <DialogContent
        className="border-border"
        style={{ backgroundColor: "#121212" }}
        data-testid="dialog-report"
      >
        <DialogHeader>
          <DialogTitle data-testid="text-report-title">
            Report {targetType.charAt(0).toUpperCase() + targetType.slice(1)}
          </DialogTitle>
          <DialogDescription data-testid="text-report-description">
            Help us keep the community safe by reporting inappropriate content or behavior.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger data-testid="select-report-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r} data-testid={`select-item-reason-${r.toLowerCase().replace(/\s+/g, "-")}`}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Additional Details (optional)</label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context about your report..."
              className="min-h-[100px] resize-none border-border"
              style={{ backgroundColor: "#050505" }}
              data-testid="textarea-report-details"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!reason || reportMutation.isPending}
            data-testid="button-submit-report"
          >
            {reportMutation.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
