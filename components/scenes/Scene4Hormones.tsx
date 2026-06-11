"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import { Eyebrow, Headline, Sub } from "@/components/SceneCopy";
import { sceneConfig } from "@/lib/scenes";

const FEATURES = [
  "EvexiPEL® Pellet Therapy",
  "Bio-Identical Hormone Replacement",
  "Men's Optimization",
  "Women's Optimization",
];

function FeatureLine({
  p,
  index,
  children,
}: {
  p: MotionValue<number>;
  index: number;
  children: string;
}) {
  const start = 0.34 + index * 0.07;
  const opacity = useTransform(p, [start, start + 0.07], [0, 1]);
  const x = useTransform(p, [start, start + 0.07], [24, 0]);
  return (
    <motion.li
      style={{ opacity, x }}
      className="flex items-baseline gap-4 text-lg font-light text-white/85 sm:text-xl"
    >
      <span
        aria-hidden
        className="inline-block h-px w-8 shrink-0 translate-y-[-4px] bg-gradient-to-r from-[#d9a441] to-transparent"
      />
      {children}
    </motion.li>
  );
}

function Stage({ p }: { p: MotionValue<number> }) {
  const mediaOpacity = useTransform(p, [0, 0.15, 0.88, 1], [0, 0.95, 0.95, 0]);
  const textOpacity = useTransform(p, [0.1, 0.28, 0.82, 0.97], [0, 1, 1, 0]);
  const textY = useTransform(p, [0.1, 0.32], [40, 0]);
  const stillOpacity = useTransform(p, [0.25, 0.45, 0.88, 1], [0, 1, 1, 0]);
  const stillY = useTransform(p, [0.25, 1], [60, -40]);

  return (
    <>
      <motion.div style={{ opacity: mediaOpacity }} className="absolute inset-0">
        <CinematicMedia
          id="scene4-hormone-loop"
          alt="Golden endocrine pathways illuminating across the body"
          palette={sceneConfig[4].palette}
          className="absolute inset-0"
          mask="wide"
          blend="screen"
          parallax={40}
        />
      </motion.div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1.2fr_1fr]">
        <motion.div style={{ opacity: textOpacity, y: textY }}>
          <Eyebrow>{sceneConfig[4].eyebrow}</Eyebrow>
          <Headline>Restore balance. Reclaim vitality.</Headline>
          <Sub>Hormones influence how you think, feel, perform, and age.</Sub>
          <ul className="mt-10 space-y-5">
            {FEATURES.map((f, i) => (
              <FeatureLine key={f} p={p} index={i}>
                {f}
              </FeatureLine>
            ))}
          </ul>
        </motion.div>

        <motion.div
          style={{ opacity: stillOpacity, y: stillY }}
          className="relative hidden aspect-[4/5] md:block"
        >
          <CinematicMedia
            id="scene4-vitality-still"
            alt="A vibrant woman laughing in warm golden-hour light"
            palette={sceneConfig[4].palette}
            className="absolute inset-0"
            mask="oval"
            blend="lighten"
            parallax={30}
          />
        </motion.div>
      </div>
    </>
  );
}

export default function Scene4Hormones() {
  return (
    <SceneShell id="scene-4" label="Hormone optimization" heightClass="h-[200vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
