import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AppNav } from "./app-nav";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card/40 px-3 py-4 lg:flex">
      <Link href="/" className="px-2 py-1">
        <Logo />
      </Link>

      <div className="mt-6 flex-1">
        <AppNav variant="sidebar" />
      </div>

      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-4">
        <p className="text-sm font-semibold text-foreground">Go Elite</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Unlimited signals, prediction-market intelligence, and AI briefings.
        </p>
        <Button asChild size="sm" className="mt-3 w-full">
          <Link href="/pricing">Upgrade</Link>
        </Button>
      </div>
    </aside>
  );
}
