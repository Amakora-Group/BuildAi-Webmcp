import { useQuery } from "@tanstack/react-query";

import { useSession } from "../context/SessionContext";

export function useAgents() {
  const { api, authPhase } = useSession();
  const query = useQuery({
    queryKey: ["agents"],
    enabled: authPhase === "ready",
    queryFn: async () => {
      const response = await api.listAgents();
      return Array.isArray(response.items) ? response.items : [];
    },
  });

  return {
    agents: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    reload: async () => {
      await query.refetch();
    },
  };
}
