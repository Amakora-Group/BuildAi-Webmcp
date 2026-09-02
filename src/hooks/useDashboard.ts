import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "../api/client";
import type { Approval, RunSummary } from "../api/types";
import { useSession } from "../context/SessionContext";
import { hasInFlightRuns, isActiveRunStatus, isTerminalRunStatus } from "../lib/runs";

const runsKey = ["runs"] as const;
const approvalsKey = ["approvals", "pending"] as const;

function agentNameFromApproval(approval: Approval) {
  return approval.agent?.name || "Agent";
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useDashboard() {
  const { api, authPhase } = useSession();
  const queryClient = useQueryClient();
  const enabled = authPhase === "ready";
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const runsQuery = useQuery({
    queryKey: runsKey,
    enabled,
    queryFn: async () => {
      const response = await api.listRuns(1, 10);
      return Array.isArray(response.items) ? response.items : [];
    },
    refetchInterval: (query) =>
      hasInFlightRuns((query.state.data as RunSummary[] | undefined) ?? []) ? 3_000 : false,
  });
  const runs = runsQuery.data ?? [];

  const activeRunQuery = useQuery({
    queryKey: ["run", activeRunId],
    enabled: enabled && Boolean(activeRunId),
    queryFn: () => api.getRun(activeRunId!),
    refetchInterval: (query) => {
      const run = query.state.data as RunSummary | undefined;
      return !run || isActiveRunStatus(run.status) ? 3_000 : false;
    },
  });

  const approvalsQuery = useQuery({
    queryKey: approvalsKey,
    enabled,
    queryFn: () => api.listPendingApprovals(),
    refetchInterval: (query) => {
      const approvals = (query.state.data as Approval[] | undefined) ?? [];
      return hasInFlightRuns(runs) || approvals.length > 0 ? 3_000 : false;
    },
  });
  const pending = approvalsQuery.data ?? [];
  const activeRun = activeRunQuery.data ?? null;

  const sync = useCallback(async (options?: { showRefresh?: boolean }) => {
    void options;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: runsKey }),
      queryClient.invalidateQueries({ queryKey: approvalsKey }),
      activeRunId
        ? queryClient.invalidateQueries({ queryKey: ["run", activeRunId] })
        : Promise.resolve(),
    ]);
  }, [activeRunId, queryClient]);

  const runMutation = useMutation({
    mutationFn: ({ agentId, prompt }: { agentId: string; prompt: string }) =>
      api.runAgent(agentId, prompt),
    onMutate: () => setRunError(null),
    onSuccess: async ({ run }) => {
      setActiveRunId(run.id);
      queryClient.setQueryData<RunSummary[]>(runsKey, (current = []) => [
        run,
        ...current.filter((item) => item.id !== run.id),
      ]);
      toast.success("Agent run queued");
      await sync();
    },
    onError: (error) => {
      const message =
        error instanceof ApiError && error.status === 401
          ? "Your session has expired. Please sign in again."
          : errorMessage(error, "Failed to start run");
      setRunError(message);
      toast.error(message);
    },
  });

  const approvalMutation = useMutation({
    mutationFn: ({ approval, decision }: { approval: Approval; decision: "approve" | "reject" }) => {
      if (approval.status !== "PENDING") {
        throw new ApiError("This approval has already been decided.", 409);
      }
      return decision === "approve"
        ? api.approveApproval(approval.id, { reason: "Approved from BuildAI Command" })
        : api.rejectApproval(approval.id);
    },
    onSuccess: async (_result, { approval, decision }) => {
      queryClient.setQueryData<Approval[]>(approvalsKey, (current = []) =>
        current.filter((item) => item.id !== approval.id),
      );
      toast.success(decision === "approve" ? "Action approved" : "Action rejected");
      await sync();
    },
    onError: (error) => {
      const message =
        error instanceof ApiError && error.status === 403
          ? "Only workspace admins and owners can decide approvals."
          : errorMessage(error, "Failed to update approval");
      toast.error(message);
    },
  });

  const runAgent = useCallback(
    async (agentId: string, prompt: string) =>
      (await runMutation.mutateAsync({ agentId, prompt })).run,
    [runMutation],
  );
  const approve = useCallback(
    async (approval: Approval) => {
      await approvalMutation.mutateAsync({ approval, decision: "approve" });
    },
    [approvalMutation],
  );
  const reject = useCallback(
    async (approval: Approval) => {
      await approvalMutation.mutateAsync({ approval, decision: "reject" });
    },
    [approvalMutation],
  );

  const queryError = runsQuery.error ?? approvalsQuery.error ?? activeRunQuery.error;
  const hasActiveRun = Boolean(activeRunId && (!activeRun || isActiveRunStatus(activeRun.status)));

  return {
    activeRunId,
    setActiveRunId,
    runs,
    activeRun,
    pending,
    loading: runsQuery.isPending || approvalsQuery.isPending,
    refreshing: runsQuery.isFetching || approvalsQuery.isFetching,
    runSubmitting: runMutation.isPending,
    runError,
    actingId: approvalMutation.isPending ? approvalMutation.variables?.approval.id ?? null : null,
    error: queryError instanceof Error ? queryError.message : null,
    hasActiveRun,
    runFinished: activeRun ? isTerminalRunStatus(activeRun.status) : false,
    sync,
    runAgent,
    approve,
    reject,
    agentNameFromApproval,
    clearRunError: () => setRunError(null),
  };
}
