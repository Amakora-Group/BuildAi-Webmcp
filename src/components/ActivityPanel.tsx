import {
  Check,
  Database,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

import type { RunSummary } from "../api/types";
import {
  agentNameFromRun,
  formatRunId,
  latestLogMessage,
  outputTextFromRun,
  runIsInProgress,
  runStatusLabel,
} from "../lib/runs";
import { PanelSectionHeader } from "./PanelSectionHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ActivityPanelProps = {
  runs: RunSummary[];
  activeRunId: string | null;
  loading: boolean;
  error: string | null;
  onReload: () => void;
};

export function ActivityPanel({
  runs,
  activeRunId,
  loading,
  error,
  onReload,
}: ActivityPanelProps) {
  const [memoryQuery, setMemoryQuery] = useState("");

  return (
    <section className="flex h-full min-h-0 flex-col">
      <PanelSectionHeader
        title="Activity"
        variant="heading"
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={loading}
              onClick={onReload}
              aria-label="Refresh activity"
              className="text-muted-foreground"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
            </Button>
            <Badge
              variant="outline"
              className="gap-1.5 border-sky-500/25 bg-sky-500/10 text-xs text-sky-400"
            >
              <span className="size-1.5 rounded-full bg-sky-400" />
              Orchestrator Live
            </Badge>
          </div>
        }
      />

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-4">
          {loading && runs.length === 0 ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full rounded-lg bg-surface" />
              <Skeleton className="h-32 w-full rounded-lg bg-surface" />
            </div>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {!loading && runs.length === 0 ? (
            <p className="type-body rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-muted-foreground">
              No runs yet. Start an agent to see activity here.
            </p>
          ) : null}

          {runs.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              highlighted={run.id === activeRunId}
            />
          ))}
        </div>
      </ScrollArea>

      <footer className="shrink-0 border-t border-border p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Database className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={memoryQuery}
              onChange={(event) => setMemoryQuery(event.target.value)}
              placeholder="Memory Search"
              className="type-body h-10 border-border/80 bg-surface pl-9 placeholder:text-muted-foreground/50"
            />
          </div>
          <Button type="button" variant="outline" className="h-10 shrink-0" disabled title="Memory search coming next">
            <Search />
            Search
          </Button>
        </div>
      </footer>
    </section>
  );
}

function RunCard({
  run,
  highlighted,
}: {
  run: RunSummary;
  highlighted: boolean;
}) {
  const inProgress = runIsInProgress(run.status);
  const awaitingApproval = run.status === "AWAITING_APPROVAL";
  const failed = run.status === "FAILED" || run.status === "CANCELED";
  const log = latestLogMessage(run);
  const output = outputTextFromRun(run);

  return (
    <article
      className={cn(
        "surface-card overflow-hidden",
        highlighted && "ring-1 ring-sky-500/40",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5">
        <div className="min-w-0">
          <p className="type-title truncate">Run #{formatRunId(run.id)}</p>
          <p className="type-body mt-0.5 truncate">{agentNameFromRun(run)}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 gap-1.5 text-xs",
            inProgress &&
              "border-sky-500/25 bg-sky-500/10 text-sky-400",
            awaitingApproval &&
              "border-amber-500/25 bg-amber-500/10 text-amber-400",
            run.status === "SUCCEEDED" &&
              "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
            failed &&
              "border-red-500/25 bg-red-500/10 text-red-400",
          )}
        >
          {inProgress ? (
            <Loader2 className="size-3 animate-spin" />
          ) : run.status === "SUCCEEDED" ? (
            <Check className="size-3" />
          ) : failed ? (
            <X className="size-3" />
          ) : null}
          {runStatusLabel(run.status)}
        </Badge>
      </div>

      <div className="space-y-3 px-4 py-4">
        {log ? <p className="type-mono text-foreground/80">{log}</p> : null}

        {output ? (
          <div className="space-y-2.5">
            <p className="type-overline">Output</p>
            <pre className="type-mono surface-inset overflow-x-auto px-3 py-3 text-[14px] text-foreground/90">
              {output}
            </pre>
          </div>
        ) : null}
      </div>
    </article>
  );
}
