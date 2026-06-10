'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export default function Scene1Door() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })

  // Door opens: left panel rotates left, right panel rotates right
  const leftDoorRotate = useTransform(smooth, [0, 0.5], [0, -75])
  const rightDoorRotate = useTransform(smooth, [0, 0.5], [0, 75])
  const doorScale = useTransform(smooth, [0, 0.5], [1, 1.15])
  const doorOpacity = useTransform(smooth, [0.4, 0.6], [1, 0])

  // Camera moves forward (scale up background)
  const bgScale = useTransform(smooth, [0, 1], [1, 1.4])
  const bgOpacity = useTransform(smooth, [0.7, 1], [1, 0])

  // Logo fades out as door opens
  const logoOpacity = useTransform(smooth, [0, 0.25], [1, 0])

  // Particles
  const particle1Y = useTransform(smooth, [0, 1], [0, -200])
  const particle2Y = useTransform(smooth, [0, 1], [0, -300])

  return (
    <section
      ref={ref}
      id="entry"
      className="relative h-[300vh] scene"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background — interior glimpse behind door */}
        <motion.div
          style={{ scale: bgScale, opacity: bgOpacity }}
          className="absolute inset-0 origin-center"
        >
          {/* Deep background — hallway glimpse */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 60% 80% at 50% 40%, rgba(232,220,200,0.6) 0%, rgba(240,235,227,0.4) 30%, rgba(250,248,245,0.2) 60%, transparent 100%),
                linear-gradient(180deg, #f5f0e8 0%, #ece5d8 40%, #e0d5c5 100%)
              `,
            }}
          />

          {/* Hallway depth lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            {/* Floor perspective lines */}
            <line x1="720" y1="450" x2="0" y2="900" stroke="rgba(143,168,136,0.15)" strokeWidth="1" />
            <line x1="720" y1="450" x2="1440" y2="900" stroke="rgba(143,168,136,0.15)" strokeWidth="1" />
            <line x1="720" y1="450" x2="200" y2="900" stroke="rgba(143,168,136,0.08)" strokeWidth="1" />
            <line x1="720" y1="450" x2="1240" y2="900" stroke="rgba(143,168,136,0.08)" strokeWidth="1" />
            {/* Ceiling perspective lines */}
            <line x1="720" y1="450" x2="0" y2="0" stroke="rgba(143,168,136,0.12)" strokeWidth="1" />
            <line x1="720" y1="450" x2="1440" y2="0" stroke="rgba(143,168,136,0.12)" strokeWidth="1" />
            {/* Wall dividers */}
            <line x1="300" y1="0" x2="300" y2="900" stroke="rgba(200,190,175,0.12)" strokeWidth="1" />
            <line x1="1140" y1="0" x2="1140" y2="900" stroke="rgba(200,190,175,0.12)" strokeWidth="1" />
          </svg>

          {/* Reception area placeholder */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 flex items-end justify-center pb-8 opacity-30">
            <div className="w-64 h-24 rounded-2xl glass-panel" />
          </div>

          {/* Ambient plants */}
          <div className="absolute left-8 bottom-0 opacity-20">
            <svg viewBox="0 0 80 200" className="w-20 h-48 sway">
              <path d="M40 200 C40 200 35 150 20 120 C5 90 10 60 30 50 C20 80 35 110 40 140" fill="#5a7a5f" />
              <path d="M40 200 C40 200 45 160 60 130 C75 100 70 65 50 55 C60 85 45 115 40 150" fill="#8fa888" />
              <path d="M40 200 L40 100" stroke="#5a7a5f" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <div className="absolute right-12 bottom-0 opacity-15">
            <svg viewBox="0 0 80 200" className="w-16 h-40 sway" style={{ animationDelay: '-3s' }}>
              <path d="M40 200 C40 200 35 160 15 135 C-5 110 5 75 25 65 C15 95 32 125 40 155" fill="#5a7a5f" />
              <path d="M40 200 C40 200 48 170 62 140 C76 110 68 78 48 68 C58 98 46 128 40 160" fill="#8fa888" />
              <path d="M40 200 L40 110" stroke="#5a7a5f" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </motion.div>

        {/* THE DOOR — centered */}
        <motion.div
          style={{ opacity: doorOpacity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* Door frame */}
          <div
            className="relative"
            style={{
              width: 'min(480px, 75vw)',
              height: 'min(680px, 85vh)',
            }}
          >
            {/* Frame border */}
            <div className="absolute inset-0 rounded-t-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(200,185,160,0.6), rgba(180,165,140,0.4))',
                border: '8px solid rgba(160,145,120,0.5)',
                boxShadow: '0 0 0 2px rgba(200,190,170,0.3), -4px 0 20px rgba(0,0,0,0.15), 4px 0 20px rgba(0,0,0,0.15)',
              }}
            />

            {/* Perspective container */}
            <div
              className="absolute inset-2 overflow-hidden rounded-t-md"
              style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
            >
              {/* Left door panel */}
              <motion.div
                style={{
                  rotateY: leftDoorRotate,
                  transformOrigin: 'left center',
                }}
                className="absolute left-0 top-0 w-1/2 h-full frosted-surface"
              >
                {/* Glass lines pattern */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-white/10"
                      style={{ left: `${(i + 1) * 16.67}%` }}
                    />
                  ))}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-b border-white/10"
                      style={{ top: `${(i + 1) * 12.5}%` }}
                    />
                  ))}
                </div>
                {/* Door handle */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-12 rounded-full bg-gradient-to-b from-champagne/80 to-champagne/40 border border-white/30" />
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-1.5 rounded-full bg-champagne/60" />
                </div>
              </motion.div>

              {/* Right door panel */}
              <motion.div
                style={{
                  rotateY: rightDoorRotate,
                  transformOrigin: 'right center',
                }}
                className="absolute right-0 top-0 w-1/2 h-full frosted-surface"
              >
                {/* Glass lines pattern */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-white/10"
                      style={{ left: `${(i + 1) * 16.67}%` }}
                    />
                  ))}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-b border-white/10"
                      style={{ top: `${(i + 1) * 12.5}%` }}
                    />
                  ))}
                </div>
                {/* Door handle */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-12 rounded-full bg-gradient-to-b from-champagne/80 to-champagne/40 border border-white/30" />
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-1.5 rounded-full bg-champagne/60" />
                </div>
              </motion.div>
            </div>

            {/* Logo on door glass */}
            <motion.div
              style={{ opacity: logoOpacity, scale: doorScale }}
              className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
            >
              {/* Logo mark */}
              <div className="mb-4">
                <svg viewBox="0 0 60 60" fill="none" className="w-16 h-16 drop-shadow-lg">
                  <circle cx="30" cy="30" r="24" stroke="rgba(90,122,95,0.6)" strokeWidth="1" />
                  <circle cx="30" cy="30" r="16" stroke="rgba(74,144,184,0.5)" strokeWidth="0.8" />
                  <path
                    d="M30 10 C30 10 42 20 42 30 C42 40 30 50 30 50 C30 50 18 40 18 30 C18 20 30 10 30 10Z"
                    stroke="rgba(143,168,136,0.7)" strokeWidth="1" fill="none"
                  />
                  <path
                    d="M10 30 C10 30 20 18 30 18 C40 18 50 30 50 30 C50 30 40 42 30 42 C20 42 10 30 10 30Z"
                    stroke="rgba(74,144,184,0.5)" strokeWidth="0.8" fill="none"
                  />
                  <circle cx="30" cy="30" r="3" fill="rgba(90,122,95,0.8)" />
                  <circle cx="30" cy="30" r="1.5" fill="rgba(74,144,184,0.9)" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-white/90 text-sm font-light tracking-[0.3em] uppercase mb-1 drop-shadow-md">
                  Boca Center
                </p>
                <p className="text-white/60 text-xs tracking-[0.2em] uppercase drop-shadow-md">
                  for Healthy Living
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Ambient light particles */}
        <motion.div style={{ y: particle1Y }} className="absolute top-1/3 left-1/4 w-1 h-1 rounded-full bg-sage-green/40 particle-float" />
        <motion.div style={{ y: particle2Y }} className="absolute top-1/2 right-1/3 w-0.5 h-0.5 rounded-full bg-blue-tech/50 particle-float" />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(20,15,10,0.55) 100%)',
          }}
        />

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ opacity: logoOpacity }}
          className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3 z-20"
        >
          <p className="text-white/50 text-xs tracking-[0.4em] uppercase">
            Welcome to
          </p>
          <h1 className="text-white/90 text-3xl md:text-5xl font-light tracking-widest text-center">
            A New Standard<br />
            <span className="text-gradient">in Wellness</span>
          </h1>
          <p className="text-white/40 text-sm tracking-widest mt-2">
            Scroll to Enter
          </p>
          <div className="scroll-bounce mt-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white/40">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
