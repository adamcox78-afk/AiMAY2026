'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal } from '@/components/Reveal';
import BlendImage from '@/components/BlendImage';

const SPACES = [
  { n: 'Reception', src: '/scenes/07-reception.webp', d: 'A warm welcome — soft daylight, frosted glass, natural calm.' },
  { n: 'Consultation', src: '/scenes/07-consult.webp', d: 'Unhurried conversations that begin with truly listening.' },
  { n: 'Functional Medicine', src: '/scenes/07-office.webp', d: 'Where root-cause science meets personal care.' },
  { n: 'Treatment Suites', src: '/scenes/07-treatment.webp', d: 'Advanced, serene, and entirely without the clinical chill.' },
];

export default function Scene7Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-2%']);

  return (
    <section
      id="scene-7"
      ref={ref}
      className="relative bg-gradient-to-b from-midnight via-[#161310] to-[#1d1a15] py-32 md:py-44"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <Reveal>
          <p className="mb-4 text-[0.7rem] uppercase tracking-luxe text-champagne">
            Scene VII — The Boca Experience
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="max-w-3xl font-display text-4xl font-light leading-tight text-ivory md:text-6xl">
            Step inside a space designed to feel{' '}
            <span className="text-gold-gradient">like arriving home.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-ivory/70">
            Warm. Trustworthy. High-end. Personalized. Clean — but never
            clinical. Every detail is composed around your sense of ease.
          </p>
        </Reveal>
      </div>

      <motion.div style={{ x }} className="mt-16 md:mt-24">
        <div className="grid gap-6 px-6 md:grid-cols-2 md:px-12">
          {SPACES.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="group relative h-[46vh] overflow-hidden rounded-3xl">
                {/* gradient base so it never looks like an empty box */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      i % 2 === 0
                        ? 'radial-gradient(120% 100% at 30% 20%, rgba(216,184,115,0.22), rgba(159,178,154,0.14) 45%, rgba(10,14,18,0.9) 90%)'
                        : 'radial-gradient(120% 100% at 70% 30%, rgba(159,194,214,0.22), rgba(216,184,115,0.12) 45%, rgba(10,14,18,0.9) 90%)',
                  }}
                />
                <BlendImage
                  src={s.src}
                  alt={s.n}
                  variant="soft"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-7">
                  <h3 className="font-display text-2xl text-ivory">{s.n}</h3>
                  <p className="mt-1 max-w-xs text-sm font-light text-ivory/70">
                    {s.d}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
