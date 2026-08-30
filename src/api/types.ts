export type AgentStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

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
