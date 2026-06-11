"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Central motion-preference hook. When the visitor prefers reduced
 * motion we disable parallax, drift loops and scale choreography —
 * content still crossfades gently via opacity only.
 */
export function useMotionPreference() {
  const reduced = useReducedMotion();
  return { reduced: !!reduced, parallaxEnabled: !reduced };
}
