export type ScenePalette = [string, string, string];

/**
 * Scene-by-scene art direction. The journey moves from pure black
 * (the unseen interior of the body) to radiant warm white (vitality).
 */
export const sceneConfig = {
  1: {
    eyebrow: "The Beginning",
    palette: ["#1a0f02", "#c9a86a", "#1c3a3a"] as ScenePalette,
    bg: "#000000",
  },
  2: {
    eyebrow: "DNA & Root Cause",
    palette: ["#0a0b1e", "#c9a86a", "#2b2f6e"] as ScenePalette,
    bg: "#04050e",
  },
  3: {
    eyebrow: "Inside the Body",
    palette: ["#1c0508", "#b3442f", "#e08f5f"] as ScenePalette,
    bg: "#0d0407",
  },
  4: {
    eyebrow: "Hormone Optimization",
    palette: ["#181004", "#d9a441", "#f0d9a8"] as ScenePalette,
    bg: "#120c04",
  },
  5: {
    eyebrow: "Medical Weight Loss",
    palette: ["#241420", "#d97f5f", "#f2c9a8"] as ScenePalette,
    bg: "#1d1420",
  },
  6: {
    eyebrow: "Longevity Medicine",
    palette: ["#33312a", "#9fae8e", "#e9dcb8"] as ScenePalette,
    bg: "#37352d",
  },
  7: {
    eyebrow: "Regenerative Therapies",
    palette: ["#575043", "#d8c3a5", "#f3e7d3"] as ScenePalette,
    bg: "#59523f",
  },
  8: {
    eyebrow: "Enter Boca Center",
    palette: ["#c2b49a", "#e8d9bd", "#fdf6e8"] as ScenePalette,
    bg: "#c8bba2",
  },
  9: {
    eyebrow: "Meet Dr. Merna Matilsky",
    palette: ["#e3d8c4", "#f2e6cf", "#fffaf0"] as ScenePalette,
    bg: "#e9e0cd",
  },
  10: {
    eyebrow: "Your Journey Begins",
    palette: ["#f6efe1", "#fdf8ec", "#ffffff"] as ScenePalette,
    bg: "#faf7f1",
  },
} as const;

/** Background color stops across the whole page (0 → 1 scroll). */
export const bgStops: { at: number; color: string }[] = [
  { at: 0, color: "#000000" },
  { at: 0.1, color: "#04050e" },
  { at: 0.2, color: "#0d0407" },
  { at: 0.31, color: "#120c04" },
  { at: 0.42, color: "#1d1420" },
  { at: 0.53, color: "#37352d" },
  { at: 0.64, color: "#59523f" },
  { at: 0.76, color: "#c8bba2" },
  { at: 0.88, color: "#e9e0cd" },
  { at: 1, color: "#faf7f1" },
];

export const PHONE_DISPLAY = "(561) 994-2007";
export const PHONE_TEL = "tel:+15619942007";
