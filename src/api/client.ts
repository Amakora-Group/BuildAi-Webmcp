import { API_BASE_URL } from "../lib/config";
import type {
  AccountMeResponse,
  Agent,
  ApiEnvelope,
  Approval,
  DashboardSummary,
  HealthResponse,
  MemoryItem,
  PaginatedResponse,
  RunAgentResponse,
  RunSummary,
  WorkspaceMembership,
} from "./types";
import { extractRunFromResponse } from "../lib/runs";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ClientContext = {
  getToken: () => Promise<string | null>;
  getWorkspaceId: () => string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function messageFromEnvelopeError(error: unknown) {
  if (typeof error === "string") return error;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return "Request failed";
}

function unwrapApiPayload<T>(payload: unknown): T {
  if (isRecord(payload) && "success" in payload && "data" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (!envelope.success) {
      throw new ApiError(messageFromEnvelopeError(envelope.error), 400);
    }
    return envelope.data;
  }

  return payload as T;
}

async function parseErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as unknown;
    if (isRecord(body) && body.success === false) {
      return messageFromEnvelopeError(body.error);
    }
    if (isRecord(body)) {
      const message = body.message ?? body.error;
      if (typeof message === "string") return message;
    }
    return response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

export function createApiClient(context: ClientContext) {
  async function request<T>(
    path: string,
    init: RequestInit = {},
    workspaceOverride?: string | null,
  ): Promise<T> {
    const token = await context.getToken();
    const workspaceId = workspaceOverride ?? context.getWorkspaceId();
    const headers = new Headers(init.headers);

    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (workspaceId) {
      headers.set("x-workspace-id", workspaceId);
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
      });
    } catch {
      throw new ApiError("Cannot reach API — check CORS and URL", 0);
    }

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = (await response.json()) as unknown;
    return unwrapApiPayload<T>(payload);
  }

  return {
    getHealth: () => request<HealthResponse>("/health"),
    getAccountMe: (workspaceId?: string) =>
      request<AccountMeResponse>("/api/account/me", {}, workspaceId),
    listWorkspaces: (page = 1, pageSize = 20) =>
      request<PaginatedResponse<WorkspaceMembership>>(
        `/api/workspaces?page=${page}&pageSize=${pageSize}`,
        {},
        null,
      ),
    listAgents: (page = 1, pageSize = 20) =>
      request<PaginatedResponse<Agent>>(
        `/api/agents?page=${page}&pageSize=${pageSize}`,
      ),
    runAgent: async (agentId: string, prompt: string) => {
      const response = await request<RunAgentResponse | RunSummary>("/api/task-runs", {
        method: "POST",
        body: JSON.stringify({
          agentId,
          input: { task: prompt },
          triggerSource: "WEB_APP",
        }),
      });
      return { run: extractRunFromResponse(response) };
    },
    listRuns: (page = 1, pageSize = 10) =>
      request<PaginatedResponse<RunSummary>>(
        `/api/runs?page=${page}&pageSize=${pageSize}`,
      ),
    getRun: (id: string) => request<RunSummary>(`/api/runs/${id}`),
    retryRun: async (id: string) => {
      const response = await request<RunAgentResponse | RunSummary>(
        `/api/runs/${id}/retry`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );
      return { run: extractRunFromResponse(response) };
    },
    listPendingApprovals: async () => {
      const response = await request<PaginatedResponse<Approval>>(
        "/api/approvals?status=PENDING&pageSize=20",
      );
      return Array.isArray(response.items) ? response.items : [];
    },
    getApproval: (id: string) => request<Approval>(`/api/approvals/${id}`),
    approveApproval: (id: string, body: Record<string, unknown> = {}) =>
      request<Approval>(`/api/approvals/${id}/approve`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    rejectApproval: (id: string) =>
      request<Approval>(`/api/approvals/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    searchMemory: (query: string) =>
      request<MemoryItem[]>(
        `/api/memory/search?q=${encodeURIComponent(query)}`,
      ),
    getWorkspaceSummary: () =>
      request<DashboardSummary>("/api/dashboard/summary"),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
