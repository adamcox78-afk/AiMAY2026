#!/usr/bin/env node
/**
 * Apex Signal — Ruflo workflow manifest generator.
 *
 * Prints the cron manifest (JSON to stdout) + a curl cheat-sheet (to stderr) and
 * writes config/ruflo/workflows.json for the Ruflo daemon to import. Mirrors
 * src/lib/integrations/ruflo/workflows.ts (kept in sync intentionally — this file
 * is dependency-free so `node scripts/ruflo-manifest.js` works without a build).
 *
 *   npm run ruflo:manifest
 *   npx ruflo schedule import config/ruflo/workflows.json
 */

const fs = require("node:fs");
const path = require("node:path");

const base =
  process.env.NEXT_PUBLIC_APP_URL || process.env.RUFLO_BASE_URL || "http://localhost:3000";

const WORKFLOWS = [
  { id: "market-scan", name: "Market Scan", schedule: "*/15 * * * *", endpoint: "/api/ruflo/scan-market", description: "Every 15 min: scan the core universe, generate & store signals." },
  { id: "watchlist-scan", name: "Watchlist Scan", schedule: "*/5 * * * *", endpoint: "/api/ruflo/scan-watchlist", description: "Every 5 min: re-scan each user's watchlist assets." },
  { id: "confidence-alert", name: "Confidence Alert", schedule: "*/15 * * * *", endpoint: "/api/ruflo/send-alert", description: "Alert when a signal's confidence exceeds 72%." },
  { id: "prediction-market-alert", name: "Prediction Market Alert", schedule: "*/15 * * * *", endpoint: "/api/ruflo/send-alert", description: "Alert when Polymarket/Kalshi odds move more than 7%." },
  { id: "signal-outcome-logger", name: "Signal Outcome Logger", schedule: "0 * * * *", endpoint: "/api/ruflo/log-result", description: "Hourly: mark resolved signals won / lost / invalidated." },
  { id: "daily-performance-report", name: "Daily Performance Report", schedule: "0 22 * * *", endpoint: "/api/ruflo/daily-report", description: "Daily: win rate, best/worst signals, long vs short performance." },
  { id: "media-briefing", name: "Daily Media Briefing", schedule: "0 13 * * *", endpoint: "/api/ruflo/media-briefing", description: "Daily: trigger Higgsfield to render the 60-second market briefing." },
  { id: "lead-followup", name: "Lead Follow-ups", schedule: "0 16 * * *", endpoint: "/api/ruflo/lead-followup", description: "Daily: personalized follow-ups for trials, upgrades, and re-engagement." },
];

const outDir = path.join(process.cwd(), "config", "ruflo");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "workflows.json"), JSON.stringify(WORKFLOWS, null, 2) + "\n");

process.stdout.write(JSON.stringify(WORKFLOWS, null, 2) + "\n");

process.stderr.write("\n# Apex Signal — Ruflo workflow registrations\n");
process.stderr.write(`# Wrote config/ruflo/workflows.json (${WORKFLOWS.length} workflows)\n`);
for (const w of WORKFLOWS) {
  process.stderr.write(`\n# ${w.name}  [cron: ${w.schedule}]\n# ${w.description}\n`);
  process.stderr.write(`curl -X POST ${base}${w.endpoint} -H "x-ruflo-secret: $RUFLO_WEBHOOK_SECRET"\n`);
}
