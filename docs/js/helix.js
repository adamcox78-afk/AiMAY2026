/* ===========================================================
   DNAHelix — a scroll-driven double-helix "tunnel" on a 2D canvas.
   The camera flies forward (+z) through a spiral of base pairs;
   each service "station" lights up as its chapter becomes active.
   No dependencies, no WebGL — runs anywhere.
   =========================================================== */

const TWIST = Math.PI / 5;        // rotation between consecutive base pairs
const SPACING = 1.0;              // world distance between base pairs (z)
const R = 1.18;                   // helix radius (world units)
const NEAR = 0.55;                // near clip plane
const FAR = 24;                   // far clip plane / fog distance
const NODE_R = 0.075;             // base-pair node radius (world)
const SECTION_DEPTH = 7;          // world depth allotted to each chapter
const FOCUS_Z = 3.0;              // where a station sits when its chapter is centered

// neon palette (rgb)
const C_CYAN = [56, 225, 255];
const C_VIOLET = [138, 108, 255];
const C_MAGENTA = [255, 95, 214];
const C_AMBER = [255, 180, 84];
const ACCENTS = { cyan: C_CYAN, violet: C_VIOLET, magenta: C_MAGENTA, amber: C_AMBER };

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export class DNAHelix {
  constructor(canvas, { stations = 6, accents = [] } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stationCount = stations;
    this.accents = accents;                  // per-station accent name
    this.totalDepth = stations * SECTION_DEPTH;

    this.progress = 0;      // 0..1 journey progress -> camera depth
    this.focus = 0;         // active station index
    this.focusGlow = 0;     // animated glow amount for focused station
    this.time = 0;
    this.reduced = false;
    this.needsRender = true;
    this.particles = [];

    this._raf = null;
    this._loop = this._loop.bind(this);
    this.resize();
  }

  /* --- public API ----------------------------------------- */
  setProgress(p) { this.progress = clamp(p, 0, 1); this.needsRender = true; }
  setFocus(i) { this.focus = clamp(i, 0, this.stationCount - 1); this.needsRender = true; }
  setReducedMotion(on) { this.reduced = on; this.needsRender = true; }

  start() { if (!this._raf) this._raf = requestAnimationFrame(this._loop); }
  stop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.focal = this.h * 0.6;
    this.cx = this.w / 2;
    this.cy = this.h * 0.46;
    this._seedParticles();
    this.needsRender = true;
  }

  _seedParticles() {
    const count = this.w < 700 ? 60 : 130;
    this.particles = Array.from({ length: count }, () => ({
      a: Math.random() * Math.PI * 2,
      rad: R * (1.4 + Math.random() * 3.2),
      z: Math.random() * FAR,
      warm: Math.random() < 0.25,
      size: 0.5 + Math.random() * 1.6,
    }));
  }

  /* --- geometry ------------------------------------------- */
  _project(worldX, worldY, relZ) {
    const z = Math.max(relZ, NEAR);
    const s = this.focal / z;
    return { x: this.cx + worldX * s, y: this.cy + worldY * s, s };
  }

  _stationZ(i) { return (i + 0.5) * SECTION_DEPTH + FOCUS_Z; }

  _strandPoint(k, phase, rot) {
    const a = k * TWIST + rot + phase;
    return { x: Math.cos(a) * R, y: Math.sin(a) * R };
  }

  /* --- render --------------------------------------------- */
  render() {
    const ctx = this.ctx;
    const camDepth = this.progress * this.totalDepth;
    const rot = this.time * 0.00022;

    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'lighter';   // additive neon glow

    this._renderParticles(ctx, camDepth);

    const kMin = Math.floor((camDepth + NEAR) / SPACING);
    const kMax = Math.ceil((camDepth + FAR) / SPACING);

    // station depths -> which base pair index is each station nearest
    const stationK = [];
    for (let i = 0; i < this.stationCount; i++) stationK[i] = Math.round(this._stationZ(i) / SPACING);

    let prevA = null, prevB = null, prevK = null;
    for (let k = kMax; k >= kMin; k--) {
      const relZ = k * SPACING - camDepth;
      const fog = clamp((FAR - relZ) / (FAR * 0.6), 0, 1) * clamp((relZ - NEAR) / 1.2, 0, 1);
      if (fog <= 0.01) { prevA = prevB = null; continue; }

      // colour shifts along the strand for a living gradient
      const hueT = (Math.sin(k * 0.25) + 1) / 2;
      const baseCol = mix(C_CYAN, C_VIOLET, hueT);

      const A = this._strandPoint(k, 0, rot);
      const B = this._strandPoint(k, Math.PI, rot);
      const pa = this._project(A.x, A.y, relZ);
      const pb = this._project(B.x, B.y, relZ);

      // backbone ribbons (connect to previous, adjacent base pair)
      if (prevA && prevK === k + 1) {
        ctx.lineWidth = clamp(pa.s * 0.05, 0.6, 6);
        ctx.strokeStyle = rgba(baseCol, 0.5 * fog);
        ctx.beginPath(); ctx.moveTo(prevA.x, prevA.y); ctx.lineTo(pa.x, pa.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(prevB.x, prevB.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      }

      // rung (base-pair bond)
      ctx.lineWidth = clamp(pa.s * 0.03, 0.4, 4);
      ctx.strokeStyle = rgba(mix(baseCol, C_MAGENTA, 0.3), 0.28 * fog);
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();

      // is this a station base pair?
      const stIdx = stationK.indexOf(k);
      const isStation = stIdx !== -1;
      const isFocus = isStation && stIdx === this.focus;
      const accent = isStation ? (ACCENTS[this.accents[stIdx]] || C_CYAN) : null;

      this._node(ctx, pa, baseCol, fog, isStation, isFocus, accent);
      this._node(ctx, pb, baseCol, fog, isStation, isFocus, accent);

      prevA = pa; prevB = pb; prevK = k;
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  _node(ctx, p, baseCol, fog, isStation, isFocus, accent) {
    let r = NODE_R * p.s;
    let col = baseCol;
    let glow = r * 1.8;

    if (isStation) {
      col = accent;
      r *= isFocus ? 1.9 + this.focusGlow * 0.6 : 1.35;
      glow = r * (isFocus ? 3.4 : 2.2);
    }
    r = clamp(r, 0.5, 60);

    ctx.shadowBlur = clamp(glow, 0, 60);
    ctx.shadowColor = rgba(col, 0.9 * fog);
    ctx.fillStyle = rgba(col, (isStation ? 0.95 : 0.8) * fog);
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();

    if (isFocus) {                                   // pulsing focus ring
      ctx.shadowBlur = 0;
      ctx.lineWidth = clamp(r * 0.18, 1, 4);
      ctx.strokeStyle = rgba(accent, (0.4 + this.focusGlow * 0.4) * fog);
      ctx.beginPath(); ctx.arc(p.x, p.y, r * (1.8 + this.focusGlow * 0.5), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  _renderParticles(ctx, camDepth) {
    for (const pt of this.particles) {
      let relZ = pt.z - (camDepth % FAR);
      if (relZ < NEAR) relZ += FAR;                  // recycle to the far end
      const fog = clamp((FAR - relZ) / FAR, 0, 1) * clamp((relZ - NEAR) / 2, 0, 1);
      if (fog <= 0.01) continue;
      const wx = Math.cos(pt.a) * pt.rad;
      const wy = Math.sin(pt.a) * pt.rad;
      const p = this._project(wx, wy, relZ);
      const col = pt.warm ? C_AMBER : C_CYAN;
      ctx.shadowBlur = 6 * fog;
      ctx.shadowColor = rgba(col, fog);
      ctx.fillStyle = rgba(col, 0.5 * fog);
      ctx.beginPath(); ctx.arc(p.x, p.y, pt.size * p.s * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  /* --- loop ----------------------------------------------- */
  _loop(now) {
    this._raf = requestAnimationFrame(this._loop);
    const dt = this._last ? now - this._last : 16;
    this._last = now;

    // ease the focus-glow pulse
    const target = Math.sin(now * 0.003) * 0.5 + 0.5;
    this.focusGlow += (target - this.focusGlow) * 0.08;

    if (this.reduced) {
      if (!this.needsRender) return;          // honour reduced-motion: render only on change
      this.time = 0;
      this.render();
      this.needsRender = false;
      return;
    }
    this.time += dt;
    this.render();
  }
}
