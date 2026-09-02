import { Loader2, Play, Plus, RefreshCw } from "lucide-react";
import { useState, type ReactNode } from "react";

import type { Agent, AgentStatus } from "../api/types";
import { agentStatusLabel, isRunnableAgentStatus } from "../lib/agents";
import { RunAgentModal } from "./RunAgentModal";
import { PanelSectionHeader } from "./PanelSectionHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AgentsPanelProps = {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  runSubmitting: boolean;
  runError: string | null;
  onRunAgent: (agentId: string, prompt: string) => Promise<void>;
  onClearRunError: () => void;
};

export function AgentsPanel({
  agents,
  loading,
  error,
  onReload,
  runSubmitting,
  runError,
  onRunAgent,
  onClearRunError,
}: AgentsPanelProps) {
  const [runTarget, setRunTarget] = useState<Agent | null>(null);

  return (
    <section className="flex h-full min-h-0 flex-col">
      <PanelSectionHeader
        title="Agents"
        action={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={loading}
            onClick={onReload}
            aria-label="Refresh agents"
            className="text-muted-foreground"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
          </Button>
        }
      />

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2.5 p-3 sm:p-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-lg bg-surface" />
              <Skeleton className="h-28 w-full rounded-lg bg-surface" />
            </div>
          ) : null}

          {!loading && error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {!loading && !error && agents.length === 0 ? (
            <PanelMessage>No agents in this workspace yet.</PanelMessage>
          ) : null}

          {!loading &&
            agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                disabled={runSubmitting}
                onRun={() => {
                  onClearRunError();
                  setRunTarget(agent);
                }}
              />
            ))}
        </div>
      </ScrollArea>

      <footer className="shrink-0 bg-muted/20 p-3 sm:p-4">
        <Button
          type="button"
          variant="secondary"
          className="type-body h-10 w-full bg-surface/60 text-muted-foreground"
          disabled
          title="Deploy flow coming next"
        >
          <Plus />
          Deploy New Agent
        </Button>
      </footer>

      <RunAgentModal
        agent={runTarget}
        open={runTarget !== null}
        submitting={runSubmitting}
        error={runError}
        onClose={() => {
          if (!runSubmitting) setRunTarget(null);
        }}
        onSubmit={async (prompt) => {
          if (!runTarget) return;
          await onRunAgent(runTarget.id, prompt);
          setRunTarget(null);
        }}
      />
    </section>
  );
}

function AgentCard({
  agent,
  disabled,
  onRun,
}: {
  agent: Agent;
  disabled: boolean;
  onRun: () => void;
}) {
  const isRunnable = isRunnableAgentStatus(agent.status);

  return (
    <article className="surface-card agent-card group overflow-hidden">
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <h3 className="type-title truncate">{agent.name}</h3>
            <p className="type-body line-clamp-2">
              {agent.description || "No description"}
            </p>
          </div>
          <AgentStatusBadge status={agent.status} />
        </div>

        <Button
          type="button"
          size="default"
        variant={isRunnable ? "default" : "secondary"}
          className={cn(
            "h-10 w-full transition-all sm:h-9",
            isRunnable
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              : "bg-background/60 text-muted-foreground",
          )}
          disabled={!isRunnable || disabled}
          onClick={onRun}
        >
          <Play />
          Run
        </Button>
      </div>
    </article>
  );
}

function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const label = agentStatusLabel(status);

  if (isRunnableAgentStatus(status)) {
    return (
      <Badge
        variant="secondary"
        className="shrink-0 gap-1.5 text-xs"
      >
        <span className="status-dot" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="shrink-0 text-xs text-muted-foreground"
    >
      {label}
    </Badge>
  );
}

function PanelMessage({ children }: { children: ReactNode }) {
  return (
    <p className="type-body rounded-lg bg-muted/40 px-3 py-6 text-center">
      {children}
    </p>
  );
}
