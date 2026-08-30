import type { RunStatus, RunSummary } from "../api/types";

const TERMINAL_STATUSES: RunStatus[] = [
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "BUDGET_BLOCKED",
];

export function isTerminalRunStatus(status: RunStatus) {
  return TERMINAL_STATUSES.includes(status);
}

export function isActiveRunStatus(status: RunStatus) {
  return !isTerminalRunStatus(status);
}

export function runStatusLabel(status: RunStatus) {
  switch (status) {
    case "QUEUED":
      return "Queued";
    case "RUNNING":
      return "Running...";
    case "AWAITING_APPROVAL":
      return "Awaiting approval";
    case "SUCCEEDED":
      return "Done";
    case "FAILED":
      return "Failed";
    case "CANCELED":
      return "Canceled";
    case "BUDGET_BLOCKED":
      return "Budget blocked";
    default:
      return status;
  }
}

export function runIsInProgress(status: RunStatus) {
  return status === "QUEUED" || status === "RUNNING";
}

export function formatRunId(id: string) {
  return id.length > 8 ? id.slice(-6) : id;
}

export function agentNameFromRun(run: RunSummary) {
  if (run.agent && typeof run.agent === "object" && "name" in run.agent) {
    const name = run.agent.name;
    if (typeof name === "string") return name;
  }
  return "Agent";
}

export function latestLogMessage(run: RunSummary) {
  const logs = run.rawLogs;
  if (!Array.isArray(logs) || logs.length === 0) return undefined;

  const last = logs[logs.length - 1];
  if (typeof last === "object" && last !== null) {
    const record = last as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.step === "string") return `Step: ${record.step}`;
  }
  return undefined;
}

export function outputTextFromRun(run: RunSummary) {
  if (typeof run.outputPreview === "string" && run.outputPreview) {
    return run.outputPreview;
  }

  const output = run.output;
  if (typeof output === "object" && output !== null && "content" in output) {
    const content = (output as { content?: unknown }).content;
    if (typeof content === "string") return content;
  }

  if (typeof run.error === "string" && run.error) {
    return run.error;
  }

  return undefined;
}
