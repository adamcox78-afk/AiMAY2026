"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import { Eyebrow, Headline, Sub, GlowLabel } from "@/components/SceneCopy";
import { sceneConfig } from "@/lib/scenes";

const THEMES = [
  "Oxygen transport",
  "Nutrient delivery",
  "Inflammation reduction",
  "Cellular optimization",
];

function Stage({ p }: { p: MotionValue<number> }) {
  const mediaOpacity = useTransform(p, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const mediaScale = useTransform(p, [0, 1], [1.2, 1.02]);
  const textOpacity = useTransform(p, [0.12, 0.3, 0.8, 0.96], [0, 1, 1, 0]);
  const textY = useTransform(p, [0.12, 0.35], [44, 0]);

  return (
    <>
      <motion.div style={{ opacity: mediaOpacity, scale: mediaScale }} className="absolute inset-0">
        <CinematicMedia
          id="scene3-bloodstream-loop"
          alt="First-person view gliding through a warm, glowing bloodstream"
          palette={sceneConfig[3].palette}
          className="absolute inset-0"
          mask="wide"
          blend="screen"
          parallax={60}
        />
      </motion.div>

      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <Eyebrow>{sceneConfig[3].eyebrow}</Eyebrow>
        <Headline>True wellness starts from within.</Headline>
        <Sub className="mx-auto">
          The body has an extraordinary ability to heal when given the right
          support.
        </Sub>
        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {THEMES.map((t, i) => (
            <li key={t}>
              <GlowLabel delay={i * 0.15}>{t}</GlowLabel>
            </li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}

export default function Scene3Bloodstream() {
  return (
    <SceneShell id="scene-3" label="Inside the body" heightClass="h-[200vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
