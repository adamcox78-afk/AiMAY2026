'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export default function Scene6CTA() {
  const ref = useRef<HTMLDivElement>(null)
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', interest: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 18 })
  const bgScale = useTransform(smooth, [0, 1], [1.1, 1])
  const opacity = useTransform(smooth, [0, 0.15], [0, 1])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section
      ref={ref}
      id="contact"
      className="relative min-h-screen scene overflow-hidden"
    >
      {/* Background */}
      <motion.div
        style={{ scale: bgScale }}
        className="absolute inset-0 origin-center"
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, #1a2415 0%, #1e2a20 30%, #1a2030 70%, #151a25 100%)',
          }}
        />
        {/* Organic shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(143,168,136,0.5), transparent 70%)' }}
          />
          <div
            className="absolute top-1/3 -left-32 w-80 h-80 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(74,144,184,0.5), transparent 70%)' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(200,169,110,0.5), transparent 70%)' }}
          />
        </div>

        {/* Fine grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1440 900">
          <defs>
            <pattern id="ctaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(143,168,136,0.3)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1440" height="900" fill="url(#ctaGrid)" />
        </svg>
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-sage-green/50" />
            <span className="text-xs tracking-[0.4em] uppercase text-sage-green/60">Patient Suite</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-sage-green/50" />
          </div>
          <h2 className="text-5xl md:text-7xl font-light text-white/90 mb-6 leading-tight">
            Begin Your<br />
            <span className="text-gradient">Transformation</span>
          </h2>
          <p className="text-white/40 text-lg font-light max-w-xl mx-auto leading-relaxed">
            Take the first step toward optimal health. Book a comprehensive consultation with our team and discover what's possible for your wellness journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="glass-panel rounded-3xl p-8"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {!submitted ? (
              <>
                <h3 className="text-white/80 text-xl font-light mb-8 tracking-wide">Book a Consultation</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/30 text-xs tracking-widest uppercase block mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full rounded-xl px-4 py-3 text-white/70 text-sm placeholder-white/20 outline-none focus:border-sage-green/50 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="text-white/30 text-xs tracking-widest uppercase block mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        placeholder="(561) 000-0000"
                        className="w-full rounded-xl px-4 py-3 text-white/70 text-sm placeholder-white/20 outline-none focus:border-sage-green/50 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/30 text-xs tracking-widest uppercase block mb-2">Email</label>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full rounded-xl px-4 py-3 text-white/70 text-sm placeholder-white/20 outline-none focus:border-sage-green/50 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                  <div>
                    <label className="text-white/30 text-xs tracking-widest uppercase block mb-2">Primary Interest</label>
                    <select
                      value={formState.interest}
                      onChange={(e) => setFormState({ ...formState, interest: e.target.value })}
                      className="w-full rounded-xl px-4 py-3 text-white/70 text-sm outline-none transition-colors"
                      style={{ background: 'rgba(30,32,45,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="">Select a service...</option>
                      <option value="hormone">Hormone Optimization</option>
                      <option value="weight">Weight Management</option>
                      <option value="longevity">Longevity Medicine</option>
                      <option value="iv">IV Therapy</option>
                      <option value="recovery">Recovery Technologies</option>
                      <option value="general">General Wellness</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/30 text-xs tracking-widest uppercase block mb-2">Message</label>
                    <textarea
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Tell us about your health goals..."
                      rows={4}
                      className="w-full rounded-xl px-4 py-3 text-white/70 text-sm placeholder-white/20 outline-none resize-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="cta-btn w-full py-4 rounded-xl text-white font-medium tracking-widest uppercase text-sm mt-2"
                    style={{
                      background: 'linear-gradient(135deg, #5a7a5f, #4a90b8)',
                      boxShadow: '0 8px 32px rgba(74,144,184,0.3)',
                    }}
                  >
                    Request Consultation
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(143,168,136,0.2)', border: '1px solid rgba(143,168,136,0.4)' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                    <path d="M5 12l5 5L20 7" stroke="#8fa888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-white/80 text-2xl font-light mb-3">Request Received</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Thank you for reaching out. Our team will contact you within 24 hours to schedule your comprehensive consultation.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Contact info */}
            <div className="glass-panel rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <h3 className="text-white/60 text-xs tracking-[0.4em] uppercase mb-5">Contact Information</h3>
              <div className="space-y-4">
                {[
                  { icon: '📍', label: 'Location', value: 'Boca Raton, Florida' },
                  { icon: '📞', label: 'Phone', value: '(561) 989-5558' },
                  { icon: '✉️', label: 'Email', value: 'info@bocamed.com' },
                  { icon: '🕐', label: 'Hours', value: 'Mon–Fri: 9am–5pm' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="text-white/30 text-xs uppercase tracking-widest">{item.label}</div>
                      <div className="text-white/60 text-sm">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why choose us */}
            <div className="glass-panel rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <h3 className="text-white/60 text-xs tracking-[0.4em] uppercase mb-5">Why Boca Center</h3>
              <div className="space-y-3">
                {[
                  'Board-certified physicians & practitioners',
                  'Evidence-based, individualized protocols',
                  'Cutting-edge diagnostic technologies',
                  'Integrative approach to root-cause healing',
                  'Concierge-level, unhurried consultations',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full border border-sage-green/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-sage-green/60" />
                    </div>
                    <span className="text-white/50 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video testimonial placeholder */}
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{
                height: '180px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M8 6l10 6-10 6V6z" fill="rgba(255,255,255,0.2)" />
                  </svg>
                </div>
                <p className="text-white/20 text-xs tracking-widest">Patient Testimonial Video</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social proof / accreditations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-20 pt-16 border-t border-white/8"
        >
          <p className="text-center text-white/20 text-xs tracking-[0.4em] uppercase mb-8">
            Certifications & Affiliations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {['A4M', 'IFM', 'BHRT Certified', 'The Metabolic Institute', 'Age Management Medicine'].map((cert) => (
              <div key={cert} className="text-white/25 text-sm tracking-wider font-light">{cert}</div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer
        className="relative border-t py-8"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-sage-green/60" />
            </div>
            <span className="text-white/30 text-xs tracking-widest">Boca Center for Healthy Living</span>
          </div>
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Boca Center for Healthy Living. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'HIPAA', 'Accessibility'].map((link) => (
              <a key={link} href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors tracking-wider">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </section>
  )
}
