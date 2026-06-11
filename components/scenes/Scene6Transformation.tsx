'use client';

import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import GlassDoors from '@/components/visuals/GlassDoors';

export default function Scene6Transformation() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <section id="scene-6" ref={ref} className="relative h-[250vh] bg-midnight">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* dissolving light ribbons */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[120vh] w-[120vh] -translate-x-1/2 -translate-y-1/2 animate-drift rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(231,207,148,0.12),transparent,rgba(159,194,214,0.12),transparent)] blur-3xl" />
        </div>
        <GlassDoors progress={scrollYProgress} />
        <p className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-[0.62rem] uppercase tracking-luxe text-ivory/40">
          Scene VI — Transformation
        </p>
      </div>
    </section>
  );
}
