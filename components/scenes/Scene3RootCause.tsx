'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Reveal, RevealHeadline } from '@/components/Reveal';
import BlendImage from '@/components/BlendImage';

const FlowCanvas = dynamic(() => import('@/components/visuals/FlowCanvas'), {
  ssr: false,
});

const PILLARS = [
  { t: 'Healthy circulation', d: 'Optimized blood flow that nourishes every system.' },
  { t: 'Oxygen delivery', d: 'Cellular energy at its source, restored and sustained.' },
  { t: 'Cellular communication', d: 'Systems speaking clearly — the language of balance.' },
  { t: 'Reduced inflammation', d: 'Calming the root drivers of chronic disease.' },
];

export default function Scene3RootCause() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);

  return (
    <section
      id="scene-3"
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-midnight via-[#1a1012] to-midnight py-32 md:py-48"
    >
      <motion.div style={{ y }} className="absolute inset-0 opacity-70">
        <FlowCanvas palette="blood" direction="right" density={80} />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <BlendImage
          src="/scenes/03-bloodstream.webp"
          alt="Healthy bloodstream"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-12">
        <Reveal>
          <p className="mb-4 text-[0.7rem] uppercase tracking-luxe text-[#e3a59f]">
            Scene III — Root Cause Medicine
          </p>
        </Reveal>
        <RevealHeadline
          text="True wellness comes from addressing the root cause."
          className="max-w-3xl font-display text-4xl font-light leading-[1.1] text-ivory md:text-6xl"
        />
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-ivory/70">
            Not simply treating symptoms. Our Functional &amp; Integrative
            Medicine philosophy looks deeper — to where health truly begins.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.t} delay={0.1 + i * 0.1}>
              <div className="glass h-full rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-1">
                <div className="mb-4 h-px w-10 bg-champagne/60" />
                <h3 className="font-display text-xl text-ivory">{p.t}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-ivory/60">
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
