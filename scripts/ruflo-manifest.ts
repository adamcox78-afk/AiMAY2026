/**
 * Prints the Ruflo workflow manifest (cron schedule + endpoints) as JSON to
 * stdout, and a curl cheat-sheet to stderr. Pipe stdout into the Ruflo daemon to
 * register the schedule:
 *
 *   npm run ruflo:manifest > config/ruflo/workflows.json
 *   npx ruflo schedule import config/ruflo/workflows.json
 */

import { RUFLO_WORKFLOWS } from "../src/lib/integrations/ruflo";

const base = process.env.RUFLO_BASE_URL ?? "http://localhost:3000";

process.stdout.write(JSON.stringify(RUFLO_WORKFLOWS, null, 2) + "\n");

process.stderr.write("\n# Apex Signal — Ruflo workflow registrations\n");
for (const w of RUFLO_WORKFLOWS) {
  process.stderr.write(`\n# ${w.name}  [cron: ${w.schedule}]\n# ${w.description}\n`);
  process.stderr.write(
    `curl -X POST ${base}${w.endpoint} -H "x-ruflo-secret: $RUFLO_WEBHOOK_SECRET"\n`
  );
}
