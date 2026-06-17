/* ===========================================================
   main.js — wires scroll, the DNA helix (3D with 2D fallback),
   and content reveals.
   =========================================================== */
import { DNAHelix } from './helix.js';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav = $('#nav');

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

const canvas = $('#helix-canvas');
const chapters = $$('.chapter');
const accents = chapters.map((c) => c.dataset.accent || 'cyan');
let helix = null;   // assigned async below; usages are guarded with helix?.

/* --------------- scroll -> camera depth + rail ----------- */
const journey = $('#journey');
const railFill = $('#rail-fill');
const railPct = $('#rail-pct');

function onScroll() {
  if (journey) {
    const rect = journey.getBoundingClientRect();
    const total = journey.offsetHeight || 1;
    const p = clamp((window.innerHeight * 0.5 - rect.top) / total, 0, 1);
    helix?.setProgress(p);
  }
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docH > 0 ? clamp(window.scrollY / docH, 0, 1) : 0;
  if (railFill) railFill.style.height = `${(pct * 100).toFixed(1)}%`;
  if (railPct) railPct.textContent = `${String(Math.round(pct * 100)).padStart(2, '0')}%`;
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => helix?.resize(), 150);
});

/* ------------- chapter reveal + helix focus -------------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-active'); });
  let best = null;
  $$('.chapter').forEach((ch) => {
    const r = ch.getBoundingClientRect();
    const center = Math.abs(r.top + r.height / 2 - window.innerHeight / 2);
    if (!best || center < best.dist) best = { el: ch, dist: center };
  });
  if (best) helix?.setFocus(Number(best.el.dataset.station) || 0);
}, { threshold: [0.25, 0.5, 0.75], rootMargin: '-10% 0px -10% 0px' });
chapters.forEach((c) => observer.observe(c));

/* --------------------- nav interactions ------------------ */
const navToggle = $('#nav-toggle');
const navLinks = $('.nav__links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});
$$('.nav__links a').forEach((a) => a.addEventListener('click', () => {
  navLinks.classList.remove('is-open');
  navToggle.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

/* ------------------ animated stat counters --------------- */
const statObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    $$('.stat__num', e.target).forEach(countUp);
    obs.unobserve(e.target);
  });
}, { threshold: 0.4 });
const science = $('#science');
if (science) statObserver.observe(science);

function countUp(el) {
  const target = Number(el.dataset.count) || 0;
  if (reducedMotion) { el.textContent = format(target); return; }
  const dur = 1500;
  const start = performance.now();
  const tick = (now) => {
    const t = clamp((now - start) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const format = (n) => n.toLocaleString('en-US');

/* ----------------------- lead form ----------------------- */
const form = $('#lead-form');
const note = $('#form-note');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !validEmail) {
    note.style.color = 'var(--magenta)';
    note.textContent = 'Please add your name and a valid email.';
    return;
  }
  note.style.color = 'var(--cyan)';
  note.textContent = "Thank you — we'll reach out within one business day. (Demo form: connect this to your CRM or email service.)";
  form.reset();
});

/* --------------------------- misc ------------------------ */
$('#year').textContent = new Date().getFullYear();

/* ---------- boot the helix: 3D (WebGL) with 2D fallback --- */
(async () => {
  if (!reducedMotion && supportsWebGL()) {
    try {
      const { DNAHelix3D } = await import('./helix3d.js');
      const h = new DNAHelix3D(canvas, { stations: chapters.length, accents });
      await h.ready;                       // throws if init fails -> fall back
      helix = h;
      document.documentElement.classList.add('webgl');
    } catch (err) {
      console.warn('[helix] 3D unavailable, using 2D canvas fallback:', err);
      helix = null;
    }
  }
  if (!helix) {
    helix = new DNAHelix(canvas, { stations: chapters.length, accents });
    helix.setReducedMotion(reducedMotion);
  }
  helix.start();
  helix.setFocus(0);
  onScroll();
})();
