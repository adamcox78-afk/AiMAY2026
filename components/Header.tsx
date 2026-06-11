"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { PHONE_TEL } from "@/lib/scenes";

/**
 * Minimal fixed header. Hidden over the opening scene, fading in
 * afterwards; its ink adapts from light-on-dark to dark-on-light
 * as the page brightens toward the finale.
 */
export default function Header() {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  const [lightPage, setLightPage] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setVisible(v > 0.06);
    setLightPage(v > 0.7);
  });

  const ink = lightPage ? "text-[#231d14]" : "text-white";

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 z-40"
        >
          <div
            className={`mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5 backdrop-blur-md transition-colors duration-700 sm:px-7 ${
              lightPage ? "bg-white/40" : "bg-black/25"
            }`}
          >
            <a href="#scene-1" className={`font-display text-sm tracking-[0.18em] ${ink} transition-colors duration-700`}>
              BOCA CENTER{" "}
              <span className="hidden font-body text-[0.65rem] uppercase tracking-eyebrow opacity-70 sm:inline">
                for Healthy Living
              </span>
            </a>
            <a
              href={PHONE_TEL}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors duration-700 ${
                lightPage
                  ? "border-[#231d14]/30 text-[#231d14] hover:bg-[#231d14] hover:text-white"
                  : "border-white/30 text-white hover:bg-white hover:text-black"
              }`}
            >
              Schedule
            </a>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
