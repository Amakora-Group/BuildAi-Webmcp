import { Loader2, Play, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import type { Agent, AgentStatus } from "../api/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AgentsPanelProps = {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
};

export function AgentsPanel({
  agents,
  loading,
  error,
  onReload,
}: AgentsPanelProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border pb-4">
        <div>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">
            Agents
          </CardTitle>
          <CardDescription>
            {loading
              ? "Loading workspace agents…"
              : `${agents.length} agent${agents.length === 1 ? "" : "s"} available`}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={onReload}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RefreshCw />
          )}
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
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

        {agents.map((agent) => (
          <Card key={agent.id} size="sm" className="bg-muted/20">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <CardDescription className="mt-1">
                  {agent.description || "No description"}
                </CardDescription>
              </div>
              <AgentStatusBadge status={agent.status} />
            </CardHeader>
            <CardContent>
              <Button type="button" size="sm" disabled title="Run modal coming next">
                <Play />
                Run
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const label =
    status === "ACTIVE" ? "Active" : status === "DRAFT" ? "Draft" : status;

  if (status === "ACTIVE") {
    return (
      <Badge variant="secondary" className="border-primary/30 bg-primary/10 text-primary">
        {label}
      </Badge>
    );
  }

  return <Badge variant="outline">{label}</Badge>;
}

function PanelMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
