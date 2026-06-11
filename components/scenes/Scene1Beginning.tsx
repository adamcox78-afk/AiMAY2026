'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import BlendImage from '@/components/BlendImage';

const CellCanvas = dynamic(() => import('@/components/visuals/CellCanvas'), {
  ssr: false,
});

export default function Scene1Beginning() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const cellScale = useTransform(scrollYProgress, [0, 1], [1, 2.4]);
  const cellOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5], [0, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [40, -40]);

  return (
    <section
      id="scene-1"
      ref={ref}
      className="relative h-[200vh] bg-midnight"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden vignette">
        {/* Live cell visual */}
        <motion.div
          style={{ scale: cellScale, opacity: cellOpacity }}
          className="absolute inset-0"
        >
          <CellCanvas />
          {/* Higgsfield asset overlays the canvas when present */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <BlendImage
              src="/scenes/01-cell.webp"
              alt="Luminous human cell"
              className="h-[80vh] w-auto object-contain"
            />
          </div>
        </motion.div>

        {/* Opening line */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-10 px-6 text-center"
        >
          <p className="mb-5 text-[0.7rem] uppercase tracking-luxe text-champagne/70">
            Boca Center for Healthy Living
          </p>
          <h1 className="font-display text-3xl font-light leading-tight text-ivory md:text-6xl">
            Health begins
            <br />
            <span className="text-gold-gradient">beneath the surface.</span>
          </h1>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[0.6rem] uppercase tracking-luxe text-ivory/50"
        >
          Scroll to begin
        </motion.div>
      </div>
    </section>
  );
}
