import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { DISCLAIMER } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Probability intelligence for modern markets. Stop decoding markets — get the signal.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div className="space-y-2">
              <div className="font-medium text-foreground">Product</div>
              <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground">Dashboard</Link>
              <Link href="/signals" className="block text-muted-foreground hover:text-foreground">Signals</Link>
              <Link href="/performance" className="block text-muted-foreground hover:text-foreground">Track Record</Link>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-foreground">Company</div>
              <Link href="/pricing" className="block text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link href="/#features" className="block text-muted-foreground hover:text-foreground">Features</Link>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-foreground">Legal</div>
              <span className="block text-muted-foreground">Terms</span>
              <span className="block text-muted-foreground">Privacy</span>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Apex Signal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
