import { useCallback, useEffect, useState } from "react";

import { ApiError } from "../api/client";
import type { Agent } from "../api/types";
import { useSession } from "../context/SessionContext";

export function useAgents() {
  const { api, authPhase } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = useCallback(async () => {
    if (authPhase !== "ready") {
      setAgents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.listAgents();
      setAgents(Array.isArray(response.items) ? response.items : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid demo token");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load agents");
      }
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [api, authPhase]);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  return { agents, loading, error, reload: loadAgents };
}
