import type { Approval } from "../api/types";

export function approvalIsActionable(approval: Approval) {
  return approval.status === "PENDING" && Boolean(approval.id);
}
