"use client";

import { motion, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Typographic system for scene copy: tracking-wide eyebrow,
 * large serif headline, restrained body sub-line.
 */
export function Eyebrow({
  children,
  tone = "light",
  style,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  style?: { opacity?: MotionValue<number>; y?: MotionValue<number> };
}) {
  return (
    <motion.p
      style={style}
      className={`mb-5 text-[0.7rem] font-medium uppercase tracking-eyebrow sm:text-xs ${
        tone === "light" ? "text-[#c9a86a]" : "text-[#8a6d3b]"
      }`}
    >
      {children}
    </motion.p>
  );
}

export function Headline({
  children,
  as: Tag = "h2",
  tone = "light",
  style,
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2";
  tone?: "light" | "dark";
  style?: { opacity?: MotionValue<number>; y?: MotionValue<number> };
  className?: string;
}) {
  return (
    <motion.div style={style}>
      <Tag
        className={`font-display text-[clamp(2.4rem,6.5vw,5.4rem)] font-light leading-[1.04] tracking-[-0.015em] ${
          tone === "light" ? "text-white" : "text-[#231d14]"
        } ${className}`}
      >
        {children}
      </Tag>
    </motion.div>
  );
}

export function Sub({
  children,
  tone = "light",
  style,
  className = "",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  style?: { opacity?: MotionValue<number>; y?: MotionValue<number> };
  className?: string;
}) {
  return (
    <motion.p
      style={style}
      className={`mt-6 max-w-xl text-base font-light leading-relaxed sm:text-lg ${
        tone === "light" ? "text-white/70" : "text-[#3d362a]/80"
      } ${className}`}
    >
      {children}
    </motion.p>
  );
}

/** Floating soft glow label — the no-card alternative to chips. */
export function GlowLabel({
  children,
  tone = "light",
  delay = 0,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  delay?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative inline-block px-2 py-1 text-sm font-light tracking-[0.08em] sm:text-base ${
        tone === "light" ? "text-white/85" : "text-[#2c2418]"
      }`}
    >
      <span
        aria-hidden
        className="absolute inset-[-30%] -z-10 rounded-full opacity-60 blur-2xl"
        style={{
          background:
            tone === "light"
              ? "radial-gradient(circle, rgba(201,168,106,0.35) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(201,168,106,0.45) 0%, transparent 70%)",
        }}
      />
      {children}
    </motion.span>
  );
}
