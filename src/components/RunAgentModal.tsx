import { Loader2, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Agent } from "../api/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [prompt, setPrompt] = useState(DEMO_RUN_PROMPT);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      setPrompt(DEMO_RUN_PROMPT);
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!agent) return null;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-50 m-auto w-[min(100%-2rem,480px)] rounded-xl border border-border bg-panel p-0 text-foreground shadow-2xl backdrop:bg-black/60",
        "open:animate-in open:fade-in-0",
      )}
      onCancel={(event) => {
        event.preventDefault();
        if (!submitting) onClose();
      }}
      onClose={onClose}
    >
      <form
        className="flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (!prompt.trim() || submitting) return;
          void onSubmit(prompt.trim());
        }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="min-w-0">
            <p className="type-overline text-muted-foreground">Run agent</p>
            <h2 className="type-heading mt-1 truncate">{agent.name}</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={submitting}
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-muted-foreground"
          >
            <X />
          </Button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="run-prompt" className="type-body text-muted-foreground">
              Prompt
            </Label>
            <textarea
              id="run-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              disabled={submitting}
              className="type-body w-full resize-y rounded-lg border border-border/80 bg-surface px-3 py-2.5 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !prompt.trim()}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <Play />}
            Run
          </Button>
        </div>
      </form>
    </dialog>
  );
}
