import { Loader2, Play } from "lucide-react";
import { useState } from "react";

import type { Agent } from "../api/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const DEMO_RUN_PROMPT =
  "Summarize open tickets and send email to the client with the summary.";

type RunAgentModalProps = {
  agent: Agent | null;
  open: boolean;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (prompt: string) => Promise<void>;
};

export function RunAgentModal({
  agent,
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: RunAgentModalProps) {
  const [prompt, setPrompt] = useState(DEMO_RUN_PROMPT);

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !submitting) { setPrompt(DEMO_RUN_PROMPT); onClose(); } }}>
      <DialogContent className="max-w-lg border border-border bg-panel sm:max-w-lg">
      <form
        className="contents"
        onSubmit={(event) => {
          event.preventDefault();
          if (!prompt.trim() || submitting) return;
          void onSubmit(prompt.trim());
        }}
      >
        <DialogHeader>
          <DialogTitle>Run {agent.name}</DialogTitle>
          <DialogDescription>Describe the outcome you want this agent to produce.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label
              htmlFor="run-prompt"
              className="type-body text-muted-foreground"
            >
              Prompt
            </Label>
            <Textarea
              id="run-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              disabled={submitting}
              className="type-body min-h-28 resize-y border-0 bg-surface shadow-none ring-0 focus-visible:ring-2"
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter className="-mx-4 -mb-4 border-0 bg-muted/35">
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={onClose}
            className="h-10 sm:h-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !prompt.trim()}
            className="h-10 bg-foreground text-background hover:bg-foreground/90 sm:h-8"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <Play />}
            Run
          </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  );
}
