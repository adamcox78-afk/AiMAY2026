"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import { Eyebrow, Headline, Sub } from "@/components/SceneCopy";
import { sceneConfig } from "@/lib/scenes";

function Stage({ p }: { p: MotionValue<number> }) {
  const loopOpacity = useTransform(p, [0, 0.18, 0.85, 1], [0, 0.75, 0.75, 0]);
  const textOpacity = useTransform(p, [0.1, 0.28, 0.8, 0.96], [0, 1, 1, 0]);
  const textY = useTransform(p, [0.1, 0.32], [40, 0]);
  const deviceOpacity = useTransform(p, [0.28, 0.48, 0.88, 1], [0, 1, 1, 0]);
  const deviceScale = useTransform(p, [0.28, 0.6], [0.92, 1]);
  const deviceY = useTransform(p, [0.28, 1], [60, -40]);

  return (
    <>
      <motion.div style={{ opacity: loopOpacity }} className="absolute inset-0">
        <CinematicMedia
          id="scene7-renewal-loop"
          alt="Threads of pearlescent light weaving into stronger fibers"
          palette={sceneConfig[7].palette}
          className="absolute inset-0"
          mask="wide"
          blend="screen"
          parallax={40}
        />
      </motion.div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1.2fr_1fr]">
        <motion.div style={{ opacity: textOpacity, y: textY }}>
          <Eyebrow>{sceneConfig[7].eyebrow}</Eyebrow>
          <Headline>Regeneration powered by innovation.</Headline>
          <Sub>
            Advanced therapies designed to support the body&rsquo;s natural
            healing potential.
          </Sub>
          <p className="mt-10 font-display text-2xl font-light text-white sm:text-3xl">
            Alma TED™ Hair Restoration
          </p>
          <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-white/60 sm:text-base">
            Ultrasound-based, needle-free hair restoration — and additional
            advanced regenerative technologies, selected and overseen by our
            medical team.
          </p>
        </motion.div>

        <motion.div
          style={{ opacity: deviceOpacity, scale: deviceScale, y: deviceY }}
          className="relative mx-auto aspect-[4/5] w-3/4 max-w-sm md:w-full"
        >
          <CinematicMedia
            id="scene7-almated-still"
            alt="Alma TED hair-restoration device in dramatic studio lighting"
            palette={sceneConfig[7].palette}
            className="absolute inset-0"
            mask="oval"
            blend="screen"
            parallax={28}
          />
        </motion.div>
      </div>
    </>
  );
}

export default function Scene7Regenerative() {
  return (
    <SceneShell id="scene-7" label="Regenerative therapies" heightClass="h-[200vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
