/* ===========================================================
   DNAHelix3D — a true WebGL double-helix "tunnel" (Three.js).
   The camera flies along the helix axis; service "stations"
   light up as their chapter becomes active.
   Mirrors the DNAHelix (2D) API: setProgress / setFocus /
   setReducedMotion / start / stop / resize — so main.js can
   swap between 2D and 3D transparently.
   =========================================================== */
import * as THREE from 'three';

const STN_DEPTH = 9;             // world depth allotted to each chapter
const SPACING = 0.6;            // distance between base pairs (z)
const TWIST = Math.PI / 6;       // rotation between base pairs (30 deg)
const R = 2.3;                   // helix radius
const FOCUS_Z = 6;               // where a station sits when its chapter is centered
const BUFFER = 22;               // extra helix past the last station

const COL = { cyan: 0x38e1ff, violet: 0x8a6cff, magenta: 0xff5fd6, amber: 0xffb454, bg: 0x04060f };
const ACCENTS = { cyan: COL.cyan, violet: COL.violet, magenta: COL.magenta, amber: COL.amber };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export class DNAHelix3D {
  constructor(canvas, { stations = 6, accents = [] } = {}) {
    this.canvas = canvas;
    this.stationCount = stations;
    this.accentNames = accents;
    this.totalDepth = stations * STN_DEPTH;

    this.target = 0;     // scroll progress 0..1
    this.depth = 0;      // eased camera depth (world)
    this.focus = 0;
    this.reduced = false;
    this.time = 0;
    this._raf = null;
    this._last = 0;
    this.stations = [];

    this._frame = this._frame.bind(this);
    this.ready = this._init();   // resolves once the scene is built; rejects -> 2D fallback
  }

  async _init() {
    const w = (this.w = window.innerWidth);
    const h = (this.h = window.innerHeight);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(COL.bg, 0.026);

    this.camera = new THREE.PerspectiveCamera(62, w / h, 0.1, 400);
    this.camera.position.set(0, 0, 0);

    this.scene.add(new THREE.AmbientLight(0x2a3a6a, 0.7));
    this.pl1 = new THREE.PointLight(COL.cyan, 55, 45);
    this.pl2 = new THREE.PointLight(COL.magenta, 45, 45);
    this.focusLight = new THREE.PointLight(COL.cyan, 0, 32);
    this.scene.add(this.pl1, this.pl2, this.focusLight);

    this._buildHelix();
    this._buildParticles();
    await this._initBloom();     // optional; degrades to plain render
    return true;
  }

  _stationZ(i) { return (i + 0.5) * STN_DEPTH + FOCUS_Z; }

  _buildHelix() {
    const count = Math.ceil((this.totalDepth + BUFFER) / SPACING);
    const Apts = [], Bpts = [];
    for (let i = 0; i <= count; i++) {
      const a = i * TWIST, z = i * SPACING;
      Apts.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, z));
      Bpts.push(new THREE.Vector3(Math.cos(a + Math.PI) * R, Math.sin(a + Math.PI) * R, z));
    }
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // --- backbone ribbons (lit tubes give the real 3D shading) ---
    const matA = new THREE.MeshStandardMaterial({ color: 0x0a2a44, emissive: COL.cyan, emissiveIntensity: 0.7, metalness: 0.5, roughness: 0.35, toneMapped: false });
    const matB = new THREE.MeshStandardMaterial({ color: 0x1a0a44, emissive: COL.violet, emissiveIntensity: 0.7, metalness: 0.5, roughness: 0.35, toneMapped: false });
    this.group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Apts), count * 2, 0.075, 8, false), matA));
    this.group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Bpts), count * 2, 0.075, 8, false), matB));

    // --- base-pair nodes (instanced additive glow, colour gradient) ---
    const nodeMat = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 10, 10), nodeMat, (count + 1) * 2);
    const m = new THREE.Matrix4(), col = new THREE.Color(), violet = new THREE.Color(COL.violet);
    let idx = 0;
    for (let i = 0; i <= count; i++) {
      const t = (Math.sin(i * 0.25) + 1) / 2;
      col.setHex(COL.cyan).lerp(violet, t);
      m.setPosition(Apts[i]); nodes.setMatrixAt(idx, m); nodes.setColorAt(idx, col); idx++;
      m.setPosition(Bpts[i]); nodes.setMatrixAt(idx, m); nodes.setColorAt(idx, col); idx++;
    }
    nodes.instanceMatrix.needsUpdate = true;
    if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
    this.group.add(nodes);

    // --- rungs (base-pair bonds) ---
    const pos = [];
    for (let i = 0; i <= count; i++) pos.push(Apts[i].x, Apts[i].y, Apts[i].z, Bpts[i].x, Bpts[i].y, Bpts[i].z);
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    this.group.add(new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: COL.cyan, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));

    // --- station markers: a ring you fly through + a glowing orb ---
    for (let s = 0; s < this.stationCount; s++) {
      const z = this._stationZ(s);
      const accent = ACCENTS[this.accentNames[s]] || COL.cyan;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(R * 1.3, 0.05, 10, 60),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      ring.position.z = z;
      const orbPos = Apts[Math.min(Math.round(z / SPACING), count)];
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 16, 16),
        new THREE.MeshBasicMaterial({ color: accent, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      orb.position.copy(orbPos);
      this.group.add(ring, orb);
      this.stations.push({ ring, orb, accent, pos: orbPos.clone() });
    }
  }

  _buildParticles() {
    const n = this.w < 700 ? 180 : 380;
    const pos = new Float32Array(n * 3), colA = new Float32Array(n * 3);
    const cyan = new THREE.Color(COL.cyan), amber = new THREE.Color(COL.amber);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, rad = R * (1.4 + Math.random() * 3.4);
      pos[i * 3] = Math.cos(a) * rad;
      pos[i * 3 + 1] = Math.sin(a) * rad;
      pos[i * 3 + 2] = Math.random() * (this.totalDepth + BUFFER);
      const c = Math.random() < 0.25 ? amber : cyan;
      colA[i * 3] = c.r; colA[i * 3 + 1] = c.g; colA[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colA, 3));
    const mat = new THREE.PointsMaterial({ size: 0.16, map: this._dotTexture(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, toneMapped: false });
    this.particles = new THREE.Points(g, mat);
    this.scene.add(this.particles);
  }

  _dotTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    const grd = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = grd;
    x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  async _initBloom() {
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'),
        import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/UnrealBloomPass.js'),
        import('three/addons/postprocessing/OutputPass.js'),
      ]);
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(this.w, this.h), 0.85, 0.55, 0.18);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
    } catch (e) {
      this.composer = null;
      console.warn('[helix3d] bloom disabled:', e?.message || e);
    }
  }

  /* ---------------------- public API ---------------------- */
  setProgress(p) { this.target = clamp(p, 0, 1); }
  setFocus(i) {
    this.focus = clamp(i, 0, this.stationCount - 1);
    const st = this.stations[this.focus];
    if (st && this.focusLight) this.focusLight.color.setHex(st.accent);
  }
  setReducedMotion(on) { this.reduced = !!on; }
  start() { if (!this._raf) this._raf = requestAnimationFrame(this._frame); }
  stop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; }

  resize() {
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.renderer.setSize(this.w, this.h, false);
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
    if (this.composer) this.composer.setSize(this.w, this.h);
    if (this.bloom) this.bloom.setSize(this.w, this.h);
  }

  /* ------------------------- loop ------------------------- */
  _frame(now) {
    this._raf = requestAnimationFrame(this._frame);
    const dt = this._last ? now - this._last : 16;
    this._last = now;
    this.time += dt;
    const t = this.time;

    // ease the camera forward through the tunnel
    this.depth += (this.target * this.totalDepth - this.depth) * 0.06;
    const swayX = this.reduced ? 0 : Math.sin(t * 0.0004) * 0.6;
    const swayY = this.reduced ? 0 : Math.cos(t * 0.00052) * 0.4;
    this.camera.position.set(swayX, swayY, this.depth);
    this.camera.lookAt(swayX * 0.4, swayY * 0.4, this.depth + 12);
    if (!this.reduced) this.group.rotation.z = t * 0.00006;

    this.pl1.position.set(swayX + 3, swayY + 2.2, this.depth + 5);
    this.pl2.position.set(swayX - 3, swayY - 2.2, this.depth + 9);

    // station highlight + reveal spotlight
    const pulse = (Math.sin(t * 0.004) + 1) / 2;
    for (let i = 0; i < this.stations.length; i++) {
      const st = this.stations[i], on = i === this.focus;
      st.ring.material.opacity = on ? 0.55 + pulse * 0.4 : 0.2;
      st.ring.scale.setScalar(on ? 1 + pulse * 0.12 : 1);
      st.orb.material.opacity = on ? 0.9 : 0.45;
      st.orb.scale.setScalar(on ? 1.2 + pulse * 0.3 : 1);
    }
    const fs = this.stations[this.focus];
    if (fs) {
      this.focusLight.position.lerp(fs.pos, 0.1);
      this.focusLight.intensity += ((30 + pulse * 25) - this.focusLight.intensity) * 0.1;
    }
    if (!this.reduced && this.particles) this.particles.rotation.z = -t * 0.00004;

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }
}
