import { Info } from "lucide-react";
import { DISCLAIMER, DISCLAIMER_SHORT } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Compliance disclaimer — shown across the product per requirements. */
export function DisclaimerBar({ full = false, className }: { full?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground",
        className
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <p>{full ? DISCLAIMER : DISCLAIMER_SHORT}</p>
    </div>
  );
}
