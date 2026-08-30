import { Loader2, LogOut, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { ApiError } from "../api/client";
import { getAccountWorkspace } from "../lib/account";
import { WORKSPACE_LABEL } from "../lib/config";
import { useSession } from "../context/SessionContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [checking, setChecking] = useState(false);

  async function checkHealth() {
    setChecking(true);
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
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    void checkHealth();
  }, [api]);

  const displayWorkspace =
    WORKSPACE_LABEL || workspaceName || getAccountWorkspace(account)?.name;
  const connectionError = sessionError ?? healthError;
  const email = session?.user.email;

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">BuildAI Command</h1>
            <ConnectionBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {displayWorkspace ? `${displayWorkspace}` : "Workspace"}
            {email ? ` · ${email}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={checking}
            onClick={() => void checkHealth()}
          >
            {checking ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            Recheck API
          </Button>
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void signOut()}
          >
            <LogOut />
            Sign out
          </Button>
        </div>
      </div>

      {connectionError ? (
        <div className="px-6 pb-4">
          <Alert variant="destructive">
            <WifiOff />
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        </div>
      ) : null}
    </header>
  );
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  if (status === "checking") {
    return (
      <Badge variant="secondary">
        <Loader2 className="animate-spin" />
        Checking API
      </Badge>
    );
  }

  if (status === "connected") {
    return (
      <Badge variant="secondary" className="border-primary/30 bg-primary/10 text-primary">
        <Wifi />
        API connected
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <WifiOff />
      API error
    </Badge>
  );
}
