'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

const team = [
  {
    name: 'Dr. Medical Director',
    title: 'Board-Certified Physician',
    specialty: 'Functional & Integrative Medicine',
  },
  {
    name: 'Wellness Specialist',
    title: 'Certified Practitioner',
    specialty: 'Hormone Optimization',
  },
  {
    name: 'Health Coach',
    title: 'Board-Certified',
    specialty: 'Longevity & Nutrition',
  },
]

export default function Scene3Hallway() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 18 })

  const parallaxFar = useTransform(smooth, [0, 1], ['-8%', '8%'])
  const parallaxMid = useTransform(smooth, [0, 1], ['-4%', '4%'])
  const parallaxNear = useTransform(smooth, [0, 1], ['-2%', '2%'])
  const opacity = useTransform(smooth, [0, 0.1, 0.9, 1], [0, 1, 1, 0])

  return (
    <section
      ref={ref}
      id="team"
      className="relative min-h-screen scene overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #faf8f5 0%, #f5f0e8 50%, #ece5d8 100%)',
      }}
    >
      {/* Hallway visual */}
      <div className="relative h-[60vh] overflow-hidden">
        {/* Far layer — back wall */}
        <motion.div
          style={{ y: parallaxFar }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #e8e0d0 0%, #ddd5c5 100%)',
            }}
          />
          {/* Perspective hallway */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
            {/* Vanishing point perspective */}
            <defs>
              <radialGradient id="vpGlow" cx="50%" cy="50%" r="30%">
                <stop offset="0%" stopColor="rgba(255,240,210,0.8)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="1440" height="600" fill="none" />
            {/* Vanishing point glow */}
            <ellipse cx="720" cy="300" rx="160" ry="100" fill="url(#vpGlow)" opacity="0.6" />
            {/* Floor lines */}
            {[...Array(8)].map((_, i) => {
              const progress = (i + 1) / 9
              const y = 300 + progress * 300
              const xLeft = 720 - progress * 720
              const xRight = 720 + progress * 720
              return (
                <line key={i} x1={xLeft} y1={y} x2={xRight} y2={y}
                  stroke="rgba(160,145,120,0.15)" strokeWidth="1" />
              )
            })}
            {/* Wall perspective lines — left */}
            {[...Array(4)].map((_, i) => {
              const progress = (i + 1) / 5
              return (
                <line key={i} x1="720" y1="300" x2={0} y2={300 - progress * 150}
                  stroke="rgba(160,145,120,0.12)" strokeWidth="1" />
              )
            })}
            {/* Wall perspective lines — right */}
            {[...Array(4)].map((_, i) => {
              const progress = (i + 1) / 5
              return (
                <line key={i} x1="720" y1="300" x2={1440} y2={300 - progress * 150}
                  stroke="rgba(160,145,120,0.12)" strokeWidth="1" />
              )
            })}
            {/* Side wall art panels */}
            <rect x="60" y="120" width="120" height="180" rx="4"
              fill="none" stroke="rgba(143,168,136,0.25)" strokeWidth="1" />
            <rect x="1260" y="120" width="120" height="180" rx="4"
              fill="none" stroke="rgba(143,168,136,0.25)" strokeWidth="1" />
          </svg>
        </motion.div>

        {/* Mid layer — hallway elements */}
        <motion.div style={{ y: parallaxMid }} className="absolute inset-0 pointer-events-none">
          {/* Left sconce */}
          <div className="absolute left-1/4 top-1/3">
            <div className="w-2 h-16 bg-gradient-to-b from-champagne/50 to-transparent rounded-full mx-auto" />
            <div className="w-8 h-4 rounded-t-full glass mx-auto -mt-1" />
            <div className="w-12 h-2 bg-gradient-to-b from-yellow-100/30 to-transparent rounded-b-full blur-sm" />
          </div>
          {/* Right sconce */}
          <div className="absolute right-1/4 top-1/3">
            <div className="w-2 h-16 bg-gradient-to-b from-champagne/50 to-transparent rounded-full mx-auto" />
            <div className="w-8 h-4 rounded-t-full glass mx-auto -mt-1" />
            <div className="w-12 h-2 bg-gradient-to-b from-yellow-100/30 to-transparent rounded-b-full blur-sm" />
          </div>
        </motion.div>

        {/* Near layer — overlay text */}
        <motion.div
          style={{ y: parallaxNear, opacity }}
          className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3"
        >
          <div className="divider-line w-24 mb-4" />
          <p className="text-stone-400 text-xs tracking-[0.4em] uppercase">Our Specialists</p>
          <h2 className="text-4xl md:text-6xl font-light text-stone-700 text-center">
            The Minds<br />
            <span className="text-gradient">Behind Your Care</span>
          </h2>
        </motion.div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(250,248,245,0.6) 80%, rgba(250,248,245,0.95) 100%)',
          }}
        />
      </div>

      {/* Team cards */}
      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(200,190,175,0.3)' }}
            >
              {/* Photo placeholder */}
              <div className="relative h-64 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #e8e0d0, #ddd5c3)' }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-50">
                  <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16">
                    <circle cx="40" cy="30" r="18" stroke="rgba(90,122,95,0.5)" strokeWidth="1.5" />
                    <path d="M10 75 C10 55 70 55 70 75" stroke="rgba(90,122,95,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                  <p className="text-stone-400 text-xs tracking-widest">Team Photo</p>
                </div>
                {/* Gradient overlay */}
                <div className="absolute bottom-0 inset-x-0 h-1/2"
                  style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)' }} />
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-stone-700 font-medium text-lg mb-1">{member.name}</h3>
                <p className="text-blue-tech text-xs tracking-wider uppercase mb-2">{member.title}</p>
                <p className="text-stone-400 text-sm">{member.specialty}</p>

                <div className="mt-4 pt-4 border-t border-stone-100">
                  <a href="#contact" className="text-sage-green text-xs tracking-widest uppercase group-hover:text-deep-sage transition-colors">
                    Schedule Consultation →
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Philosophy quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-20 text-center glass-panel rounded-3xl p-12"
          style={{ background: 'rgba(255,255,255,0.4)' }}
        >
          <div className="text-4xl text-sage-green/40 font-serif mb-4">"</div>
          <blockquote className="text-stone-600 text-xl md:text-2xl font-light leading-relaxed italic max-w-3xl mx-auto mb-6">
            We don't just treat symptoms — we uncover the root causes and restore your body's innate capacity to heal, thrive, and perform at its best.
          </blockquote>
          <div className="text-stone-400 text-xs tracking-widest uppercase">
            Boca Center for Healthy Living — Philosophy of Care
          </div>
        </motion.div>
      </div>
    </section>
  )
}
