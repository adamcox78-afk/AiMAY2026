"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import { Eyebrow, Headline, Sub, GlowLabel } from "@/components/SceneCopy";
import { sceneConfig } from "@/lib/scenes";

const THEMES = [
  "Preventative medicine",
  "Functional medicine",
  "Longevity optimization",
  "Peak performance",
];

function Stage({ p }: { p: MotionValue<number> }) {
  const mediaOpacity = useTransform(p, [0, 0.18, 0.85, 1], [0, 0.85, 0.85, 0]);
  const textOpacity = useTransform(p, [0.1, 0.28, 0.8, 0.96], [0, 1, 1, 0]);
  const textY = useTransform(p, [0.1, 0.32], [40, 0]);
  const stillOpacity = useTransform(p, [0.3, 0.5, 0.88, 1], [0, 1, 1, 0]);
  const stillY = useTransform(p, [0.3, 1], [70, -50]);

  return (
    <>
      <motion.div style={{ opacity: mediaOpacity }} className="absolute inset-0">
        <CinematicMedia
          id="scene6-regeneration-loop"
          alt="Luminous cells renewing in soft pearl light"
          palette={sceneConfig[6].palette}
          className="absolute inset-0"
          mask="wide"
          blend="screen"
          parallax={40}
        />
      </motion.div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1fr_1.2fr]">
        <motion.div
          style={{ opacity: stillOpacity, y: stillY }}
          className="relative order-2 hidden aspect-[4/5] md:order-1 md:block"
        >
          <CinematicMedia
            id="scene6-activeaging-still"
            alt="A radiant couple cycling in morning light"
            palette={sceneConfig[6].palette}
            className="absolute inset-0"
            mask="oval"
            blend="lighten"
            parallax={32}
          />
        </motion.div>

        <motion.div style={{ opacity: textOpacity, y: textY }} className="order-1 md:order-2">
          <Eyebrow>{sceneConfig[6].eyebrow}</Eyebrow>
          <Headline>Living better, not simply longer.</Headline>
          <Sub>
            Our longevity approach helps you optimize health for the years
            ahead.
          </Sub>
          <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-5">
            {THEMES.map((t, i) => (
              <li key={t}>
                <GlowLabel delay={i * 0.12}>{t}</GlowLabel>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </>
  );
}

export default function Scene6Longevity() {
  return (
    <SceneShell id="scene-6" label="Longevity medicine" heightClass="h-[200vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
