import { ArrowDownRight, ArrowUpRight, PauseCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SignalDirection } from "@/lib/types";

const MAP = {
  LONG: { variant: "long" as const, icon: ArrowUpRight, label: "LONG" },
  SHORT: { variant: "short" as const, icon: ArrowDownRight, label: "SHORT" },
  WAIT: { variant: "wait" as const, icon: PauseCircle, label: "WAIT" },
};

export function SignalBadge({
  direction,
  className,
  size = "default",
}: {
  direction: SignalDirection;
  className?: string;
  size?: "sm" | "default";
}) {
  const { variant, icon: Icon, label } = MAP[direction];
  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1 font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-sm",
        className
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {label}
    </Badge>
  );
}
