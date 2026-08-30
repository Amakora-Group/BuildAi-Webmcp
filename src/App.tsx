import { useCallback, useState } from "react";
import { AuthGate } from "./components/AuthGate";
import { ActivityPanel } from "./components/ActivityPanel";
import { AgentsPanel } from "./components/AgentsPanel";
import { ApprovalsPanel } from "./components/ApprovalsPanel";
import { ConfigError } from "./components/ConfigError";
import { ConnectionBar } from "./components/ConnectionBar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useSession } from "./context/SessionContext";
import { useAgents } from "./hooks/useAgents";
import { useApprovals } from "./hooks/useApprovals";
import { useRunAgent, useRuns } from "./hooks/useRuns";
import { isConfigValid } from "./lib/config";

function App() {
  if (!isConfigValid()) {
    return <ConfigError />;
  }

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const { authPhase } = useSession();

  if (authPhase !== "ready") {
    return <AuthGate />;
  }

  return <Dashboard />;
}

function Dashboard() {
  const { agents, loading: agentsLoading, error: agentsError, reload: reloadAgents } =
    useAgents();
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const handleRunStarted = useCallback((runId: string) => {
    setActiveRunId(runId);
  }, []);

  const {
    runs,
    loading: runsLoading,
    error: runsError,
    hasActiveRun,
    reload: reloadRuns,
    refreshActiveRun,
  } = useRuns(activeRunId);

  const {
    runAgent,
    submitting: runSubmitting,
    error: runError,
    clearError: clearRunError,
  } = useRunAgent((runId) => {
    handleRunStarted(runId);
    void reloadRuns();
  });

  const {
    pending,
    loading: approvalsLoading,
    actingId,
    error: approvalsError,
    approve,
    reject,
    agentNameFromApproval,
  } = useApprovals(hasActiveRun);

  const handleRunAgent = useCallback(
    async (agentId: string, prompt: string) => {
      await runAgent(agentId, prompt);
    },
    [runAgent],
  );

  const handleApprove = useCallback(
    async (id: string) => {
      await approve(id);
      void refreshActiveRun();
      void reloadRuns();
    },
    [approve, refreshActiveRun, reloadRuns],
  );

  const handleReject = useCallback(
    async (id: string) => {
      await reject(id);
      void refreshActiveRun();
      void reloadRuns();
    },
    [reject, refreshActiveRun, reloadRuns],
  );

  return (
    <div className="flex h-svh flex-col bg-background text-foreground">
      <ConnectionBar />

      <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(260px,320px)_1fr_minmax(260px,320px)]">
        <div className="min-h-0 border-r border-border bg-panel">
          <AgentsPanel
            agents={agents}
            loading={agentsLoading}
            error={agentsError}
            onReload={() => void reloadAgents()}
            runSubmitting={runSubmitting}
            runError={runError}
            onRunAgent={handleRunAgent}
            onClearRunError={clearRunError}
          />
        </div>

        <div className="min-h-0 border-r border-border bg-background">
          <ActivityPanel
            runs={runs}
            activeRunId={activeRunId}
            loading={runsLoading}
            error={runsError}
            onReload={() => void reloadRuns()}
          />
        </div>

        <div className="min-h-0 bg-panel">
          <ApprovalsPanel
            pending={pending}
            loading={approvalsLoading}
            actingId={actingId}
            error={approvalsError}
            agentNameFromApproval={agentNameFromApproval}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
