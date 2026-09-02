import {
  Check,
  Clock3,
  Database,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { RunSummary } from "../api/types";
import {
  agentNameFromRun,
  countStaleQueuedRuns,
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
import { useSession } from "@/context/SessionContext";

type ActivityPanelProps = {
  runs: RunSummary[];
  activeRunId: string | null;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onSelectRun: (runId: string) => void;
};

export function ActivityPanel({
  runs,
  activeRunId,
  loading,
  error,
  onReload,
  onSelectRun,
}: ActivityPanelProps) {
  const [memoryQuery, setMemoryQuery] = useState("");
  const [submittedMemoryQuery, setSubmittedMemoryQuery] = useState("");
  const { api } = useSession();
  const memorySearch = useQuery({
    queryKey: ["memory-search", submittedMemoryQuery],
    enabled: Boolean(submittedMemoryQuery),
    queryFn: () => api.searchMemory(submittedMemoryQuery),
  });
  const staleQueuedCount = countStaleQueuedRuns(runs);

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col">
      <PanelSectionHeader
        title="Activity"
        variant="heading"
        action={
          <div className="flex items-center gap-1.5 sm:gap-2">
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
              variant="secondary"
              className="gap-1.5 text-xs"
            >
              <span className="status-dot status-dot-pulse" />
              <span className="hidden sm:inline">Orchestrator Live</span>
              <span className="sm:hidden">Live</span>
            </Badge>
          </div>
        }
      />

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 px-3 py-3 sm:px-5 sm:py-4">
          {staleQueuedCount > 0 ? (
            <Alert className="border-border bg-muted/50">
              <Clock3 className="size-4 text-muted-foreground" />
              <AlertDescription className="text-foreground/85">
                {staleQueuedCount === 1
                  ? "1 run is still queued"
                  : `${staleQueuedCount} runs are still queued`}
                {" — "}
                waiting for the BuildAI worker to pick them up. They will move to
                Running automatically.
              </AlertDescription>
            </Alert>
          ) : null}

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
            <p className="type-body rounded-lg bg-muted/40 px-3 py-8 text-center text-muted-foreground">
              No runs yet. Start an agent to see activity here.
            </p>
          ) : null}

          {runs.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              highlighted={run.id === activeRunId}
              onSelect={() => onSelectRun(run.id)}
            />
          ))}
        </div>
      </ScrollArea>

      <footer className="shrink-0 bg-muted/20 p-4">
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); setSubmittedMemoryQuery(memoryQuery.trim()); }}>
          <div className="relative flex-1">
            <Database className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={memoryQuery}
              onChange={(event) => setMemoryQuery(event.target.value)}
              placeholder="Memory Search"
              className="type-body h-10 bg-surface pl-9 placeholder:text-muted-foreground/50"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="h-10 shrink-0 bg-surface"
            disabled={!memoryQuery.trim() || memorySearch.isFetching}
          >
            {memorySearch.isFetching ? <Loader2 className="animate-spin" /> : <Search />}
            Search
          </Button>
        </form>
        {submittedMemoryQuery && !memorySearch.isFetching ? (
          <div className="mt-3 max-h-28 space-y-1 overflow-y-auto rounded-lg bg-surface p-2">
            {memorySearch.error ? (
              <p className="type-caption text-destructive">{memorySearch.error.message}</p>
            ) : memorySearch.data?.length ? (
              memorySearch.data.slice(0, 3).map((item) => (
                <p key={item.id} className="type-caption line-clamp-2 rounded-md bg-muted/40 px-2 py-1.5 text-foreground/80">{item.text || item.type || "Memory item"}</p>
              ))
            ) : (
              <p className="type-caption px-2 py-1">No memory matched “{submittedMemoryQuery}”.</p>
            )}
          </div>
        ) : null}
      </footer>
    </section>
  );
}

function RunCard({
  run,
  highlighted,
  onSelect,
}: {
  run: RunSummary;
  highlighted: boolean;
  onSelect: () => void;
}) {
  const inProgress = runIsInProgress(run.status);
  const awaitingApproval = run.status === "AWAITING_APPROVAL";
  const failed = run.status === "FAILED" || run.status === "CANCELED";
  const log = latestLogMessage(run);
  const output = outputTextFromRun(run);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "surface-card run-card min-w-0 cursor-pointer overflow-hidden transition-all hover:-translate-y-px hover:shadow-md",
        highlighted && "ring-1 ring-foreground/20",
        awaitingApproval && "border-foreground/30",
        inProgress && "border-foreground/20",
      )}
    >
      <div
        className={cn(
          "px-4 py-3.5",
          awaitingApproval
            ? ""
            : inProgress
              ? ""
              : run.status === "SUCCEEDED"
                ? ""
                : failed
                  ? ""
                  : "",
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="type-title truncate">Run #{formatRunId(run.id)}</p>
            <p className="type-body mt-0.5 truncate">{agentNameFromRun(run)}</p>
            {run.inputText ? (
              <p className="type-caption mt-1.5 line-clamp-2 text-foreground/70">
                {run.inputText}
              </p>
            ) : null}
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "w-fit shrink-0 gap-1.5 self-start text-xs sm:self-auto",
              failed && "text-destructive",
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

        {(log || output) && (
          <div className="mt-3 min-w-0 space-y-3 pt-3">
            {log ? (
              <p className="type-mono wrap-anywhere whitespace-pre-wrap text-foreground/80">
                {log}
              </p>
            ) : null}

            {output ? (
              <div className="min-w-0 space-y-2">
                <p className="type-overline">Output</p>
                <pre className="type-mono surface-inset wrap-anywhere whitespace-pre-wrap px-3 py-3 text-[14px] text-foreground/90">
                  {output}
                </pre>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
