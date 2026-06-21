"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[apex] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="grid size-12 place-items-center rounded-xl border border-border bg-card text-[hsl(var(--short))]">
        <AlertTriangle className="size-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">That signal didn&apos;t load</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Something went wrong while computing this view. Try again — the engine is deterministic, so a
          retry usually clears it.
        </p>
      </div>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
