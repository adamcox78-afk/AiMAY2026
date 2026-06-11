"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import { Eyebrow, Headline, Sub } from "@/components/SceneCopy";
import { sceneConfig } from "@/lib/scenes";

const PHILOSOPHY = [
  "Root-cause medicine, not symptom chasing",
  "Personalized care plans built from your biology",
  "A patient-first partnership at every step",
];

function PhilosophyLine({
  p,
  index,
  children,
}: {
  p: MotionValue<number>;
  index: number;
  children: string;
}) {
  const start = 0.4 + index * 0.08;
  const opacity = useTransform(p, [start, start + 0.08], [0, 1]);
  const x = useTransform(p, [start, start + 0.08], [22, 0]);
  return (
    <motion.li
      style={{ opacity, x }}
      className="flex items-baseline gap-4 text-base font-light text-[#3d362a]/85 sm:text-lg"
    >
      <span
        aria-hidden
        className="inline-block h-px w-7 shrink-0 translate-y-[-4px] bg-gradient-to-r from-[#a4823f] to-transparent"
      />
      {children}
    </motion.li>
  );
}

function Stage({ p }: { p: MotionValue<number> }) {
  const portraitOpacity = useTransform(p, [0.08, 0.3, 0.88, 1], [0, 1, 1, 0]);
  const portraitScale = useTransform(p, [0.08, 0.45], [1.08, 1]);
  const portraitY = useTransform(p, [0.08, 1], [50, -40]);
  const textOpacity = useTransform(p, [0.16, 0.34, 0.84, 0.97], [0, 1, 1, 0]);
  const textY = useTransform(p, [0.16, 0.38], [40, 0]);

  return (
    <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1fr_1.25fr]">
      <motion.div
        style={{ opacity: portraitOpacity, scale: portraitScale, y: portraitY }}
        className="relative mx-auto aspect-[4/5] w-2/3 max-w-xs md:w-full md:max-w-sm"
      >
        <CinematicMedia
          id="scene9-portrait-env-still"
          alt="Dr. Merna Matilsky in a warm, sunlit consultation office"
          palette={sceneConfig[9].palette}
          className="absolute inset-0"
          mask="oval"
          blend="multiply"
          parallax={26}
        />
      </motion.div>

      <motion.div style={{ opacity: textOpacity, y: textY }}>
        <Eyebrow tone="dark">{sceneConfig[9].eyebrow}</Eyebrow>
        <Headline tone="dark">Your health journey deserves a partner.</Headline>
        <Sub tone="dark">
          Dr. Merna Matilsky and the Boca Center team are committed to helping
          you uncover the root causes of health concerns and create a
          personalized path toward vitality.
        </Sub>
        <ul className="mt-9 space-y-4">
          {PHILOSOPHY.map((line, i) => (
            <PhilosophyLine key={line} p={p} index={i}>
              {line}
            </PhilosophyLine>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

export default function Scene9Doctor() {
  return (
    <SceneShell id="scene-9" label="Meet Dr. Merna Matilsky" heightClass="h-[200vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
