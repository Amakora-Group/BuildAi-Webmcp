import { AuthGate } from "./components/AuthGate";
import { AgentsPanel } from "./components/AgentsPanel";
import { ConfigError } from "./components/ConfigError";
import { ConnectionBar } from "./components/ConnectionBar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useSession } from "./context/SessionContext";
import { useAgents } from "./hooks/useAgents";
import { isConfigValid } from "./lib/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function App() {
  if (!isConfigValid()) {
    return <ConfigError />;
  }

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const { authPhase } = useSession();

  if (authPhase !== "ready") {
    return <AuthGate />;
  }

  return <Dashboard />;
}

function Dashboard() {
  const { agents, loading: agentsLoading, error, reload } = useAgents();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ConnectionBar />

      <main className="grid gap-4 p-4 lg:grid-cols-3">
        <AgentsPanel
          agents={agents}
          loading={agentsLoading}
          error={error}
          onReload={() => void reload()}
        />

        <PlaceholderPanel
          title="Activity"
          description="Run history and polling land here next."
        />

        <PlaceholderPanel
          title="Approvals"
          description="Pending approvals and approve/reject actions land here next."
        />
      </main>
    </div>
  );
}

function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed bg-card/50">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wide">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}

export default App;
