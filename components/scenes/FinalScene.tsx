'use client';

import { Reveal, RevealHeadline } from '@/components/Reveal';
import BlendImage from '@/components/BlendImage';

const CTAS = [
  { label: 'Schedule Consultation', href: 'tel:+15619942007', primary: true },
  { label: 'Explore Our Services', href: '#scene-8', primary: false },
  { label: 'Join Our Concierge Program', href: 'tel:+15619942007', primary: false },
];

export default function FinalScene() {
  return (
    <section
      id="final"
      className="relative overflow-hidden bg-gradient-to-b from-midnight via-[#14130f] to-[#0d0c0a] py-32 md:py-44"
    >
      {/* warm natural light wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(231,207,148,0.18),transparent_65%)] blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-6 md:grid-cols-2 md:px-12">
        {/* Dr. Matilsky portrait */}
        <Reveal>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(120%_100%_at_40%_20%,rgba(216,184,115,0.3),rgba(159,178,154,0.16)_50%,rgba(13,12,10,0.9))]" />
            <BlendImage
              src="/scenes/09-dr-matilsky.webp"
              alt="Dr. Merna Matilsky"
              variant="soft"
              className="absolute inset-0 h-full w-full rounded-[2rem] object-cover"
            />
            <div className="absolute bottom-5 left-5 glass-light rounded-xl px-4 py-2">
              <p className="font-display text-lg text-forest">Dr. Merna Matilsky</p>
              <p className="text-[0.6rem] uppercase tracking-wide2 text-moss">
                Founder &amp; Medical Director
              </p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="mb-4 text-[0.7rem] uppercase tracking-luxe text-champagne">
              Your Journey Begins
            </p>
          </Reveal>
          <RevealHeadline
            text="Your journey toward optimal health begins here."
            className="font-display text-4xl font-light leading-[1.1] text-ivory md:text-5xl"
          />

          <div className="mt-10 flex flex-col gap-3">
            {CTAS.map((c) => (
              <Reveal key={c.label} delay={0.1}>
                <a
                  href={c.href}
                  className={`group flex items-center justify-between rounded-full px-7 py-4 text-sm uppercase tracking-wide2 transition-all duration-500 ${
                    c.primary
                      ? 'bg-champagne text-midnight hover:bg-gold'
                      : 'border border-ivory/25 text-ivory hover:border-champagne hover:text-champagne'
                  }`}
                >
                  {c.label}
                  <span className="transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Contact footer */}
      <footer className="relative z-10 mx-auto mt-28 max-w-6xl border-t border-white/10 px-6 pt-12 md:px-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl tracking-wide2 text-ivory">
              Boca Center
            </p>
            <p className="text-[0.62rem] uppercase tracking-luxe text-champagne/80">
              for Healthy Living
            </p>
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-ivory/55">
              Functional, longevity &amp; hormone optimization medicine in the
              heart of South Florida.
            </p>
          </div>

          <div className="text-sm font-light text-ivory/70">
            <p className="mb-3 text-[0.62rem] uppercase tracking-luxe text-ivory/40">
              Visit
            </p>
            <p>2900 N Military Trail, Suite 245</p>
            <p>Boca Raton, FL 33431</p>
            <a
              href="https://www.bocamed.com"
              className="mt-3 inline-block text-champagne hover:underline"
            >
              www.bocamed.com
            </a>
          </div>

          <div className="text-sm font-light text-ivory/70">
            <p className="mb-3 text-[0.62rem] uppercase tracking-luxe text-ivory/40">
              Connect
            </p>
            <a
              href="tel:+15619942007"
              className="font-display text-3xl text-ivory transition-colors hover:text-champagne"
            >
              (561) 994-2007
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 pb-10 text-[0.62rem] uppercase tracking-wide2 text-ivory/35 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Boca Center for Healthy Living</p>
          <p>Hope · Trust · Transformation · Vitality</p>
        </div>
      </footer>
    </section>
  );
}
