'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

const devices = [
  {
    id: 'infrared',
    name: 'Full-Spectrum Infrared Sauna',
    category: 'Recovery & Detox',
    description: 'Medical-grade infrared therapy for deep tissue healing, detoxification, and cardiovascular conditioning.',
    specs: ['Near, Mid & Far Infrared', 'Chromotherapy Lighting', 'Carbon Panel Technology'],
    glow: 'rgba(200,120,80,0.3)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect x="8" y="10" width="32" height="28" rx="4" stroke="rgba(200,120,80,0.7)" strokeWidth="1.5" />
        <path d="M24 18 C24 18 28 22 28 26 C28 30 24 34 24 34 C24 34 20 30 20 26 C20 22 24 18 24 18Z"
          stroke="rgba(255,180,80,0.6)" strokeWidth="1" fill="rgba(255,140,60,0.1)" />
        <circle cx="24" cy="26" r="3" fill="rgba(255,160,60,0.5)" />
      </svg>
    ),
  },
  {
    id: 'cryotherapy',
    name: 'Whole Body Cryotherapy',
    category: 'Recovery & Performance',
    description: 'Targeted cold therapy accelerating recovery, reducing inflammation, and boosting endorphin release.',
    specs: ['−110°C Treatment Chamber', 'Nitrogen-Free System', 'Real-Time Monitoring'],
    glow: 'rgba(74,144,184,0.35)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <circle cx="24" cy="24" r="16" stroke="rgba(74,144,184,0.6)" strokeWidth="1.5" />
        <path d="M24 8 L24 40 M8 24 L40 24 M12 12 L36 36 M36 12 L12 36"
          stroke="rgba(122,184,212,0.5)" strokeWidth="1" />
        <circle cx="24" cy="24" r="4" fill="rgba(74,144,184,0.3)" />
      </svg>
    ),
  },
  {
    id: 'iv',
    name: 'IV Nutrient Therapy',
    category: 'Cellular Optimization',
    description: 'Precision-formulated intravenous infusions delivering vitamins, minerals, and peptides directly to cells.',
    specs: ['Custom Formulations', 'Myers Cocktail & NAD+', 'Glutathione Protocols'],
    glow: 'rgba(143,168,136,0.3)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <path d="M24 8 L24 32 M18 14 L24 8 L30 14" stroke="rgba(143,168,136,0.7)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="36" r="4" stroke="rgba(143,168,136,0.6)" strokeWidth="1.5" />
        <path d="M18 36 L14 42 M30 36 L34 42" stroke="rgba(143,168,136,0.4)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'pemf',
    name: 'PEMF Therapy',
    category: 'Cellular Recovery',
    description: 'Pulsed Electromagnetic Field technology for accelerated healing, pain relief, and cellular regeneration.',
    specs: ['Full-Body Coverage', 'Frequency Programs', 'NASA-Derived Technology'],
    glow: 'rgba(160,100,200,0.25)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <path d="M8 24 Q16 10 24 24 Q32 38 40 24"
          stroke="rgba(160,100,200,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M8 30 Q16 16 24 30 Q32 44 40 30"
          stroke="rgba(160,100,200,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M8 18 Q16 4 24 18 Q32 32 40 18"
          stroke="rgba(160,100,200,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'laser',
    name: 'Low-Level Laser Therapy',
    category: 'Pain & Healing',
    description: 'Class IV therapeutic laser for deep tissue repair, neuropathy, and accelerated wound healing.',
    specs: ['Class IV Therapeutic', 'Multiple Wavelengths', 'Anti-Inflammatory Protocol'],
    glow: 'rgba(200,80,80,0.25)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <circle cx="24" cy="16" r="6" stroke="rgba(200,80,80,0.6)" strokeWidth="1.5" />
        <path d="M24 22 L24 38" stroke="rgba(200,80,80,0.5)" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 28 L8 36 M32 28 L40 36 M18 32 L10 40 M30 32 L38 40"
          stroke="rgba(200,80,80,0.3)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'biofeedback',
    name: 'Quantum Biofeedback',
    category: 'Diagnostic',
    description: 'Advanced bioenergetic scanning identifying cellular stress patterns and guiding treatment protocols.',
    specs: ['QXCI/SCIO System', 'Resonance Analysis', 'Real-Time Calibration'],
    glow: 'rgba(74,144,184,0.3)',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect x="10" y="10" width="28" height="28" rx="4" stroke="rgba(74,144,184,0.6)" strokeWidth="1.5" />
        <path d="M14 24 L18 16 L22 32 L26 20 L30 28 L34 24"
          stroke="rgba(74,144,184,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function Scene5Technology() {
  const ref = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start end', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 18 })
  const bgY = useTransform(smooth, [0, 1], ['-10%', '10%'])
  const textY = useTransform(smooth, [0, 0.5], [40, -20])
  const opacity = useTransform(smooth, [0, 0.15, 0.85, 1], [0, 1, 1, 0])

  return (
    <section
      ref={ref}
      id="technology"
      className="relative scene overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a1e2a 0%, #151820 40%, #1e2230 100%)',
      }}
    >
      {/* Hero section */}
      <div ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated grid background */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="techGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(74,144,184,0.3)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="1440" height="900" fill="url(#techGrid)" />
            {/* Glowing nodes */}
            {[[200, 200], [400, 450], [720, 150], [1000, 350], [1250, 500], [600, 650]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2" fill="rgba(74,144,184,0.6)">
                <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {/* Connection lines */}
            <line x1="200" y1="200" x2="400" y2="450" stroke="rgba(74,144,184,0.15)" strokeWidth="0.5" />
            <line x1="400" y1="450" x2="720" y2="150" stroke="rgba(74,144,184,0.15)" strokeWidth="0.5" />
            <line x1="720" y1="150" x2="1000" y2="350" stroke="rgba(74,144,184,0.15)" strokeWidth="0.5" />
            <line x1="1000" y1="350" x2="1250" y2="500" stroke="rgba(74,144,184,0.15)" strokeWidth="0.5" />
          </svg>

          {/* Radial glow */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(74,144,184,0.08) 0%, transparent 70%)',
            }}
          />
        </motion.div>

        {/* Hero text */}
        <motion.div
          style={{ y: textY, opacity }}
          className="relative z-10 text-center px-6"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-blue-tech/60" />
            <span className="text-xs tracking-[0.4em] uppercase text-blue-tech/60">Treatment Room</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-blue-tech/60" />
          </div>
          <h2 className="text-4xl md:text-7xl font-light tracking-tight text-white/90 mb-6 leading-tight">
            Medical Technology<br />
            <span className="text-gradient">Meets Wellness</span>
          </h2>
          <p className="text-white/40 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Our state-of-the-art treatment suite integrates the most advanced therapeutic technologies available in regenerative medicine and biohacking.
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="scroll-bounce text-white/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Device grid */}
      <div className="relative max-w-7xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devices.map((device, i) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group rounded-2xl p-6 border transition-all duration-500 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              {/* Device image placeholder */}
              <div
                className="relative rounded-xl mb-5 flex items-center justify-center overflow-hidden"
                style={{
                  height: '160px',
                  background: `radial-gradient(ellipse at center, ${device.glow} 0%, rgba(20,24,36,0.8) 70%)`,
                  border: `1px solid ${device.glow.replace('0.3', '0.2').replace('0.35', '0.2').replace('0.25', '0.15')}`,
                }}
              >
                <div className="pulse-glow rounded-full p-4">
                  {device.icon}
                </div>
                {/* Placeholder label */}
                <div className="absolute bottom-2 right-2 glass-dark rounded px-2 py-1">
                  <span className="text-white/25 text-[10px] tracking-widest">Device Photo</span>
                </div>
                {/* Corner accent */}
                <div className="absolute top-3 left-3 text-white/15 text-xs tracking-widest uppercase">
                  {device.category}
                </div>
              </div>

              {/* Info */}
              <h3 className="text-white/85 font-medium mb-2 group-hover:text-white transition-colors">
                {device.name}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed mb-4">{device.description}</p>

              {/* Specs */}
              <div className="space-y-1.5">
                {device.specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-tech/50 flex-shrink-0" />
                    <span className="text-white/30 text-xs">{spec}</span>
                  </div>
                ))}
              </div>

              {/* Hover border glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 1px ${device.glow}` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Video placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-12 rounded-3xl overflow-hidden relative"
          style={{
            height: '400px',
            background: 'linear-gradient(135deg, #1a1e2a, #151820)',
            border: '1px solid rgba(74,144,184,0.15)',
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full border border-white/15 flex items-center justify-center"
              style={{ background: 'rgba(74,144,184,0.1)' }}>
              <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
                <path d="M18 12 L38 24 L18 36 Z" fill="rgba(74,144,184,0.6)" />
              </svg>
            </div>
            <p className="text-white/30 tracking-widest text-sm uppercase">Treatment Room Tour — Video Placeholder</p>
            <p className="text-white/15 text-xs">Replace with your facility walkthrough video</p>
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(74,144,184,0.05) 0%, transparent 70%)' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
