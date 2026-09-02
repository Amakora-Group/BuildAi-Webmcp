import { Bot, Check, FolderOpen, Loader2, X } from "lucide-react";

import type { Approval } from "../api/types";
import { approvalIsActionable } from "../lib/approvals";
import { PanelSectionHeader } from "./PanelSectionHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type ApprovalsPanelProps = {
  pending: Approval[];
  loading: boolean;
  actingId: string | null;
  error: string | null;
  agentNameFromApproval: (approval: Approval) => string;
  onApprove: (approval: Approval) => Promise<void>;
  onReject: (approval: Approval) => Promise<void>;
};

export function ApprovalsPanel({
  pending,
  loading,
  actingId,
  error,
  agentNameFromApproval,
  onApprove,
  onReject,
}: ApprovalsPanelProps) {
  const pendingCount = pending.length;

  return (
    <section className="flex h-full min-h-0 flex-col">
      <PanelSectionHeader
        title="Approvals"
        action={
          pendingCount > 0 ? (
            <Badge variant="default" className="text-xs">
              {pendingCount} Pending
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs text-muted-foreground">
              0 Pending
            </Badge>
          )
        }
      />

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-3 sm:p-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {loading && pendingCount === 0 ? (
            <Skeleton className="h-40 w-full rounded-lg bg-surface" />
          ) : null}

          {pending.map((approval) => {
            const acting = actingId === approval.id;
            const actionable = approvalIsActionable(approval);

            return (
              <article key={approval.id} className="surface-card approval-card overflow-hidden">
                <div className="px-4 py-4">
                  <p className="type-overline">
                    Action Required
                  </p>
                  <h3 className="type-heading mt-2">{approval.title}</h3>
                  {approval.description ? (
                    <p className="type-body mt-2 text-muted-foreground">
                      {approval.description}
                    </p>
                  ) : null}
                  <p className="type-body mt-2.5 flex items-center gap-1.5">
                    <Bot className="size-4 text-muted-foreground/60" />
                    Requested by: {agentNameFromApproval(approval)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-background/40 p-3.5">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={acting || !actionable}
                    className="h-10 sm:h-9"
                    onClick={() => void onReject(approval)}
                  >
                    {acting ? <Loader2 className="animate-spin" /> : <X />}
                    Reject
                  </Button>
                  <Button
                    type="button"
                    disabled={acting || !actionable}
                    className="h-10 sm:h-9"
                    onClick={() => void onApprove(approval)}
                  >
                    {acting ? <Loader2 className="animate-spin" /> : <Check />}
                    Approve
                  </Button>
                </div>
              </article>
            );
          })}

          {pendingCount === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <FolderOpen className="size-5 text-muted-foreground/40" />
              <p className="type-body">No approvals waiting right now.</p>
              <p className="type-caption max-w-[220px]">
                Runs that need email or other sensitive actions will show up
                here.
              </p>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </section>
  );
}
