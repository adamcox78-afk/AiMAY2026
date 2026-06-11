'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LINKS = [
  { label: 'The Journey', href: '#scene-1' },
  { label: 'Root Cause', href: '#scene-3' },
  { label: 'Longevity', href: '#scene-5' },
  { label: 'The Experience', href: '#scene-7' },
  { label: 'Treatments', href: '#scene-8' },
  { label: 'Contact', href: '#final' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`flex items-center justify-between px-6 py-5 transition-all duration-700 md:px-12 ${
            scrolled ? 'backdrop-blur-xl' : ''
          }`}
          style={{
            background: scrolled
              ? 'linear-gradient(to bottom, rgba(10,14,18,0.55), transparent)'
              : 'transparent',
          }}
        >
          <a href="#scene-1" className="group flex flex-col leading-none">
            <span className="font-display text-[1.15rem] tracking-wide2 text-ivory">
              BOCA CENTER
            </span>
            <span className="text-[0.6rem] uppercase tracking-luxe text-champagne/80">
              for Healthy Living
            </span>
          </a>

          <nav className="hidden items-center gap-9 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-[0.72rem] uppercase tracking-wide2 text-ivory/70 transition-colors hover:text-ivory"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-champagne transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#final"
              className="hidden rounded-full border border-champagne/40 px-5 py-2 text-[0.7rem] uppercase tracking-wide2 text-champagne transition-all duration-500 hover:bg-champagne hover:text-midnight md:inline-block"
            >
              Schedule
            </a>
            <button
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
            >
              <span
                className={`h-px w-6 bg-ivory transition-all duration-300 ${
                  open ? 'translate-y-[3.5px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-px w-6 bg-ivory transition-all duration-300 ${
                  open ? '-translate-y-[3.5px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-7 bg-midnight/90 backdrop-blur-2xl lg:hidden"
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="font-display text-3xl text-ivory"
              >
                {l.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
