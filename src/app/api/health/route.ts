import { apiOk } from "@/lib/api";
import { ruflo } from "@/lib/integrations/ruflo";
import { higgsfield } from "@/lib/integrations/higgsfield";
import { getRunLog } from "@/lib/integrations/run-log";
import { isSupabaseConfigured } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/health — integration connectivity + last run/generation. */
export async function GET(): Promise<Response> {
  const rs = ruflo.status();
  const hs = higgsfield.status();
  const log = getRunLog();
  return apiOk({
    status: "operational",
    time: new Date().toISOString(),
    dataMode: process.env.APEX_DATA_MODE ?? "mock",
    higgsfield: {
      connected: hs.connected,
      note: hs.note,
      lastGeneration: log.higgsfieldLast,
    },
    ruflo: {
      connected: rs.connected,
      mode: rs.mode,
      workflows: rs.workflows,
      lastRun: log.rufloLast,
      runs: log.ruflo,
    },
    supabase: { configured: isSupabaseConfigured },
  });
}
