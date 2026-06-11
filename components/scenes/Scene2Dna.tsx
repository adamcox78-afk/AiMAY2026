'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Reveal } from '@/components/Reveal';

const DnaCanvas = dynamic(() => import('@/components/visuals/DnaCanvas'), {
  ssr: false,
});

const STATS = [
  { k: 'Genetic markers', v: 'Personalized' },
  { k: 'Biomarker panels', v: '90+ analyzed' },
  { k: 'Care model', v: 'One patient, one plan' },
];

export default function Scene2Dna() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setP(v));

  const helixOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.4]);

  return (
    <section
      id="scene-2"
      ref={ref}
      className="relative h-[230vh] bg-gradient-to-b from-midnight via-carbon to-midnight"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ opacity: helixOpacity }} className="absolute inset-0">
          <DnaCanvas progress={Math.min(1, Math.max(0, (p - 0.1) / 0.7))} />
        </motion.div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 md:grid-cols-2 md:px-12">
          <div className="flex flex-col justify-center">
            <Reveal>
              <p className="mb-4 text-[0.7rem] uppercase tracking-luxe text-glacier">
                Scene II — The DNA of Wellness
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display text-4xl font-light leading-tight text-ivory md:text-6xl">
                Every patient has a{' '}
                <span className="text-gold-gradient">unique story.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-md text-base font-light leading-relaxed text-ivory/70">
                Your biology is yours alone. We read it carefully — genetics,
                hormones, metabolism, and lifestyle — to design a path written
                for no one else but you.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col justify-center gap-4 md:items-end">
            {STATS.map((s, i) => (
              <Reveal key={s.k} delay={0.3 + i * 0.12} className="w-full max-w-xs">
                <div className="glass rounded-2xl px-6 py-5">
                  <p className="text-[0.62rem] uppercase tracking-luxe text-champagne/80">
                    {s.k}
                  </p>
                  <p className="mt-1 font-display text-2xl text-ivory">{s.v}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
