'use client';

import { useEffect, useRef } from 'react';

type Palette = 'blood' | 'hormone' | 'longevity';

const PALETTES: Record<Palette, string[]> = {
  blood: ['#b5453d', '#d8736b', '#e3a59f', '#9fc2d6'],
  hormone: ['#e7cf94', '#c7a24b', '#9fb29a', '#9fc2d6'],
  longevity: ['#d8b873', '#9fb29a', '#6e8268', '#f3e4bf'],
};

/**
 * Shared particle-flow field used for Scenes 3 (bloodstream), 4 (hormone
 * signaling) and 5 (longevity regeneration). Particles drift along a gentle
 * current with soft bloom — cellular communication / oxygen delivery feel.
 */
export default function FlowCanvas({
  palette = 'blood',
  direction = 'right',
  density = 90,
}: {
  palette?: Palette;
  direction?: 'right' | 'up' | 'radial';
  density?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = PALETTES[palette];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    type P = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      c: string;
      o: number;
      pulse: number;
    };
    const make = (): P => {
      const speed = (0.3 + Math.random() * 1.2) * dpr;
      let vx = 0;
      let vy = 0;
      if (direction === 'right') {
        vx = speed;
        vy = (Math.random() - 0.5) * 0.4 * dpr;
      } else if (direction === 'up') {
        vy = -speed;
        vx = (Math.random() - 0.5) * 0.4 * dpr;
      } else {
        const a = Math.random() * Math.PI * 2;
        vx = Math.cos(a) * speed * 0.5;
        vy = Math.sin(a) * speed * 0.5;
      }
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: (1 + Math.random() * 4) * dpr,
        vx,
        vy,
        c: colors[Math.floor(Math.random() * colors.length)],
        o: 0.25 + Math.random() * 0.5,
        pulse: Math.random() * Math.PI * 2,
      };
    };

    let particles: P[] = Array.from({ length: density }, make);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        // recycle off-screen
        if (p.x > w + 40) p.x = -40;
        if (p.x < -40) p.x = w + 40;
        if (p.y > h + 40) p.y = -40;
        if (p.y < -40) p.y = h + 40;

        const pr = p.r * (1 + Math.sin(p.pulse) * 0.2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 5);
        g.addColorStop(0, hexA(p.c, p.o));
        g.addColorStop(1, hexA(p.c, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pr * 5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [palette, direction, density]);

  return <canvas ref={ref} className="h-full w-full" />;
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
