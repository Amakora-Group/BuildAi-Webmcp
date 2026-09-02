import {
  Blocks,
  FolderOpen,
  Loader2,
  LogOut,
  Radio,
  WifiOff,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getAccountWorkspace } from "../lib/account";
import { WORKSPACE_LABEL } from "../lib/config";
import { useSession } from "../context/SessionContext";
import { useWebMCPStatus } from "../context/WebMCPContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";

export function ConnectionBar() {
  const {
    account,
    workspaceName,
    api,
    session,
    error: sessionError,
    signOut,
  } = useSession();
  const { isActive: webmcpActive, toolCount } = useWebMCPStatus();
  const health = useQuery({ queryKey: ["health"], queryFn: () => api.getHealth(), retry: 1 });
  const status = health.isPending ? "checking" : health.isError ? "error" : "connected";

  const displayWorkspace =
    WORKSPACE_LABEL || workspaceName || getAccountWorkspace(account)?.name;
  const connectionError = sessionError ?? (health.error instanceof Error ? health.error.message : null);
  const email = session?.user.email ?? account?.account.email ?? "";
  const initials = getInitials(email, account?.account.name);

  return (
    <header className="command-header relative z-10 shrink-0 pt-[env(safe-area-inset-top)]">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:h-[72px] sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="brand-mark"><Blocks className="size-4" /></div>
          <div className="min-w-0">
            <h1 className="type-display truncate text-base sm:text-lg">BuildAI Command</h1>
            <p className="hidden text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase sm:block">Agent operations console</p>
          </div>
          <div className="hidden min-w-0 items-center gap-1.5 md:flex">
            <FolderOpen className="size-4 shrink-0 text-muted-foreground/70" />
            <span className="type-body truncate text-muted-foreground">
              {displayWorkspace ?? "Workspace"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <ConnectionBadge status={status} compact />
          {webmcpActive ? (
            <Badge
              variant="secondary"
              className="hidden gap-1.5 text-xs md:inline-flex"
            >
              <span className="status-dot" />
              WebMCP · {toolCount} tools
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="hidden text-xs text-muted-foreground md:inline-flex"
              title="Open in ChatGPT or Chrome 149+ with WebMCP to enable tools"
            >
              WebMCP Unavailable
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden text-muted-foreground md:inline-flex"
            aria-label="Connection signal"
          >
            <Radio />
          </Button>
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
              {displayWorkspace ? (
                <div className="type-caption flex items-center gap-1.5 px-2 py-1.5 text-muted-foreground md:hidden">
                  <FolderOpen className="size-3.5 shrink-0" />
                  <span className="truncate">{displayWorkspace}</span>
                </div>
              ) : null}
              <DropdownMenuItem onClick={() => void signOut()}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {displayWorkspace ? (
        <div className="flex min-w-0 items-center gap-1.5 bg-muted/20 px-4 py-2 md:hidden">
          <FolderOpen className="size-3.5 shrink-0 text-muted-foreground/70" />
          <span className="type-caption truncate text-muted-foreground">
            {displayWorkspace}
          </span>
        </div>
      ) : null}

      {connectionError ? (
        <div className="type-body bg-destructive/5 px-4 py-2.5 text-destructive sm:px-5">
          <WifiOff className="mr-1.5 inline size-3.5 align-[-2px]" />
          {connectionError}
        </div>
      ) : null}
    </header>
  );
}

function ConnectionBadge({
  status,
  compact = false,
}: {
  status: "checking" | "connected" | "error";
  compact?: boolean;
}) {
  if (status === "checking") {
    return (
      <Badge variant="secondary" className="gap-1.5 text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        {compact ? null : "Checking"}
      </Badge>
    );
  }

  if (status === "connected") {
    return (
      <Badge
        variant="secondary"
        className="gap-1.5"
        title={compact ? "Connected" : undefined}
      >
        <span className="status-dot" />
        {compact ? null : "Connected"}
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1.5" title={compact ? "Disconnected" : undefined}>
      <WifiOff className="size-3" />
      {compact ? null : "Disconnected"}
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
