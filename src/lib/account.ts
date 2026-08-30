import type { ApiClient } from "../api/client";
import type { AccountMeResponse } from "../api/types";

export function getAccountWorkspace(
  account: AccountMeResponse | null | undefined,
) {
  return account?.currentWorkspace?.workspace ?? null;
}

export function assertAccountMe(data: unknown): AccountMeResponse {
  const account = data as AccountMeResponse;

  if (!account?.currentWorkspace?.workspace?.id) {
    throw new Error(
      "Your account loaded but no workspace was returned. Make sure you belong to a workspace in BuildAI.",
    );
  }

  return account;
}

export async function loadSessionAccount(
  api: ApiClient,
): Promise<AccountMeResponse> {
  try {
    return assertAccountMe(await api.getAccountMe());
  } catch (firstError) {
    const workspaces = await api.listWorkspaces();
    const first = workspaces.items?.[0];

    if (!first?.workspace?.id) {
      throw firstError instanceof Error
        ? firstError
        : new Error("Failed to load account and no workspaces were found.");
    }

    return assertAccountMe(await api.getAccountMe(first.workspace.id));
  }
}
