import { AlertTriangle } from "lucide-react";

import { getConfigErrorMessage } from "../lib/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ConfigError() {
  const message = getConfigErrorMessage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-lg border-destructive/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Configuration required
          </CardTitle>
          <CardDescription>
            {message ??
              "Environment variables are missing. Add them to webmcp-demo/.env.local and restart Vite."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Add to .env.local</AlertTitle>
            <AlertDescription>
              Copy these variables into <code className="rounded bg-muted px-1 py-0.5">webmcp-demo/.env.local</code>.
            </AlertDescription>
          </Alert>
          <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-xs">
{`VITE_API_BASE_URL=https://your-api.example.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <p className="text-sm text-muted-foreground">
            After saving <code className="rounded bg-muted px-1 py-0.5">.env.local</code>,
            stop and run <code className="rounded bg-muted px-1 py-0.5">npm run dev</code> again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
