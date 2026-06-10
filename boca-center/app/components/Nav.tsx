'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Technology', href: '#technology' },
  { label: 'Team', href: '#team' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled ? 'glass-dark py-3' : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-white/30 glass flex items-center justify-center">
              <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
                <circle cx="20" cy="20" r="8" stroke="#8fa888" strokeWidth="1.5" />
                <path d="M20 4 C20 4 28 12 28 20 C28 28 20 36 20 36 C20 36 12 28 12 20 C12 12 20 4 20 4Z"
                  stroke="#4a90b8" strokeWidth="1" fill="none" opacity="0.6" />
                <circle cx="20" cy="20" r="2" fill="#8fa888" />
              </svg>
            </div>
            <div>
              <div className="text-white/90 text-sm font-light tracking-widest uppercase leading-none">
                Boca Center
              </div>
              <div className="text-white/50 text-[10px] tracking-widest uppercase">
                for Healthy Living
              </div>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/60 hover:text-white/90 text-sm tracking-wider uppercase transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#contact"
              className="cta-btn px-6 py-2.5 rounded-full text-sm tracking-wider uppercase text-white border border-white/25 glass hover:border-white/50 transition-all duration-300"
            >
              Book a Visit
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5"
          >
            <span className={`block w-6 h-0.5 bg-white/70 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white/70 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white/70 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 glass-dark flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-white/80 text-2xl tracking-widest uppercase"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="mt-4 px-8 py-3 rounded-full border border-white/30 text-white/80 tracking-widest uppercase"
              onClick={() => setMenuOpen(false)}
            >
              Book a Visit
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
