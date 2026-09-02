import { useWebMCP } from "@mcp-b/react-webmcp";

import { useDashboardActions } from "../context/DashboardActionsContext";
import { useSession } from "../context/SessionContext";

const emptyObjectSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

export function WebMCPTools() {
  const { api } = useSession();
  const actions = useDashboardActions();

  useWebMCP(
    {
      name: "list_agents",
      description: "List agents in the current workspace",
      inputSchema: emptyObjectSchema,
      annotations: { readOnlyHint: true, title: "List Agents" },
      execute: async () => {
        const result = await api.listAgents();
        await actions.reloadAgents();
        return result;
      },
    },
    [actions, api],
  );

  useWebMCP(
    {
      name: "run_agent",
      description:
        "Start a BuildAI agent run with a text prompt. Use the Support Agent for the demo flow.",
      inputSchema: {
        type: "object",
        properties: {
          agentId: { type: "string", description: "Agent ID to run" },
          prompt: {
            type: "string",
            description: "Task prompt for the agent",
          },
        },
        required: ["agentId", "prompt"],
        additionalProperties: false,
      } as const,
      annotations: { title: "Run Agent" },
      execute: async ({ agentId, prompt }) => {
        const result = await api.runAgent(agentId, prompt);
        if (result.run?.id) {
          actions.setActiveRunId(result.run.id);
        }
        await actions.sync();
        return result;
      },
    },
    [actions, api],
  );

  useWebMCP(
    {
      name: "get_run_status",
      description: "Get run status, logs, and output for a task run",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string", description: "Task run ID" },
        },
        required: ["runId"],
        additionalProperties: false,
      } as const,
      annotations: { readOnlyHint: true, title: "Get Run Status" },
      execute: async ({ runId }) => {
        const result = await api.getRun(runId);
        actions.setActiveRunId(runId);
        await actions.sync();
        return result;
      },
    },
    [actions, api],
  );

  useWebMCP(
    {
      name: "list_pending_approvals",
      description: "List pending human approval requests in the workspace",
      inputSchema: emptyObjectSchema,
      annotations: { readOnlyHint: true, title: "List Pending Approvals" },
      execute: async () => {
        const result = await api.listPendingApprovals();
        await actions.sync();
        return result;
      },
    },
    [actions, api],
  );

  useWebMCP(
    {
      name: "approve_action",
      description:
        "Approve a pending action by approval ID. Requires workspace admin role.",
      inputSchema: {
        type: "object",
        properties: {
          approvalId: { type: "string", description: "Approval request ID" },
        },
        required: ["approvalId"],
        additionalProperties: false,
      } as const,
      annotations: { title: "Approve Action" },
      execute: async ({ approvalId }) => {
        const result = await api.approveApproval(approvalId, {
          reason: "Approved via WebMCP",
        });
        await actions.sync();
        return result;
      },
    },
    [actions, api],
  );

  useWebMCP(
    {
      name: "reject_action",
      description:
        "Reject a pending action by approval ID. Requires workspace admin role.",
      inputSchema: {
        type: "object",
        properties: {
          approvalId: { type: "string", description: "Approval request ID" },
        },
        required: ["approvalId"],
        additionalProperties: false,
      } as const,
      annotations: { title: "Reject Action" },
      execute: async ({ approvalId }) => {
        const result = await api.rejectApproval(approvalId);
        await actions.sync();
        return result;
      },
    },
    [actions, api],
  );

  useWebMCP(
    {
      name: "search_memory",
      description: "Search the workspace memory hub",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
        },
        required: ["query"],
        additionalProperties: false,
      } as const,
      annotations: { readOnlyHint: true, title: "Search Memory" },
      execute: async ({ query }) => api.searchMemory(query),
    },
    [api],
  );

  useWebMCP(
    {
      name: "get_workspace_summary",
      description:
        "Get workspace counts including agents, runs, pending approvals, and memory items",
      inputSchema: emptyObjectSchema,
      annotations: { readOnlyHint: true, title: "Workspace Summary" },
      execute: async () => api.getWorkspaceSummary(),
    },
    [api],
  );

  return null;
}

export const WEBMCP_TOOL_COUNT = 8;
