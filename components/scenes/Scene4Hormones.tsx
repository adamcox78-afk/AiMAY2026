'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Reveal, RevealHeadline } from '@/components/Reveal';

const FlowCanvas = dynamic(() => import('@/components/visuals/FlowCanvas'), {
  ssr: false,
});

const THERAPIES = [
  { t: 'EvexiPEL Hormone Therapy', d: 'Precision pellet therapy for steady, natural hormone levels.' },
  { t: 'Bio-identical HRT', d: 'Molecularly identical to your own — for seamless balance.' },
  { t: 'Energy restoration', d: 'Reclaim the vitality that fuels everything you do.' },
  { t: 'Improved vitality', d: 'Sharper focus, deeper sleep, renewed drive.' },
];

export default function Scene4Hormones() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section
      id="scene-4"
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-midnight via-[#141207] to-midnight py-32 md:py-48"
    >
      <motion.div style={{ y }} className="absolute inset-0 opacity-80">
        <FlowCanvas palette="hormone" direction="up" density={70} />
      </motion.div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:px-12">
        <div className="flex flex-col justify-center">
          <Reveal>
            <p className="mb-4 text-[0.7rem] uppercase tracking-luxe text-champagne">
              Scene IV — Hormonal Balance
            </p>
          </Reveal>
          <RevealHeadline
            text="Hormonal harmony creates lasting vitality."
            className="font-display text-4xl font-light leading-[1.1] text-ivory md:text-6xl"
          />
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-base font-light leading-relaxed text-ivory/70">
              Travel through the endocrine pathways and watch balance return —
              signaling restored, energy renewed, vitality made lasting.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col justify-center gap-4">
          {THERAPIES.map((t, i) => (
            <Reveal key={t.t} delay={0.15 + i * 0.1}>
              <div className="group flex items-start gap-4 border-b border-white/10 pb-4">
                <span className="mt-1 font-display text-champagne/70">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl text-ivory transition-colors group-hover:text-champagne">
                    {t.t}
                  </h3>
                  <p className="mt-1 text-sm font-light text-ivory/60">{t.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
