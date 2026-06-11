'use client';

import { useEffect, useRef } from 'react';

/**
 * Scene 1 — a single luminous cell drifting in black, pulsing to a heartbeat.
 * Pure canvas; respects reduced-motion; cheap enough for mobile.
 */
export default function CellCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    // organelle dots inside the cell
    const organelles = Array.from({ length: 26 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 0.2 + Math.random() * 0.6,
      s: 0.4 + Math.random() * 1.6,
      o: 0.2 + Math.random() * 0.5,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      // heartbeat envelope (~1.6s)
      const beat =
        Math.pow(Math.sin(t * 1.9), 12) * 0.06 +
        Math.pow(Math.sin(t * 1.9 + 0.5), 12) * 0.03;
      const baseR = Math.min(w, h) * 0.26 * (1 + beat);

      // outer membrane glow
      const glow = ctx.createRadialGradient(cx, cy, baseR * 0.3, cx, cy, baseR * 1.9);
      glow.addColorStop(0, 'rgba(216,184,115,0.18)');
      glow.addColorStop(0.4, 'rgba(159,194,214,0.10)');
      glow.addColorStop(1, 'rgba(10,14,18,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // membrane
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const wobble = 1 + Math.sin(a * 5 + t) * 0.012 + Math.cos(a * 3 - t * 0.7) * 0.014;
        const x = Math.cos(a) * baseR * wobble;
        const y = Math.sin(a) * baseR * wobble;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      const mem = ctx.createRadialGradient(0, 0, baseR * 0.2, 0, 0, baseR);
      mem.addColorStop(0, 'rgba(247,244,239,0.10)');
      mem.addColorStop(0.7, 'rgba(199,162,75,0.08)');
      mem.addColorStop(1, 'rgba(159,194,214,0.16)');
      ctx.fillStyle = mem;
      ctx.fill();
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeStyle = 'rgba(216,184,115,0.35)';
      ctx.stroke();

      // nucleus
      const nr = baseR * 0.4;
      const nuc = ctx.createRadialGradient(0, 0, 0, 0, 0, nr);
      nuc.addColorStop(0, 'rgba(231,207,148,0.55)');
      nuc.addColorStop(0.6, 'rgba(199,162,75,0.22)');
      nuc.addColorStop(1, 'rgba(199,162,75,0)');
      ctx.beginPath();
      ctx.arc(0, 0, nr, 0, Math.PI * 2);
      ctx.fillStyle = nuc;
      ctx.fill();

      // organelles
      organelles.forEach((o) => {
        const x = Math.cos(o.a + t * 0.15 * o.s) * baseR * o.r * 0.8;
        const y = Math.sin(o.a + t * 0.15 * o.s) * baseR * o.r * 0.8;
        ctx.beginPath();
        ctx.arc(x, y, o.s * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(247,244,239,${o.o * (0.6 + beat * 4)})`;
        ctx.fill();
      });
      ctx.restore();

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="h-full w-full" />;
}
