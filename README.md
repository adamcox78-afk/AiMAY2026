# Boca Center for Healthy Living — A Cinematic Wellness Experience

> Health begins beneath the surface.

An immersive, scroll-driven journey for **[bocamed.com](https://www.bocamed.com)** —
positioning the Boca Center for Healthy Living as South Florida's premier
destination for functional, longevity, hormone-optimization, preventive, and
aesthetic wellness medicine.

This is **not** a medical office website. It is a transformational experience —
Apple keynote pacing, Mayo Clinic credibility, Four Seasons warmth, modern
longevity-institute science.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — warm whites, soft beige, frosted glass, natural greens,
  champagne gold, technology blues
- **Framer Motion** — scene reveals, parallax, scroll-linked transforms
- **GSAP ScrollTrigger** — synced to the scroll engine
- **Lenis** — buttery smooth scroll
- **Canvas visuals** — live cell, DNA helix, and particle-flow fields that run
  with zero external assets

## The Scroll Journey

| Act | Scene | Visual |
|-----|-------|--------|
| I | The Beginning — a single cell illuminates | `CellCanvas` heartbeat |
| II | DNA of Wellness — genes light as you scroll | `DnaCanvas` |
| III | Root Cause Medicine — into the bloodstream | `FlowCanvas` (blood) |
| IV | Hormonal Balance — endocrine pathways | `FlowCanvas` (hormone) |
| V | Longevity — cellular regeneration | `FlowCanvas` (longevity) |
| VI | Transformation — frosted glass doors open | `GlassDoors` |
| VII | The Boca Experience — inside the facility | blended space gallery |
| VIII | Advanced Treatments — Alma TED, Harmony, more | product/marketplace cards |
| ◆ | Final — Dr. Merna Matilsky & your invitation | Soul ID portrait + CTAs |

## Higgsfield Integration

Every scene has a production-ready prompt in
[`lib/higgsfield-prompts.ts`](lib/higgsfield-prompts.ts), mapped to the four
skills (`/higgsfield-generate`, `/higgsfield-product-photoshoot`,
`/higgsfield-marketplace-cards`, `/higgsfield-soul-id`).

Generate the assets, drop them into [`public/scenes/`](public/scenes/README.md)
with the documented names, and they layer in automatically. Until then, the
live Canvas/CSS visuals carry every scene — the site is never broken or empty.

### The "no boxes, no backgrounds" rule

Every image renders through CSS mask blends (`blend-image`, `blend-device`,
`blend-soft`) plus `mix-blend-mode`, so devices and photos feather seamlessly
into the scene — no hard rectangles, no floating cards-with-backgrounds.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Contact

Boca Center for Healthy Living · 2900 N Military Trail, Suite 245, Boca Raton, FL 33431 · (561) 994-2007
