'use client';

// Subtle animated film grain for cinematic texture.
// Rendered as a fixed overlay above all scenes (see .grain in globals.css).
export default function Grain() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 z-[55]" />;
}
