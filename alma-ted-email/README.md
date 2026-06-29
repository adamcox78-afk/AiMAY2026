# Alma TED® — Before & After Email Template

An Outlook-compatible HTML email featuring Alma TED before/after results,
an explanation of the sonophoresis technology, and curated resource links
(official Alma pages, the science behind it, and peer-reviewed white papers).

## Files

```
alma-ted-email/
├── alma-ted-before-after.html   ← the email template (open / send this)
├── README.md                    ← this file
└── images/
    ├── alma-logo.png            ← Alma logo (already included, used in header & footer)
    └── before-after/            ← DROP YOUR 5 BEFORE/AFTER PHOTOS HERE
```

## ⚠️ Add the before/after photos

Your before/after photos came through as chat images, not files, so they
could not be embedded automatically. Save each one into
`images/before-after/` using the **exact filenames** the template expects.
Each of your shots is already a side-by-side before/after composite, so it's
one file per slot:

| Filename | Your photo |
|----------|-----------|
| `01-crown-density-x4.jpg` | Back-of-head crown/part, "Before TED / After TED x4" (green curtain) |
| `02-hairline-frontal-x4.jpg` | Woman holding hair at temples, frontal hairline, "Before TED / After TED x4" |
| `03-frontal-coverage.jpg` | "Hair Growth Laser — ALMA TED" frontal coverage, BEFORE / AFTER |
| `04-crown-after-1-treatment.jpg` | Crown shot, "After 1 TED Treatment", Before / After |
| `05-part-line-density.jpg` | Top-of-head part line, before / after density |

Notes:
- Use `.jpg` (smaller, best for photos). If you prefer PNG, change the
  `src="..."` extensions in the HTML to match.
- Recommended width: **1080px** (the template displays them at up to 540px,
  so 2x keeps them crisp on retina screens).
- To add or remove a result, copy/edit one of the `<!-- B&A n -->` blocks
  in the HTML.

## Sending it (Outlook-compatible)

The template uses table-based layout, inline CSS, and MSO/VML buttons so it
renders correctly in Outlook (desktop + web), Gmail, Apple Mail, and mobile.

For images to display in the recipient's inbox, they must load from a
**public URL** — email clients can't read local files. Two options:

1. **Email platform (recommended):** Import `alma-ted-before-after.html` into
   Mailchimp / Constant Contact / HubSpot, etc. Upload the images from
   `images/` into the platform's media library; it rewrites the `src` paths
   to hosted URLs automatically.
2. **Self-host:** Upload the `images/` folder to your web server/CDN and
   replace the relative `src="images/..."` paths with the full
   `https://yourdomain.com/images/...` URLs.

To preview locally, just open `alma-ted-before-after.html` in a browser from
this folder (relative paths resolve on disk).

## Resource links included

**Official — Alma Lasers**
- Alma TED® product page — https://almainc.com/product/alma-ted/
- Alma Lasers home — https://almainc.com/

**The science — sonophoresis**
- How Alma TED works (two-stage ultrasound mechanism) — https://charlesmedicalgroup.com/plastic-surgery/alma-ted-hair-restoration-non-surgical-how-it-works/
- Non-invasive option for hair thinning (Bernstein Medical) — https://www.bernsteinmedical.com/news/a-new-non-invasive-option-for-hair-thinning-introducing-alma-ted-at-bernstein-medical/

**White papers & peer-reviewed research**
- Low-Frequency Sonophoresis review (MIT/Langer, NIH PMC) — https://pmc.ncbi.nlm.nih.gov/articles/PMC3050019/
- Low-Frequency Sonophoresis: A Promising Strategy (2024, Wiley) — https://onlinelibrary.wiley.com/doi/abs/10.1155/2024/1247450
- Ultrasound-Enhanced Transdermal Delivery (NIH PMC) — https://pmc.ncbi.nlm.nih.gov/articles/PMC4725305/

## Clinical stats shown in the email

From Alma TED® clinical evaluation (N=50, three treatments):
**96%** noted increased hair growth · **98%** reported reduced shedding ·
**89%** observed improved density · **100%** patient satisfaction.

> Before customizing claims, confirm the exact figures against Alma's current
> clinical documentation, and keep the "individual results vary" disclaimer.
