'use client';

import { Reveal } from '@/components/Reveal';
import BlendImage from '@/components/BlendImage';

const TREATMENTS = [
  {
    t: 'Alma TED Hair Restoration',
    d: 'Acoustic, needle-free hair revitalization — confidence restored at the follicle.',
    src: '/scenes/08-alma-ted.webp',
    tone: 'rgba(159,194,214,0.25)',
  },
  {
    t: 'Alma Harmony Skin Rejuvenation',
    d: 'Multi-modality light therapy for luminous, healthy, age-defying skin.',
    src: '/scenes/08-alma-harmony.webp',
    tone: 'rgba(216,184,115,0.25)',
  },
  {
    t: 'Medical Weight Loss',
    d: 'Physician-guided metabolic programs built around your unique biology.',
    src: '/scenes/08-weightloss.webp',
    tone: 'rgba(159,178,154,0.25)',
  },
  {
    t: 'Concierge Medicine',
    d: 'Direct access, deep relationships, and care without the wait.',
    src: '/scenes/08-concierge.webp',
    tone: 'rgba(199,162,75,0.25)',
  },
];

export default function Scene8Treatments() {
  return (
    <section
      id="scene-8"
      className="relative bg-gradient-to-b from-[#1d1a15] via-midnight to-midnight py-32 md:py-44"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <Reveal>
          <p className="mb-4 text-[0.7rem] uppercase tracking-luxe text-champagne">
            Scene VIII — Advanced Treatments
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="max-w-3xl font-display text-4xl font-light leading-tight text-ivory md:text-6xl">
            Medicine and artistry,{' '}
            <span className="text-gold-gradient">in quiet balance.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {TREATMENTS.map((tr, i) => (
            <Reveal key={tr.t} delay={i * 0.08}>
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 p-8 transition-all duration-700 hover:border-champagne/40">
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: tr.tone, opacity: 0.6 }}
                />
                <div className="relative flex items-center justify-center">
                  <BlendImage
                    src={tr.src}
                    alt={tr.t}
                    variant="device"
                    className="mb-6 h-44 w-auto object-contain"
                  />
                </div>
                <h3 className="relative font-display text-2xl text-ivory">
                  {tr.t}
                </h3>
                <p className="relative mt-2 max-w-sm text-sm font-light leading-relaxed text-ivory/65">
                  {tr.d}
                </p>
                <a
                  href="#final"
                  className="relative mt-5 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-wide2 text-champagne transition-all group-hover:gap-3"
                >
                  Learn more <span>→</span>
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
