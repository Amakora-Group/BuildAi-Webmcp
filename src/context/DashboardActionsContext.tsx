import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

export type DashboardActions = {
  setActiveRunId: (runId: string) => void;
  reloadAgents: () => Promise<void>;
  sync: () => Promise<void>;
};

const DashboardActionsContext = createContext<DashboardActions | null>(null);

export function DashboardActionsProvider({
  actions,
  children,
}: {
  actions: DashboardActions;
  children: ReactNode;
}) {
  return (
    <DashboardActionsContext.Provider value={actions}>
      {children}
    </DashboardActionsContext.Provider>
  );
}

export function useDashboardActions() {
  const context = useContext(DashboardActionsContext);
  if (!context) {
    throw new Error(
      "useDashboardActions must be used within DashboardActionsProvider",
    );
  }
  return context;
}
