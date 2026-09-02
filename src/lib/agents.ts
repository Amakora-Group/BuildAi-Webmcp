import type { AgentStatus } from "../api/types";

const RUNNABLE_STATUSES = new Set<AgentStatus>(["PUBLISHED", "ACTIVE"]);

export function isRunnableAgentStatus(status: AgentStatus) {
  return RUNNABLE_STATUSES.has(status);
}

export function agentStatusLabel(status: AgentStatus) {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "ACTIVE":
      return "Active";
    case "DRAFT":
      return "Draft";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}
