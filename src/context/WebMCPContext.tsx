import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DashboardActionsProvider,
  type DashboardActions,
} from "./DashboardActionsContext";
import { WEBMCP_TOOL_COUNT, WebMCPTools } from "../webmcp/WebMCPTools";

type WebMCPContextValue = {
  isActive: boolean;
  toolCount: number;
};

const WebMCPContext = createContext<WebMCPContextValue>({
  isActive: false,
  toolCount: 0,
});

function hasModelContext() {
  return (
    typeof document !== "undefined" &&
    "modelContext" in document &&
    document.modelContext != null
  );
}

export function WebMCPProvider({
  actions,
  children,
}: {
  actions: DashboardActions;
  children: ReactNode;
}) {
  const [isActive] = useState(hasModelContext);

  const value = useMemo<WebMCPContextValue>(
    () => ({
      isActive,
      toolCount: isActive ? WEBMCP_TOOL_COUNT : 0,
    }),
    [isActive],
  );

  return (
    <DashboardActionsProvider actions={actions}>
      <WebMCPContext.Provider value={value}>
        <WebMCPTools />
        {children}
      </WebMCPContext.Provider>
    </DashboardActionsProvider>
  );
}

export function useWebMCPStatus() {
  return useContext(WebMCPContext);
}
