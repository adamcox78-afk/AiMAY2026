'use client';

import { useEffect, useRef } from 'react';

/**
 * Scene 2 — a rotating DNA double helix whose base pairs illuminate as the
 * user scrolls. `progress` (0..1) drives how many genes have lit up.
 */
export default function DnaCanvas({ progress = 0 }: { progress?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const prog = useRef(progress);
  prog.current = progress;

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

    const RUNGS = 34;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const amp = Math.min(w * 0.16, 150 * dpr);
      const lit = Math.floor(prog.current * RUNGS);

      for (let i = 0; i < RUNGS; i++) {
        const f = i / RUNGS;
        const y = f * h;
        const phase = f * Math.PI * 4 + t;
        const x1 = cx + Math.sin(phase) * amp;
        const x2 = cx + Math.sin(phase + Math.PI) * amp;
        const depth = (Math.cos(phase) + 1) / 2; // 0..1 front/back
        const on = i <= lit;

        // rung
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.lineWidth = (1 + depth) * dpr;
        ctx.strokeStyle = on
          ? `rgba(216,184,115,${0.35 + depth * 0.5})`
          : `rgba(159,194,214,${0.08 + depth * 0.12})`;
        ctx.stroke();

        // nodes
        const nodeR = (2 + depth * 3) * dpr;
        [x1, x2].forEach((x) => {
          ctx.beginPath();
          ctx.arc(x, y, nodeR, 0, Math.PI * 2);
          if (on) {
            const g = ctx.createRadialGradient(x, y, 0, x, y, nodeR * 4);
            g.addColorStop(0, `rgba(231,207,148,${0.5 + depth * 0.4})`);
            g.addColorStop(1, 'rgba(231,207,148,0)');
            ctx.fillStyle = g;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, nodeR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(247,238,214,${0.7 + depth * 0.3})`;
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(159,194,214,${0.2 + depth * 0.25})`;
            ctx.fill();
          }
        });
      }

      t += 0.012;
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
