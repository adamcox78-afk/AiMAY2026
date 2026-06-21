"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Clapperboard,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/signals", label: "Signals", icon: Gauge },
  { href: "/watchlist", label: "Watchlist", icon: ListChecks },
  { href: "/performance", label: "Track Record", icon: BarChart3 },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/briefings", label: "Briefings", icon: Clapperboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();
  return (
    <nav
      className={cn(
        variant === "sidebar" ? "flex flex-col gap-1" : "flex gap-1 overflow-x-auto pb-1"
      )}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
      {variant === "sidebar" && (
        <Link
          href="/pricing"
          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <Sparkles className="size-4" />
          Pricing
        </Link>
      )}
    </nav>
  );
}
