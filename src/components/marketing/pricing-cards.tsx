import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/config";
import { cn } from "@/lib/utils";

export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLANS.map((plan) => (
        <Card
          key={plan.tier}
          className={cn(
            "relative flex flex-col",
            plan.highlighted && "border-primary/50 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.5)]"
          )}
        >
          {plan.highlighted && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
          )}
          <CardContent className="flex flex-1 flex-col p-6">
            <div className="text-sm font-medium text-muted-foreground">{plan.name}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight text-foreground">${plan.priceMonthly}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>

            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant={plan.highlighted ? "default" : "outline"}
              className="mt-6 w-full"
            >
              <Link href="/dashboard">
                {plan.tier === "free" ? "Start free" : `Choose ${plan.name}`}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
