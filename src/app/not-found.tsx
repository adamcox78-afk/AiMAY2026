import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="absolute inset-0 apex-grid opacity-30" />
      <div className="absolute inset-0 apex-glow" />
      <div className="relative">
        <Logo className="justify-center" />
        <h1 className="mt-8 stat-mono text-6xl font-semibold text-foreground">404</h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          This signal doesn&apos;t exist — or it already played out. Let&apos;s get you back to the action.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
