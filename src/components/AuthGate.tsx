import {
  CheckCircle2,
  Loader2,
  LogIn,
  Server,
  Shield,
  XCircle,
} from "lucide-react";
import { useState, type ComponentType, type FormEvent, type ReactNode } from "react";

import { useSession, type AuthPhase } from "@/context/SessionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const AUTH_STEPS = [
  {
    id: "sign-in",
    title: "Sign in",
    description: "Use your BuildAI email and password.",
    icon: LogIn,
  },
  {
    id: "workspace",
    title: "Load workspace",
    description: "We fetch your current workspace and permissions.",
    icon: Shield,
  },
  {
    id: "api",
    title: "Connect to API",
    description: "Your session is used to call the production API.",
    icon: Server,
  },
] as const;

function stepStatus(
  stepId: (typeof AUTH_STEPS)[number]["id"],
  phase: AuthPhase,
): "done" | "active" | "pending" | "error" {
  if (phase === "account_error") {
    if (stepId === "sign-in") return "done";
    return "error";
  }
  if (phase === "ready") return "done";
  if (phase === "unauthenticated") {
    return stepId === "sign-in" ? "active" : "pending";
  }
  if (phase === "loading_account" || phase === "initializing") {
    if (stepId === "sign-in") return "done";
    if (stepId === "workspace") return "active";
    return "pending";
  }
  return "pending";
}

export function AuthGate() {
  const {
    authPhase,
    signIn,
    signOut,
    refreshAccount,
    error,
    session,
  } = useSession();

  if (authPhase === "initializing") {
    return <AuthShell phase={authPhase} />;
  }

  if (authPhase === "loading_account") {
    return (
      <AuthShell phase={authPhase}>
        <LoadingAccountCard email={session?.user.email} />
      </AuthShell>
    );
  }

  if (authPhase === "account_error") {
    return (
      <AuthShell phase={authPhase}>
        <AccountErrorCard
          error={error}
          email={session?.user.email}
          onRetry={() => void refreshAccount()}
          onSignOut={() => void signOut()}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell phase={authPhase}>
      <SignInCard onSignIn={signIn} />
    </AuthShell>
  );
}

function AuthShell({
  phase,
  children,
}: {
  phase: AuthPhase;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/40 px-6 py-4 lg:hidden">
        <Badge variant="secondary" className="mb-2">
          BuildAI Command
        </Badge>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Connect to your agents
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in, load your workspace, then open the dashboard.
        </p>
      </div>

      <div className="mx-auto grid min-h-[calc(100svh-88px)] max-w-6xl lg:min-h-screen lg:grid-cols-[1fr_420px]">
        <aside className="hidden flex-col justify-between border-r border-border bg-card/40 p-10 lg:flex">
          <div>
            <Badge variant="secondary" className="mb-6">
              BuildAI Command
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Connect to your agents
            </h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              Sign in once to load your workspace and talk to the BuildAI API.
              Each step below must succeed before the dashboard opens.
            </p>

            <ol className="mt-10 space-y-4">
              {AUTH_STEPS.map((step, index) => {
                const status = stepStatus(step.id, phase);
                const Icon = step.icon;

                return (
                  <li key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <StepIcon status={status} icon={Icon} />
                      {index < AUTH_STEPS.length - 1 ? (
                        <div
                          className={cn(
                            "mt-2 h-10 w-px",
                            status === "done" ? "bg-primary/60" : "bg-border",
                          )}
                        />
                      ) : null}
                    </div>
                    <div className="pb-6">
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="text-xs text-muted-foreground">
            Same credentials as app.buildai.com — not a separate account.
          </p>
        </aside>

        <main className="flex items-center justify-center p-6 sm:p-10">
          {children ?? <InitializingCard />}
        </main>
      </div>
    </div>
  );
}

function StepIcon({
  status,
  icon: Icon,
}: {
  status: "done" | "active" | "pending" | "error";
  icon: ComponentType<{ className?: string }>;
}) {
  if (status === "done") {
    return <CheckCircle2 className="size-5 text-primary" />;
  }
  if (status === "active") {
    return <Loader2 className="size-5 animate-spin text-primary" />;
  }
  if (status === "error") {
    return <XCircle className="size-5 text-destructive" />;
  }
  return <Icon className="size-5 text-muted-foreground/50" />;
}

function InitializingCard() {
  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle>Checking session</CardTitle>
        <CardDescription>
          Looking for an existing sign-in on this device…
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </CardContent>
    </Card>
  );
}

function SignInCard({
  onSignIn,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onSignIn(email.trim(), password);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle>Sign in to BuildAI</CardTitle>
        <CardDescription>
          Step 1 of 3 — authenticate with Supabase, then we load your workspace
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Your BuildAI password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" />
                Signing in…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          After sign-in you&apos;ll see workspace loading, then the dashboard.
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingAccountCard({ email }: { email?: string | null }) {
  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle>Loading your workspace</CardTitle>
        <CardDescription>
          Step 2 of 3 — signed in{email ? ` as ${email}` : ""}. Fetching account
          details…
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium">Connecting to BuildAI API</p>
            <p className="text-xs text-muted-foreground">
              Resolving workspace and permissions
            </p>
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </CardContent>
    </Card>
  );
}

function AccountErrorCard({
  error,
  email,
  onRetry,
  onSignOut,
}: {
  error: string | null;
  email?: string | null;
  onRetry: () => void;
  onSignOut: () => void;
}) {
  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle>Couldn&apos;t load workspace</CardTitle>
        <CardDescription>
          Step 2 failed{email ? ` for ${email}` : ""}. You&apos;re signed in, but
          we couldn&apos;t reach your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <XCircle />
          <AlertTitle>Account error</AlertTitle>
          <AlertDescription>
            {error ?? "Unknown error while loading your account."}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={onRetry}>
            Try again
          </Button>
          <Button className="flex-1" variant="outline" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


function formatAuthError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.toLowerCase().includes("invalid login credentials")) {
      return "Email or password is incorrect. Use the same credentials as app.buildai.com.";
    }
    return err.message;
  }
  return "Sign in failed. Please try again.";
}
