"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import { Eyebrow, Headline, Sub } from "@/components/SceneCopy";
import { sceneConfig } from "@/lib/scenes";

function Stage({ p }: { p: MotionValue<number> }) {
  const mediaOpacity = useTransform(p, [0, 0.18, 0.85, 1], [0, 0.9, 0.9, 0]);
  const mediaScale = useTransform(p, [0, 1], [1.12, 1]);
  const textOpacity = useTransform(p, [0.12, 0.3, 0.8, 0.96], [0, 1, 1, 0]);
  const textY = useTransform(p, [0.12, 0.34], [44, 0]);

  return (
    <>
      <motion.div style={{ opacity: mediaOpacity, scale: mediaScale }} className="absolute inset-0">
        <CinematicMedia
          id="scene5-movement-loop"
          alt="Slow-motion runner along the shoreline at dawn"
          palette={sceneConfig[5].palette}
          className="absolute inset-0"
          mask="wide"
          blend="screen"
          parallax={55}
        />
      </motion.div>

      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <Eyebrow>{sceneConfig[5].eyebrow}</Eyebrow>
        <Headline>Transformation beyond the scale.</Headline>
        <Sub className="mx-auto">
          Medical weight loss designed for lasting success and improved health.
        </Sub>
        <Sub className="mx-auto !mt-4 text-sm text-white/55 sm:text-base">
          Physician-guided weight management programs, tailored to your
          metabolism, your labs, and your life.
        </Sub>
      </motion.div>
    </>
  );
}

export default function Scene5WeightLoss() {
  return (
    <SceneShell id="scene-5" label="Medical weight loss" heightClass="h-[180vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
