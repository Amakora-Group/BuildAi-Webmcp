import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthGate } from "./components/AuthGate";
import { ActivityPanel } from "./components/ActivityPanel";
import { AgentsPanel } from "./components/AgentsPanel";
import { ApprovalsPanel } from "./components/ApprovalsPanel";
import { ConfigError } from "./components/ConfigError";
import { ConnectionBar } from "./components/ConnectionBar";
import {
  DashboardMobileNav,
  type MobileDashboardTab,
} from "./components/DashboardMobileNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { cn } from "@/lib/utils";
import { WebMCPProvider } from "./context/WebMCPContext";
import { useSession } from "./context/SessionContext";
import { useAgents } from "./hooks/useAgents";
import { useDashboard } from "./hooks/useDashboard";
import type { Approval } from "./api/types";
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
  const {
    agents,
    loading: agentsLoading,
    error: agentsError,
    reload: reloadAgents,
  } = useAgents();
  const [mobileTab, setMobileTab] = useState<MobileDashboardTab>("activity");
  const pendingCountRef = useRef(0);
  const mobileNavReadyRef = useRef(false);

  const dashboard = useDashboard();
  const {
    activeRunId,
    runs,
    pending,
    loading: runsLoading,
    refreshing,
    runSubmitting,
    runError,
    actingId,
    error: dashboardError,
    hasActiveRun,
    sync,
    runAgent,
    approve,
    reject,
    agentNameFromApproval,
    clearRunError,
  } = dashboard;

  useEffect(() => {
    const previousCount = pendingCountRef.current;
    if (
      mobileNavReadyRef.current &&
      pending.length > previousCount &&
      pending.length > 0
    ) {
      setMobileTab("approvals");
    }

    pendingCountRef.current = pending.length;
    mobileNavReadyRef.current = true;
  }, [pending.length]);

  const handleRunStarted = useCallback(() => {
    setMobileTab("activity");
  }, []);

  const handleRunAgent = useCallback(
    async (agentId: string, prompt: string) => {
      await runAgent(agentId, prompt);
      handleRunStarted();
    },
    [handleRunStarted, runAgent],
  );

  const handleApprove = useCallback(
    async (approval: Approval) => {
      await approve(approval);
    },
    [approve],
  );

  const handleReject = useCallback(
    async (approval: Approval) => {
      await reject(approval);
    },
    [reject],
  );

  const dashboardActions = useMemo(
    () => ({
      setActiveRunId: dashboard.setActiveRunId,
      reloadAgents,
      sync: () => sync({ showRefresh: true }),
    }),
    [dashboard.setActiveRunId, reloadAgents, sync],
  );

  const runsError = dashboardError;
  const approvalsError = dashboardError;

  return (
    <WebMCPProvider actions={dashboardActions}>
      <div className="app-shell flex h-svh flex-col bg-background text-foreground">
        <ConnectionBar />

        <main className="dashboard-grid grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[minmax(250px,300px)_minmax(420px,1fr)_minmax(280px,340px)] lg:gap-4 lg:p-4">
          <div
            className={cn(
              "dashboard-panel min-h-0 overflow-hidden",
              mobileTab !== "agents" && "hidden lg:block",
            )}
          >
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

          <div
            className={cn(
              "dashboard-panel dashboard-panel-primary min-h-0 min-w-0 overflow-hidden",
              mobileTab !== "activity" && "hidden lg:block",
            )}
          >
            <ActivityPanel
              runs={runs}
              activeRunId={activeRunId}
              loading={runsLoading || refreshing}
              error={runsError}
              onReload={() => void sync({ showRefresh: true })}
              onSelectRun={dashboard.setActiveRunId}
            />
          </div>

          <div
            className={cn(
              "dashboard-panel min-h-0 overflow-hidden",
              mobileTab !== "approvals" && "hidden lg:block",
            )}
          >
            <ApprovalsPanel
              pending={pending}
              loading={runsLoading}
              actingId={actingId}
              error={approvalsError}
              agentNameFromApproval={agentNameFromApproval}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        </main>

        <DashboardMobileNav
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          pendingCount={pending.length}
          hasActiveRun={hasActiveRun}
        />
      </div>
    </WebMCPProvider>
  );
}

export default App;
