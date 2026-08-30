import {
  FolderOpen,
  Loader2,
  LogOut,
  Radio,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ApiError } from "../api/client";
import { getAccountWorkspace } from "../lib/account";
import { WORKSPACE_LABEL } from "../lib/config";
import { useSession } from "../context/SessionContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type ConnectionStatus = "checking" | "connected" | "error";

export function ConnectionBar() {
  const {
    account,
    workspaceName,
    api,
    session,
    error: sessionError,
    signOut,
  } = useSession();
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [healthError, setHealthError] = useState<string | null>(null);

  async function checkHealth() {
    setStatus("checking");
    setHealthError(null);

    try {
      await api.getHealth();
      setStatus("connected");
    } catch (err) {
      setStatus("error");
      setHealthError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Health check failed",
      );
    }
  }

  useEffect(() => {
    void checkHealth();
  }, [api]);

  const displayWorkspace =
    WORKSPACE_LABEL || workspaceName || getAccountWorkspace(account)?.name;
  const connectionError = sessionError ?? healthError;
  const email = session?.user.email ?? account?.account.email ?? "";
  const initials = getInitials(email, account?.account.name);

  return (
    <header className="shrink-0 border-b border-border bg-panel/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="type-display truncate">BuildAI Command</h1>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="hidden min-w-0 items-center gap-1.5 sm:flex">
            <FolderOpen className="size-4 shrink-0 text-muted-foreground/70" />
            <span className="type-body truncate text-muted-foreground">
              {displayWorkspace ?? "Workspace"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionBadge status={status} />
          <Badge
            variant="outline"
            className="hidden border-border/80 text-muted-foreground sm:inline-flex"
          >
            WebMCP Active
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden text-muted-foreground sm:inline-flex"
            aria-label="Connection signal"
          >
            <Radio />
          </Button>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Account menu"
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-surface text-xs font-medium text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {email ? (
                <div className="type-caption px-2 py-1.5">{email}</div>
              ) : null}
              <DropdownMenuItem onClick={() => void signOut()}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {connectionError ? (
        <div className="type-body border-t border-destructive/20 bg-destructive/5 px-5 py-2.5 text-destructive">
          <WifiOff className="mr-1.5 inline size-3.5 align-[-2px]" />
          {connectionError}
        </div>
      ) : null}
    </header>
  );
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  if (status === "checking") {
    return (
      <Badge variant="outline" className="gap-1.5 text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Checking
      </Badge>
    );
  }

  if (status === "connected") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
      >
        <span className="size-1.5 rounded-full bg-emerald-400" />
        Connected
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1.5">
      <WifiOff className="size-3" />
      Disconnected
    </Badge>
  );
}

function getInitials(email: string, name: string | null | undefined) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return "U";
}
