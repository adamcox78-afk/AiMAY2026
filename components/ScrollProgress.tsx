"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Slim luminous progress line along the top edge. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, rgba(201,168,106,0.2), #c9a86a 55%, #fff7e6)",
        boxShadow: "0 0 12px rgba(201,168,106,0.55)",
      }}
    />
  );
}
