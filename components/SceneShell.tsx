"use client";

import { useRef, type ReactNode } from "react";
import { useScroll, type MotionValue } from "framer-motion";

/**
 * Shared pinned-scene scaffolding: a tall section with a sticky
 * full-viewport stage inside, Apple-launch style. Children receive
 * the scene's own scroll progress (0 at scene entry, 1 at exit).
 */
export default function SceneShell({
  id,
  label,
  heightClass = "h-[180vh]",
  children,
}: {
  id: string;
  label: string;
  heightClass?: string;
  children: (progress: MotionValue<number>) => ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} id={id} aria-label={label} className={`relative ${heightClass}`}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {children(scrollYProgress)}
      </div>
    </section>
  );
}
