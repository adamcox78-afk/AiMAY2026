'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-12% 0px -12% 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word luxe headline reveal */
export function RevealHeadline({
  text,
  className = '',
  delay = 0,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-15% 0px -15% 0px' });
  const words = text.split(' ');
  return (
    <h2 ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="line-mask mr-[0.28em] inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1, delay: delay + i * 0.08, ease: EASE }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}
