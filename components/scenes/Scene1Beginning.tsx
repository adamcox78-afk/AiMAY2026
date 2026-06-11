"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import SoundToggle from "@/components/SoundToggle";
import { Eyebrow, Headline, Sub } from "@/components/SceneCopy";
import { sceneConfig } from "@/lib/scenes";

function Stage({ p }: { p: MotionValue<number> }) {
  // The cell awakens, then expands toward the DNA scene.
  const cellOpacity = useTransform(p, [0, 0.18, 0.75, 1], [0, 1, 1, 0]);
  const cellScale = useTransform(p, [0, 0.6, 1], [0.62, 1, 2.4]);
  const textOpacity = useTransform(p, [0.08, 0.25, 0.62, 0.8], [0, 1, 1, 0]);
  const textY = useTransform(p, [0.08, 0.3], [40, 0]);
  const pulseOpacity = useTransform(p, [0, 0.18], [1, 0]);

  return (
    <>
      {/* heartbeat pulse in darkness before the cell appears */}
      <motion.div
        aria-hidden
        style={{ opacity: pulseOpacity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="heartbeat h-44 w-44 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,168,106,0.5) 0%, rgba(201,168,106,0.12) 45%, transparent 70%)",
            filter: "blur(6px)",
          }}
        />
      </motion.div>

      <motion.div
        style={{ opacity: cellOpacity, scale: cellScale }}
        className="absolute inset-0"
      >
        <CinematicMedia
          id="scene1-cell-loop"
          alt="A single living cell glowing softly in darkness"
          palette={sceneConfig[1].palette}
          className="absolute inset-0"
          blend="screen"
        />
      </motion.div>

      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <Eyebrow>{sceneConfig[1].eyebrow}</Eyebrow>
        <Headline as="h1">Your health story begins with a single cell.</Headline>
        <Sub className="mx-auto">
          Every symptom. Every feeling. Every opportunity for healing begins
          beneath the surface.
        </Sub>
        <motion.span
          aria-hidden
          className="mt-12 inline-block text-[0.65rem] uppercase tracking-eyebrow text-white/40"
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Scroll to begin
        </motion.span>
      </motion.div>

      <SoundToggle />
    </>
  );
}

export default function Scene1Beginning() {
  return (
    <SceneShell id="scene-1" label="The Beginning" heightClass="h-[220vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
