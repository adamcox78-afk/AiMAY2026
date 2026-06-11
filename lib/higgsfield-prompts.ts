/**
 * HIGGSFIELD PROMPT REGISTRY
 * ---------------------------------------------------------------------------
 * Every scene below has a production-ready prompt for the corresponding
 * Higgsfield skill. When you run the skills locally, generate the asset and
 * drop it into the indicated `/public/scenes/...` path — the components read
 * from those paths automatically and gracefully fall back to the live
 * CSS/Canvas visuals when an asset is absent.
 *
 * Skills mapped:
 *   • /higgsfield-generate            → cinematic scene visuals & B-roll
 *   • /higgsfield-product-photoshoot  → Alma devices, on transparent/blended bg
 *   • /higgsfield-marketplace-cards   → treatment & program cards
 *   • /higgsfield-soul-id             → Dr. Merna Matilsky consistent portrait
 *
 * GLOBAL STYLE TOKEN (append to every prompt):
 *   "warm cinematic color grade, soft champagne-gold rim light, frosted glass
 *    ambience, natural greens, technology-inspired blues, shallow depth of
 *    field, photoreal, 8k, no text, no watermark, no harsh clinical lighting,
 *    seamless edges fading to transparent, no visible frame or background box"
 */

export const GLOBAL_STYLE =
  'warm cinematic color grade, soft champagne-gold rim light, frosted glass ambience, natural greens and subtle technology blues, shallow depth of field, photoreal, 8k, no text, no watermark, seamless edges fading to transparent, no visible frame or background box';

export type HiggsfieldAsset = {
  scene: string;
  skill:
    | 'higgsfield-generate'
    | 'higgsfield-product-photoshoot'
    | 'higgsfield-marketplace-cards'
    | 'higgsfield-soul-id';
  output: string; // suggested /public path
  prompt: string;
  motion?: string; // optional camera / animation direction for video gen
};

export const PROMPTS: HiggsfieldAsset[] = [
  {
    scene: 'Scene 1 — The Beginning',
    skill: 'higgsfield-generate',
    output: '/scenes/01-cell.webp',
    prompt:
      'A single luminous human cell suspended in deep black void, translucent membrane catching faint golden light, glowing nucleus within, microscopic clarity, drifting softly, hopeful and alive. ' +
      GLOBAL_STYLE,
    motion:
      'Slow dolly push toward the cell, gentle pulsing glow synced to a heartbeat, near-black surroundings.',
  },
  {
    scene: 'Scene 2 — DNA of Wellness',
    skill: 'higgsfield-generate',
    output: '/scenes/02-dna.webp',
    prompt:
      'An elegant DNA double helix made of softly glowing strands, base pairs illuminating one by one in champagne gold and glacier blue, floating data points and gene markers, travelling through the helix interior, refined and scientific yet warm. ' +
      GLOBAL_STYLE,
    motion: 'First-person travel along the axis of the helix, genes light up as we pass.',
  },
  {
    scene: 'Scene 3 — Root Cause Medicine',
    skill: 'higgsfield-generate',
    output: '/scenes/03-bloodstream.webp',
    prompt:
      'Inside a healthy human bloodstream, smooth red blood cells gliding, glowing oxygen molecules, soft cellular communication signals like fireflies, calm reduced-inflammation environment, warm light filtering through plasma. ' +
      GLOBAL_STYLE,
    motion: 'Floating forward through the vessel, particles streaming past camera.',
  },
  {
    scene: 'Scene 4 — Hormonal Balance',
    skill: 'higgsfield-generate',
    output: '/scenes/04-hormones.webp',
    prompt:
      'Abstract endocrine signaling pathways, golden hormone molecules travelling along glowing neural-like networks, restoring balance and symmetry, waves of renewed energy radiating outward, serene and vital. ' +
      GLOBAL_STYLE,
    motion: 'Gliding through branching pathways, pulses of gold light restoring equilibrium.',
  },
  {
    scene: 'Scene 5 — Longevity',
    skill: 'higgsfield-generate',
    output: '/scenes/05-longevity.webp',
    prompt:
      'Cellular regeneration blooming into vibrant healthy aging — a montage feel of strength, cognitive clarity and vitality, golden cellular light blossoming, graceful and powerful, radiant wellbeing, ages 50-70 thriving. ' +
      GLOBAL_STYLE,
    motion: 'Cells regenerate and bloom outward, dissolving into warm light.',
  },
  {
    scene: 'Scene 6 — Transformation',
    skill: 'higgsfield-generate',
    output: '/scenes/06-doors.webp',
    prompt:
      'DNA strands dissolving into flowing ribbons of light that coalesce, then tall elegant frosted glass doors with brushed champagne-gold handles, warm light glowing from behind, doors beginning to open into brightness. ' +
      GLOBAL_STYLE,
    motion: 'Light ribbons swirl and form doors; camera approaches; doors slowly part revealing light.',
  },
  {
    scene: 'Scene 7 — The Boca Experience (Reception)',
    skill: 'higgsfield-generate',
    output: '/scenes/07-reception.webp',
    prompt:
      'First-person walk into a luxurious wellness center reception — warm white walls, soft beige textiles, frosted glass partitions, natural greenery, champagne-gold details, soft daylight, Four Seasons spa meets modern longevity institute, clean but not clinical, trustworthy and high-end. ' +
      GLOBAL_STYLE,
    motion: 'Smooth first-person glide through reception toward consultation spaces.',
  },
  {
    scene: 'Scene 7b — Consultation Space',
    skill: 'higgsfield-generate',
    output: '/scenes/07-consult.webp',
    prompt:
      'A serene wellness consultation room, two soft chairs by a window with soft daylight, plants, warm wood and frosted glass, calm and personal, high-end residential feel, no clinical equipment visible. ' +
      GLOBAL_STYLE,
  },
  {
    scene: 'Scene 8 — Alma TED Hair Restoration',
    skill: 'higgsfield-product-photoshoot',
    output: '/scenes/08-alma-ted.webp',
    prompt:
      'The Alma TED hair restoration device photographed as a premium product, floating on a warm gradient of ivory and champagne, soft studio rim light, luxury tech aesthetic, edges blending seamlessly into background with no visible box. ' +
      GLOBAL_STYLE,
  },
  {
    scene: 'Scene 8 — Alma Harmony Skin Rejuvenation',
    skill: 'higgsfield-product-photoshoot',
    output: '/scenes/08-alma-harmony.webp',
    prompt:
      'The Alma Harmony skin rejuvenation laser system as an elegant product hero, on a soft beige-to-glacier-blue gradient, champagne-gold rim light, longevity-medicine sophistication, seamless blended edges, no background box. ' +
      GLOBAL_STYLE,
  },
  {
    scene: 'Scene 8 — Concierge / Weight Loss program cards',
    skill: 'higgsfield-marketplace-cards',
    output: '/scenes/08-cards/*.webp',
    prompt:
      'A set of refined wellness program cards — Medical Weight Loss, Concierge Medicine, Skin Rejuvenation, Hair Restoration — minimal luxe layout, warm white and champagne, abstract elegant imagery, longevity-medicine tone, never med-spa cliché. ' +
      GLOBAL_STYLE,
  },
  {
    scene: 'Final Scene — Dr. Merna Matilsky',
    skill: 'higgsfield-soul-id',
    output: '/scenes/09-dr-matilsky.webp',
    prompt:
      'Warm, professional portrait of Dr. Merna Matilsky seated across from the viewer in soft natural light, gentle confident eye contact, approachable and trustworthy, elegant wellness office bokeh behind, champagne and sage palette, photoreal Soul ID consistency. ' +
      GLOBAL_STYLE,
    motion: 'Subtle, almost-still — slow breath, warm blink, natural light shifting gently.',
  },
];

export default PROMPTS;
