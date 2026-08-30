import { useCallback, useEffect, useState } from "react";

import { ApiError } from "../api/client";
import type { Approval } from "../api/types";
import { useSession } from "../context/SessionContext";
import { usePolling } from "./usePolling";

function agentNameFromApproval(approval: Approval) {
  if (approval.agent && typeof approval.agent.name === "string") {
    return approval.agent.name;
  }
  return "Agent";
}

export function useApprovals(pollWhileActive: boolean) {
  const { api, authPhase } = useSession();
  const [pending, setPending] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    if (authPhase !== "ready") {
      setPending([]);
      return;
    }

    setLoading(true);

    try {
      const items = await api.listPendingApprovals();
      setPending(items.filter((item) => item.status === "PENDING"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load approvals");
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, [api, authPhase]);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  usePolling(() => void loadPending(), 5000, pollWhileActive);

  const approve = useCallback(
    async (id: string) => {
      setActingId(id);
      setError(null);

      try {
        await api.approveApproval(id);
        setPending((current) => current.filter((item) => item.id !== id));
      } catch (err) {
        const message =
          err instanceof ApiError && err.status === 403
            ? "Approve requires workspace admin role"
            : err instanceof Error
              ? err.message
              : "Failed to approve";
        setError(message);
        throw err;
      } finally {
        setActingId(null);
      }
    },
    [api],
  );

  const reject = useCallback(
    async (id: string) => {
      setActingId(id);
      setError(null);

      try {
        await api.rejectApproval(id);
        setPending((current) => current.filter((item) => item.id !== id));
      } catch (err) {
        const message =
          err instanceof ApiError && err.status === 403
            ? "Reject requires workspace admin role"
            : err instanceof Error
              ? err.message
              : "Failed to reject";
        setError(message);
        throw err;
      } finally {
        setActingId(null);
      }
    },
    [api],
  );

  return {
    pending,
    loading,
    actingId,
    error,
    reload: loadPending,
    approve,
    reject,
    agentNameFromApproval,
  };
}
