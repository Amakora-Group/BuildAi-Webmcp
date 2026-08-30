import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError } from "../api/client";
import type { RunSummary } from "../api/types";
import { useSession } from "../context/SessionContext";
import { isActiveRunStatus, isTerminalRunStatus } from "../lib/runs";
import { usePolling } from "./usePolling";

function mergeRun(runs: RunSummary[], next: RunSummary) {
  const index = runs.findIndex((run) => run.id === next.id);
  if (index === -1) return [next, ...runs];
  const copy = [...runs];
  copy[index] = { ...copy[index], ...next };
  return copy;
}

export function useRuns(activeRunId: string | null) {
  const { api, authPhase } = useSession();
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [activeRun, setActiveRun] = useState<RunSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    if (authPhase !== "ready") {
      setRuns([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.listRuns(1, 10);
      setRuns(Array.isArray(response.items) ? response.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load runs");
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }, [api, authPhase]);

  const pollActiveRun = useCallback(async () => {
    if (!activeRunId || authPhase !== "ready") return;

    try {
      const run = await api.getRun(activeRunId);
      setActiveRun(run);
      setRuns((current) => mergeRun(current, run));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh run");
    }
  }, [activeRunId, api, authPhase]);

  useEffect(() => {
    void loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    if (!activeRunId) {
      setActiveRun(null);
      return;
    }

    void pollActiveRun();
  }, [activeRunId, pollActiveRun]);

  const shouldPollRun = Boolean(
    activeRunId &&
      authPhase === "ready" &&
      (!activeRun || isActiveRunStatus(activeRun.status)),
  );

  usePolling(() => void pollActiveRun(), 2500, shouldPollRun);

  const hasActiveRun = useMemo(() => {
    if (activeRunId && !activeRun) return true;
    if (!activeRunId || !activeRun) return false;
    return isActiveRunStatus(activeRun.status);
  }, [activeRun, activeRunId]);

  const runFinished = useMemo(() => {
    if (!activeRun) return false;
    return isTerminalRunStatus(activeRun.status);
  }, [activeRun]);

  return {
    runs,
    activeRun,
    loading,
    error,
    hasActiveRun,
    runFinished,
    reload: loadRuns,
    refreshActiveRun: pollActiveRun,
  };
}

export function useRunAgent(onStarted: (runId: string) => void) {
  const { api } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAgent = useCallback(
    async (agentId: string, prompt: string) => {
      setSubmitting(true);
      setError(null);

      try {
        const response = await api.runAgent(agentId, prompt);
        const runId = response.run?.id;
        if (!runId) {
          throw new ApiError("Run started but no run id returned", 500);
        }
        onStarted(runId);
        return response.run;
      } catch (err) {
        const message =
          err instanceof ApiError && err.status === 401
            ? "Invalid demo token"
            : err instanceof Error
              ? err.message
              : "Failed to start run";
        setError(message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [api, onStarted],
  );

  return { runAgent, submitting, error, clearError: () => setError(null) };
}
