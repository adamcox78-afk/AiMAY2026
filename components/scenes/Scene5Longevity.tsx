'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Reveal, RevealHeadline } from '@/components/Reveal';

const FlowCanvas = dynamic(() => import('@/components/visuals/FlowCanvas'), {
  ssr: false,
});

const FACETS = [
  'Cellular regeneration',
  'Active lifestyles',
  'Strength',
  'Cognitive wellness',
  'Vibrant aging',
];

const PROGRAMS = [
  { t: 'Preventative Medicine', d: 'Acting years before symptoms ever arrive.' },
  { t: 'Healthy Aging', d: 'Adding life to years, not merely years to life.' },
  { t: 'Concierge Wellness', d: 'Unhurried, personal, always within reach.' },
];

export default function Scene5Longevity() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.3]);

  return (
    <section
      id="scene-5"
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-midnight via-[#0e140c] to-midnight py-32 md:py-52"
    >
      <motion.div style={{ scale }} className="absolute inset-0 opacity-75">
        <FlowCanvas palette="longevity" direction="radial" density={85} />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center md:px-12">
        <Reveal>
          <p className="mb-5 text-[0.7rem] uppercase tracking-luxe text-sage">
            Scene V — Longevity
          </p>
        </Reveal>
        <RevealHeadline
          text="Longevity is not living longer. It is living better."
          className="mx-auto max-w-4xl font-display text-4xl font-light leading-[1.08] text-ivory md:text-7xl"
        />

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {FACETS.map((f, i) => (
            <Reveal key={f} delay={0.1 + i * 0.08}>
              <span className="rounded-full border border-sage/30 px-5 py-2 text-[0.72rem] uppercase tracking-wide2 text-ivory/80">
                {f}
              </span>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.t} delay={0.15 + i * 0.12}>
              <div className="glass h-full rounded-2xl p-7 text-left transition-transform duration-500 hover:-translate-y-1">
                <h3 className="font-display text-2xl text-ivory">{p.t}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-ivory/60">
                  {p.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
