# Scene Assets — Higgsfield drop-in slots

Run the Higgsfield skills with the prompts in `lib/higgsfield-prompts.ts` and
save the generated files here using these exact names. Components load them
automatically and fall back to the live Canvas/CSS visuals when a file is
missing — so the site is always complete, with or without assets.

| File | Skill | Scene |
|------|-------|-------|
| `01-cell.webp` | /higgsfield-generate | 1 — The Beginning |
| `02-dna.webp` | /higgsfield-generate | 2 — DNA of Wellness |
| `03-bloodstream.webp` | /higgsfield-generate | 3 — Root Cause |
| `04-hormones.webp` | /higgsfield-generate | 4 — Hormonal Balance |
| `05-longevity.webp` | /higgsfield-generate | 5 — Longevity |
| `06-doors.webp` | /higgsfield-generate | 6 — Transformation |
| `07-reception.webp` `07-consult.webp` `07-office.webp` `07-treatment.webp` | /higgsfield-generate | 7 — The Experience |
| `08-alma-ted.webp` `08-alma-harmony.webp` `08-weightloss.webp` `08-concierge.webp` | /higgsfield-product-photoshoot + /higgsfield-marketplace-cards | 8 — Treatments |
| `09-dr-matilsky.webp` | /higgsfield-soul-id | Final — Dr. Merna Matilsky |

**Tip:** export with transparent or soft-faded edges. The CSS masks
(`blend-image`, `blend-device`, `blend-soft`) feather every asset so nothing
ever reads as a hard rectangle or floating box.
