import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden="true">
      <defs>
        <linearGradient id="apexGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(187 92% 56%)" />
          <stop offset="100%" stopColor="hsl(265 80% 62%)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="hsl(222 24% 9%)" stroke="hsl(220 16% 20%)" />
      {/* Upward signal peak */}
      <path
        d="M6 22 L13 12 L18 18 L26 7"
        fill="none"
        stroke="url(#apexGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26" cy="7" r="2.4" fill="hsl(187 92% 56%)" />
    </svg>
  );
}

export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {showWord && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Apex<span className="text-primary">Signal</span>
        </span>
      )}
    </span>
  );
}
