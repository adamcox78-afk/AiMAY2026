/**
 * Scene Asset Generator
 * ---------------------------------------------------------------------------
 * Generates all scene images using the OpenAI Images API (gpt-image-1)
 * and saves them to public/scenes/ with the exact filenames the site expects.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-scenes.mjs
 *
 * Options (env vars):
 *   OPENAI_API_KEY   — required
 *   SCENES           — comma-separated scene numbers to (re-)generate, e.g. "1,3,9"
 *                      omit to generate all
 *   SIZE             — 1024x1024 | 1536x1024 | 1024x1536 (default: 1536x1024)
 *   QUALITY          — low | medium | high (default: high)
 *   DRY_RUN          — set to "1" to print prompts without calling the API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'scenes');

// ── Prompts (inlined so the script is self-contained) ─────────────────────

const GLOBAL_STYLE =
  'warm cinematic color grade, soft champagne-gold rim light, frosted glass ambience, ' +
  'natural greens and subtle technology blues, shallow depth of field, photoreal, 8k, ' +
  'no text, no watermark, seamless edges fading to transparent, no visible frame or background box';

const ASSETS = [
  {
    index: 1,
    scene: 'Scene 1 — The Beginning',
    output: '01-cell.webp',
    prompt:
      'A single luminous human cell suspended in deep black void, translucent membrane catching faint golden light, ' +
      'glowing nucleus within, microscopic clarity, drifting softly, hopeful and alive. ' + GLOBAL_STYLE,
  },
  {
    index: 2,
    scene: 'Scene 2 — DNA of Wellness',
    output: '02-dna.webp',
    prompt:
      'An elegant DNA double helix made of softly glowing strands, base pairs illuminating one by one in champagne gold ' +
      'and glacier blue, floating data points and gene markers, travelling through the helix interior, refined and ' +
      'scientific yet warm. ' + GLOBAL_STYLE,
  },
  {
    index: 3,
    scene: 'Scene 3 — Root Cause Medicine',
    output: '03-bloodstream.webp',
    prompt:
      'Inside a healthy human bloodstream, smooth red blood cells gliding, glowing oxygen molecules, soft cellular ' +
      'communication signals like fireflies, calm reduced-inflammation environment, warm light filtering through plasma. ' +
      GLOBAL_STYLE,
  },
  {
    index: 4,
    scene: 'Scene 4 — Hormonal Balance',
    output: '04-hormones.webp',
    prompt:
      'Abstract endocrine signaling pathways, golden hormone molecules travelling along glowing neural-like networks, ' +
      'restoring balance and symmetry, waves of renewed energy radiating outward, serene and vital. ' + GLOBAL_STYLE,
  },
  {
    index: 5,
    scene: 'Scene 5 — Longevity',
    output: '05-longevity.webp',
    prompt:
      'Cellular regeneration blooming into vibrant healthy aging — a montage feel of strength, cognitive clarity and ' +
      'vitality, golden cellular light blossoming, graceful and powerful, radiant wellbeing, ages 50-70 thriving. ' +
      GLOBAL_STYLE,
  },
  {
    index: 6,
    scene: 'Scene 6 — Transformation',
    output: '06-doors.webp',
    prompt:
      'Tall elegant frosted glass doors with brushed champagne-gold handles, warm light glowing from behind, doors ' +
      'beginning to open into brightness, light ribbons dissolving into the opening. ' + GLOBAL_STYLE,
  },
  {
    index: 7,
    scene: 'Scene 7 — Reception',
    output: '07-reception.webp',
    prompt:
      'Luxurious wellness center reception — warm white walls, soft beige textiles, frosted glass partitions, natural ' +
      'greenery, champagne-gold details, soft daylight, Four Seasons spa meets modern longevity institute, clean but ' +
      'not clinical, trustworthy and high-end. ' + GLOBAL_STYLE,
  },
  {
    index: 8,
    scene: 'Scene 7b — Consultation',
    output: '07-consult.webp',
    prompt:
      'A serene wellness consultation room, two soft chairs by a window with soft daylight, plants, warm wood and ' +
      'frosted glass, calm and personal, high-end residential feel, no clinical equipment visible. ' + GLOBAL_STYLE,
  },
  {
    index: 9,
    scene: 'Scene 7c — Treatment Suite',
    output: '07-treatment.webp',
    prompt:
      'A premium medical treatment suite, reclining chair, soft directional lighting, frosted glass walls, no harsh ' +
      'clinical feel, champagne and sage palette, luxury spa-medicine hybrid space. ' + GLOBAL_STYLE,
  },
  {
    index: 10,
    scene: 'Scene 8 — Alma TED Device',
    output: '08-alma-ted.webp',
    prompt:
      'The Alma TED hair restoration device photographed as a premium product hero, floating on a warm gradient of ' +
      'ivory and champagne, soft studio rim light, luxury tech aesthetic, edges blending seamlessly into background ' +
      'with no visible box. ' + GLOBAL_STYLE,
  },
  {
    index: 11,
    scene: 'Scene 8 — Alma Harmony Device',
    output: '08-alma-harmony.webp',
    prompt:
      'An elegant medical laser skin rejuvenation device as a product hero, on a soft beige-to-glacier-blue gradient, ' +
      'champagne-gold rim light, longevity-medicine sophistication, seamless blended edges, no background box. ' +
      GLOBAL_STYLE,
  },
  {
    index: 12,
    scene: 'Scene 8 — Weight Loss Program',
    output: '08-weightloss.webp',
    prompt:
      'Abstract visual representing medical weight loss — a glowing metabolic network, warm golden light, human ' +
      'silhouette transforming, elegant and empowering, never clinical or diet-cliché. ' + GLOBAL_STYLE,
  },
  {
    index: 13,
    scene: 'Final — Dr. Matilsky',
    output: '09-dr-matilsky.webp',
    prompt:
      'Warm, professional portrait of a female physician, Dr. Merna Matilsky, seated in soft natural light, gentle ' +
      'confident eye contact, approachable and trustworthy, elegant wellness office bokeh behind, champagne and sage ' +
      'palette, photoreal. ' + GLOBAL_STYLE,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, options, retries = 3, backoff = 4000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status >= 500) {
        const wait = backoff * attempt;
        console.log(`  ⚠ HTTP ${res.status} — retrying in ${wait / 1000}s (attempt ${attempt}/${retries})`);
        await sleep(wait);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(backoff * attempt);
    }
  }
}

async function generateImage({ prompt, size, quality, apiKey }) {
  const body = JSON.stringify({
    model: 'gpt-image-1',
    prompt,
    n: 1,
    size,
    quality,
    output_format: 'webp',
  });

  const res = await fetchWithRetry('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  // gpt-image-1 returns base64 by default
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image data in response: ' + JSON.stringify(json));
  return Buffer.from(b64, 'base64');
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const dryRun = process.env.DRY_RUN === '1';
  const size = process.env.SIZE || '1536x1024';
  const quality = process.env.QUALITY || 'high';
  const onlyScenes = process.env.SCENES
    ? new Set(process.env.SCENES.split(',').map((s) => parseInt(s.trim(), 10)))
    : null;

  if (!apiKey && !dryRun) {
    console.error('❌  OPENAI_API_KEY is required. Set it and re-run:\n\n  OPENAI_API_KEY=sk-... node scripts/generate-scenes.mjs\n');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const targets = onlyScenes ? ASSETS.filter((a) => onlyScenes.has(a.index)) : ASSETS;

  console.log(`\n🎬  Boca Center Scene Generator`);
  console.log(`   Model  : gpt-image-1`);
  console.log(`   Size   : ${size}`);
  console.log(`   Quality: ${quality}`);
  console.log(`   Output : public/scenes/`);
  console.log(`   Assets : ${targets.length} of ${ASSETS.length}\n`);

  for (const asset of targets) {
    const outPath = path.join(OUT_DIR, asset.output);

    if (fs.existsSync(outPath)) {
      console.log(`⏭  [${asset.index}/${ASSETS.length}] ${asset.scene} — already exists, skipping`);
      continue;
    }

    console.log(`🎨  [${asset.index}/${ASSETS.length}] ${asset.scene}`);

    if (dryRun) {
      console.log(`   PROMPT: ${asset.prompt.slice(0, 120)}...\n`);
      continue;
    }

    try {
      const imageBuffer = await generateImage({ prompt: asset.prompt, size, quality, apiKey });
      fs.writeFileSync(outPath, imageBuffer);
      console.log(`   ✓ Saved → public/scenes/${asset.output}`);
    } catch (err) {
      console.error(`   ✗ Failed: ${err.message}`);
    }

    // Brief pause between requests to respect rate limits
    if (asset.index < targets.length) await sleep(1500);
  }

  console.log('\n✅  Done. Refresh the dev server to see the new assets.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
