"use client";

import { motion } from "framer-motion";
import type { ScenePalette } from "@/lib/scenes";
import { useMotionPreference } from "@/lib/useMotionPreference";

/**
 * Procedural "living" ambient layer — the premium stand-in rendered
 * whenever a Higgsfield asset has not yet been generated. Layered,
 * slowly drifting radial-gradient glow orbs in the scene palette.
 * Never a gray box: it reads as intentional cinematic atmosphere.
 */
export default function AmbientLayer({
  palette,
  className = "",
}: {
  palette: ScenePalette;
  className?: string;
}) {
  const { reduced } = useMotionPreference();
  const [base, glow, accent] = palette;

  const orbs = [
    {
      size: "120%",
      x: "-10%",
      y: "-5%",
      color: glow,
      opacity: 0.5,
      dur: 26,
      drift: 40,
    },
    {
      size: "85%",
      x: "45%",
      y: "30%",
      color: accent,
      opacity: 0.35,
      dur: 34,
      drift: -55,
    },
    {
      size: "70%",
      x: "10%",
      y: "55%",
      color: glow,
      opacity: 0.28,
      dur: 41,
      drift: 35,
    },
  ];

  return (
    <div
      aria-hidden
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background: `radial-gradient(ellipse at 50% 55%, ${base} 0%, transparent 75%)` }}
    >
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.size,
            aspectRatio: "1 / 1",
            left: o.x,
            top: o.y,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 62%)`,
            opacity: o.opacity,
            filter: "blur(40px)",
          }}
          animate={
            reduced
              ? undefined
              : {
                  x: [0, o.drift, 0],
                  y: [0, -o.drift * 0.6, 0],
                  scale: [1, 1.12, 1],
                }
          }
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* fine luminous grain veil to avoid flat gradients */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, ${accent} 0%, transparent 8%), radial-gradient(circle at 75% 60%, ${glow} 0%, transparent 6%), radial-gradient(circle at 55% 20%, ${accent} 0%, transparent 5%)`,
          filter: "blur(18px)",
        }}
      />
    </div>
  );
}
