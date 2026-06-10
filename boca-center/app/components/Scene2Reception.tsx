'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

const services = [
  { icon: '✦', label: 'Hormone Therapy', desc: 'Personalized balance restoration' },
  { icon: '◈', label: 'Weight Management', desc: 'Medical-grade programs' },
  { icon: '◉', label: 'Longevity Medicine', desc: 'Evidence-based healthspan' },
  { icon: '⬡', label: 'Functional Medicine', desc: 'Root-cause approach' },
]

export default function Scene2Reception() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 18 })

  const opacity = useTransform(smooth, [0, 0.15, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(smooth, [0, 0.2], [80, 0])
  const deskY = useTransform(smooth, [0.1, 0.5], [60, 0])
  const bgParallax = useTransform(smooth, [0, 1], ['-5%', '5%'])

  return (
    <section
      ref={ref}
      id="about"
      className="relative min-h-screen scene overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ece5d8 0%, #f0ebe3 40%, #faf8f5 100%)',
      }}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid-subtle opacity-60" />

      {/* Parallax background shapes */}
      <motion.div
        style={{ y: bgParallax }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-20 right-16 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(143,168,136,0.4), transparent 70%)' }} />
        <div className="absolute bottom-32 left-8 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(74,144,184,0.3), transparent 70%)' }} />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Section label */}
        <motion.div style={{ opacity, y }} className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-sage-green to-blue-tech opacity-60" />
            <span className="text-xs tracking-[0.4em] uppercase text-warm-gray">Reception</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-stone-700 mb-6 leading-tight">
            Where Healing<br />
            <span className="text-gradient">Begins</span>
          </h2>
          <p className="text-stone-500 text-lg font-light leading-relaxed max-w-xl">
            At Boca Center for Healthy Living, your journey starts the moment you walk through our doors.
            We combine cutting-edge diagnostics with personalized care in a sanctuary designed for transformation.
          </p>
        </motion.div>

        {/* Reception desk visual */}
        <motion.div
          style={{ opacity, y: deskY }}
          className="relative mb-20"
        >
          {/* Main reception area mockup */}
          <div className="relative rounded-3xl overflow-hidden" style={{ height: '420px' }}>
            {/* Background atmosphere */}
            <div className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #ede5d5 0%, #e8dcc8 30%, #f0e8d8 60%, #ece0cc 100%)',
              }}
            />

            {/* Decorative architecture lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice">
              {/* Floor line */}
              <line x1="0" y1="340" x2="1200" y2="340" stroke="rgba(160,145,120,0.2)" strokeWidth="1" />
              {/* Ceiling panels */}
              <rect x="0" y="0" width="1200" height="40" fill="rgba(255,255,255,0.1)" />
              {/* Wall panels */}
              {[...Array(6)].map((_, i) => (
                <rect key={i} x={i * 200} y="40" width="200" height="300"
                  fill="none" stroke="rgba(200,185,165,0.15)" strokeWidth="1" />
              ))}
              {/* Recessed lighting */}
              {[...Array(5)].map((_, i) => (
                <ellipse key={i} cx={120 + i * 240} cy="35" rx="40" ry="8"
                  fill="rgba(255,240,200,0.3)" />
              ))}
            </svg>

            {/* Reception desk */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-96 h-20 glass-panel rounded-2xl shimmer-overlay">
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute top-3 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <div className="absolute bottom-4 left-8 right-8 flex justify-between items-center">
                  <div className="w-16 h-1.5 rounded-full bg-sage-green/40" />
                  <div className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-blue-tech/30" />
                  </div>
                  <div className="w-16 h-1.5 rounded-full bg-sage-green/40" />
                </div>
              </div>
            </div>

            {/* Botanical accents */}
            <div className="absolute left-12 bottom-14 opacity-40">
              <svg viewBox="0 0 60 140" className="w-12 h-28 sway">
                <path d="M30 140 C30 140 24 100 10 75 C-4 50 8 20 25 15 C15 40 28 75 30 100" fill="#5a7a5f" />
                <path d="M30 140 C30 140 36 110 50 82 C64 54 52 24 35 18 C45 44 32 78 30 105" fill="#8fa888" />
                <path d="M30 140 L30 60" stroke="#5a7a5f" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <div className="absolute right-16 bottom-14 opacity-35">
              <svg viewBox="0 0 60 160" className="w-10 h-32 sway" style={{ animationDelay: '-2s' }}>
                <path d="M30 160 C30 160 22 120 8 90 C-6 60 6 25 22 18 C12 48 26 82 30 112" fill="#5a7a5f" />
                <path d="M30 160 C30 160 38 125 52 95 C66 65 54 28 38 21 C48 52 34 86 30 116" fill="#8fa888" />
                <path d="M30 160 L30 75" stroke="#4a7a4f" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

            {/* Image placeholder */}
            <div className="absolute top-6 right-8 w-64 h-48 rounded-2xl glass-panel flex flex-col items-center justify-center gap-2 opacity-80">
              <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white/40">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.5" />
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-white/30 text-xs tracking-widest">Reception Photo</p>
            </div>

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 80%, rgba(255,240,200,0.2), transparent)' }}
            />
          </div>
        </motion.div>

        {/* Service cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="glass-panel rounded-2xl p-5 cursor-default group"
              style={{ background: 'rgba(255,255,255,0.45)' }}
            >
              <div className="text-2xl mb-3 text-sage-green opacity-70 group-hover:opacity-100 transition-opacity">
                {s.icon}
              </div>
              <h3 className="text-stone-700 font-medium text-sm mb-1">{s.label}</h3>
              <p className="text-stone-400 text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 pt-12 border-t border-stone-200/60 grid grid-cols-3 gap-8 text-center"
        >
          {[
            { num: '15+', label: 'Years of Excellence' },
            { num: '5,000+', label: 'Lives Transformed' },
            { num: '20+', label: 'Wellness Protocols' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-5xl font-light text-gradient stat-number mb-2">{stat.num}</div>
              <div className="text-stone-400 text-xs tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
