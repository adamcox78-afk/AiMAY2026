'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

const SCENES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', '◆'];

export default function ProgressRail() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
      <div className="relative h-44 w-px bg-white/15">
        <motion.div
          style={{ scaleY, transformOrigin: 'top' }}
          className="absolute inset-0 w-px bg-champagne"
        />
      </div>
      <span className="font-display text-[0.6rem] tracking-luxe text-ivory/40">
        {SCENES.length} acts
      </span>
    </div>
  );
}
