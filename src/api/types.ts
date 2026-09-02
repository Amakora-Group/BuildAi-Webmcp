export type AgentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "ACTIVE";

export type Agent = {
  id: string;
  name: string;
  description: string | null;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type Workspace = {
  id: string;
  name: string;
  slug?: string | null;
};

export type AccountMeResponse = {
  account: {
    id: string;
    email: string | null;
    name: string | null;
  };
  currentWorkspace: {
    workspace: Workspace;
    role: string;
  };
};

export type WorkspaceMembership = {
  workspace: Workspace;
  role: string;
};

export type HealthResponse = {
  status: string;
  service: string;
};

export type ApiErrorPayload = {
  code?: string;
  message?: string;
};

export type ApiEnvelope<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: ApiErrorPayload | string | null };

export type RunStatus =
  | "QUEUED"
  | "RUNNING"
  | "AWAITING_APPROVAL"
  | "BUDGET_BLOCKED"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";

export type RunAgentResponse = {
  status?: string;
  run?: RunSummary;
  approval?: Approval | null;
  output?: unknown;
};

export type RunSummary = {
  id: string;
  status: RunStatus;
  agentId?: string | null;
  agent?: { id: string; name: string } | null;
  inputText?: string;
  outputPreview?: string;
  output?: unknown;
  error?: string | null;
  rawLogs?: unknown[];
  approvalId?: string | null;
  createdAt?: string;
  completedAt?: string | null;
};

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EDITED";

export type Approval = {
  id: string;
  title: string;
  description?: string | null;
  status: ApprovalStatus;
  agentId?: string | null;
  agent?: { id: string; name: string } | null;
  taskRunId?: string | null;
  createdAt?: string;
};

export type MemoryItem = {
  id: string;
  text?: string;
  type?: string;
  scope?: string;
  sensitivity?: string | null;
  status?: string;
  agent?: { id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardSummary = {
  activeAgents: number;
  activeWorkflows: number;
  memoryItems: number;
  workflowRuns: number;
  pendingApprovals: number;
  liveDeployments: number;
  credits?: {
    used: number;
    limit: number;
    remaining: number;
  };
  providerSpend?: {
    amount: number;
    currency: string;
  };
};
