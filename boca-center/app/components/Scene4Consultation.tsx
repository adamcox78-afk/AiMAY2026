'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

const consultationServices = [
  {
    category: 'Hormone Optimization',
    items: ['BHRT (Bioidentical Hormone Replacement)', 'Testosterone Therapy', 'Thyroid Optimization', 'Adrenal Support'],
    color: 'rgba(143,168,136,0.15)',
    accent: '#5a7a5f',
  },
  {
    category: 'Weight & Metabolic Health',
    items: ['GLP-1 Programs', 'Medical Weight Management', 'Metabolic Panel Analysis', 'Nutritional Counseling'],
    color: 'rgba(74,144,184,0.12)',
    accent: '#4a90b8',
  },
  {
    category: 'Longevity Medicine',
    items: ['Comprehensive Blood Analysis', 'Peptide Therapy', 'NAD+ Optimization', 'Cellular Health Protocols'],
    color: 'rgba(200,169,110,0.12)',
    accent: '#c8a96e',
  },
]

export default function Scene4Consultation() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 18 })
  const opacity = useTransform(smooth, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
  const lineWidth = useTransform(smooth, [0.1, 0.4], ['0%', '100%'])

  return (
    <section
      ref={ref}
      id="services"
      className="relative min-h-screen scene overflow-hidden py-24 md:py-32"
      style={{
        background: 'linear-gradient(180deg, #f5f0e8 0%, #faf8f5 50%, #f0ebe3 100%)',
      }}
    >
      {/* Decorative orb */}
      <div
        className="absolute top-1/4 right-0 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(74,144,184,0.5), transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(143,168,136,0.6), transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-sage-green to-blue-tech opacity-60" />
            <span className="text-xs tracking-[0.4em] uppercase text-warm-gray">Consultation Room</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-stone-700 mb-6 leading-tight">
            Your Personalized<br />
            <span className="text-gradient">Wellness Blueprint</span>
          </h2>
          <div className="flex items-center gap-4">
            <motion.div
              style={{ width: lineWidth }}
              className="h-px bg-gradient-to-r from-sage-green/60 via-blue-tech/60 to-transparent"
            />
          </div>
          <p className="text-stone-500 text-lg font-light leading-relaxed max-w-2xl mt-6">
            Every consultation begins with deep listening. We analyze your complete health picture — hormones, metabolism, genetics, and lifestyle — to design a protocol uniquely yours.
          </p>
        </motion.div>

        {/* Consultation room visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-20 rounded-3xl overflow-hidden relative"
          style={{ height: '400px' }}
        >
          {/* Room background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #e8e4dc 0%, #ddd8ce 40%, #e5e0d5 100%)',
            }}
          />

          {/* Room elements */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
            {/* Floor */}
            <rect x="0" y="340" width="1200" height="60" fill="rgba(200,190,175,0.2)" />
            {/* Wall panel grid */}
            {[...Array(4)].map((_, i) => (
              <rect key={i} x={i * 300} y="0" width="300" height="340"
                fill="none" stroke="rgba(180,168,150,0.15)" strokeWidth="1" />
            ))}
            {/* Window/light panel */}
            <rect x="480" y="40" width="240" height="180" rx="4"
              fill="rgba(255,245,220,0.3)" stroke="rgba(200,185,155,0.3)" strokeWidth="1" />
            {/* Desk element */}
            <rect x="400" y="280" width="400" height="60" rx="4"
              fill="rgba(180,165,140,0.2)" />
            {/* Monitor on desk */}
            <rect x="540" y="220" width="120" height="80" rx="4"
              fill="rgba(40,40,60,0.15)" stroke="rgba(180,165,140,0.3)" strokeWidth="1" />
            <rect x="590" y="298" width="20" height="10" rx="2"
              fill="rgba(180,165,140,0.25)" />
          </svg>

          {/* Glass overlay with content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass-panel rounded-2xl p-8 max-w-sm mx-4 text-center breathe">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-white/30 flex items-center justify-center">
                <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
                  <circle cx="24" cy="24" r="18" stroke="rgba(74,144,184,0.6)" strokeWidth="1.5" />
                  <path d="M24 10 L24 38 M10 24 L38 24" stroke="rgba(143,168,136,0.6)" strokeWidth="1" />
                  <circle cx="24" cy="24" r="4" fill="rgba(74,144,184,0.4)" />
                </svg>
              </div>
              <p className="text-white/70 text-sm tracking-wider">Personalized Assessment</p>
              <p className="text-white/40 text-xs mt-1">90-minute comprehensive consultation</p>
            </div>
          </div>

          {/* Photo placeholder overlay */}
          <div className="absolute top-4 right-4 glass-dark rounded-xl px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sage-green/60" />
            <span className="text-white/40 text-xs">Consultation Room Photo</span>
          </div>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(245,240,232,0.5) 100%)',
            }}
          />
        </motion.div>

        {/* Service categories */}
        <div className="grid md:grid-cols-3 gap-6">
          {consultationServices.map((service, i) => (
            <motion.div
              key={service.category}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="rounded-2xl p-6 border border-stone-100"
              style={{ background: service.color, borderColor: `${service.accent}20` }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-8 rounded-full" style={{ background: service.accent }} />
                <h3 className="text-stone-700 font-medium">{service.category}</h3>
              </div>
              <ul className="space-y-3">
                {service.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-stone-500 text-sm">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: service.accent }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Process steps */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-20"
        >
          <h3 className="text-stone-600 text-xl font-light text-center mb-12 tracking-wide">
            Your Journey with Us
          </h3>
          <div className="flex flex-col md:flex-row items-start gap-0">
            {[
              { num: '01', title: 'Initial Consultation', desc: 'Deep-dive health assessment and goal setting' },
              { num: '02', title: 'Comprehensive Labs', desc: 'Advanced diagnostics and biomarker analysis' },
              { num: '03', title: 'Custom Protocol', desc: 'Personalized treatment plan designed for you' },
              { num: '04', title: 'Ongoing Support', desc: 'Regular monitoring and protocol refinement' },
            ].map((step, i) => (
              <div key={step.num} className="flex-1 flex flex-col md:flex-row items-start">
                <div className="flex flex-col items-center md:items-start p-6">
                  <div className="text-5xl font-light text-gradient-warm opacity-60 mb-3">{step.num}</div>
                  <h4 className="text-stone-700 font-medium mb-2">{step.title}</h4>
                  <p className="text-stone-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:flex items-center justify-center w-8 mt-12 flex-shrink-0">
                    <div className="w-full h-px bg-gradient-to-r from-sage-green/40 to-blue-tech/40" />
                    <div className="text-stone-300 text-xs ml-1">›</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
