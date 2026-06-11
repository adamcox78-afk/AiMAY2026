'use client';

import { motion, MotionValue, useTransform } from 'framer-motion';

/**
 * Scene 6 — frosted glass doors that part as the scroll progress crosses ~0.5.
 * `progress` is a 0..1 MotionValue from the pinned section.
 */
export default function GlassDoors({ progress }: { progress: MotionValue<number> }) {
  const leftX = useTransform(progress, [0.35, 0.85], ['0%', '-105%']);
  const rightX = useTransform(progress, [0.35, 0.85], ['0%', '105%']);
  const glow = useTransform(progress, [0.35, 0.85], [0.1, 1]);
  const logoOpacity = useTransform(progress, [0.55, 0.9], [0, 1]);
  const logoScale = useTransform(progress, [0.55, 0.95], [0.85, 1]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* light behind the doors */}
      <motion.div
        style={{ opacity: glow }}
        className="absolute h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(231,207,148,0.5),rgba(159,194,214,0.15)_45%,transparent_70%)] blur-2xl"
      />

      {/* emerging logo */}
      <motion.div
        style={{ opacity: logoOpacity, scale: logoScale }}
        className="absolute z-10 flex flex-col items-center text-center"
      >
        <span className="font-display text-5xl tracking-wide2 text-ivory md:text-7xl">
          Boca Center
        </span>
        <span className="mt-2 text-[0.7rem] uppercase tracking-luxe text-champagne md:text-sm">
          for Healthy Living
        </span>
      </motion.div>

      {/* left door */}
      <motion.div
        style={{ x: leftX }}
        className="absolute left-0 top-0 h-full w-1/2 border-r border-white/10"
      >
        <div className="glass h-full w-full" />
        <div className="absolute right-6 top-1/2 h-24 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-champagne/80 to-gold/40" />
      </motion.div>

      {/* right door */}
      <motion.div
        style={{ x: rightX }}
        className="absolute right-0 top-0 h-full w-1/2 border-l border-white/10"
      >
        <div className="glass h-full w-full" />
        <div className="absolute left-6 top-1/2 h-24 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-champagne/80 to-gold/40" />
      </motion.div>
    </div>
  );
}
