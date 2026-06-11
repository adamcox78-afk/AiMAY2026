"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import { Eyebrow, Headline, Sub } from "@/components/SceneCopy";
import { sceneConfig } from "@/lib/scenes";

const GENE_COUNT = 14;

function GeneNode({
  p,
  index,
}: {
  p: MotionValue<number>;
  index: number;
}) {
  const start = 0.22 + (index / GENE_COUNT) * 0.45;
  const opacity = useTransform(p, [start, start + 0.05], [0.12, 1]);
  const scale = useTransform(p, [start, start + 0.05], [0.6, 1]);
  return (
    <motion.span
      aria-hidden
      style={{ opacity, scale }}
      className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
    >
      <span
        className="block h-full w-full rounded-full bg-[#e9cf9a]"
        style={{ boxShadow: "0 0 14px 4px rgba(201,168,106,0.55)" }}
      />
    </motion.span>
  );
}

function Stage({ p }: { p: MotionValue<number> }) {
  const mediaOpacity = useTransform(p, [0, 0.18, 0.85, 1], [0, 1, 1, 0]);
  const mediaScale = useTransform(p, [0, 1], [1.15, 1]);
  const textOpacity = useTransform(p, [0.12, 0.3, 0.78, 0.95], [0, 1, 1, 0]);
  const textY = useTransform(p, [0.12, 0.35], [40, 0]);

  return (
    <>
      <motion.div style={{ opacity: mediaOpacity, scale: mediaScale }} className="absolute inset-0">
        <CinematicMedia
          id="scene2-dna-loop"
          alt="A DNA double helix forming, genes illuminating one by one"
          palette={sceneConfig[2].palette}
          className="absolute inset-0"
          blend="screen"
          parallax={50}
        />
      </motion.div>

      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <Eyebrow>{sceneConfig[2].eyebrow}</Eyebrow>
        <Headline>Every symptom has an origin.</Headline>
        <Sub className="mx-auto">We don&rsquo;t chase symptoms. We uncover causes.</Sub>

        {/* genes illuminating with scroll */}
        <div className="mt-12 flex items-center justify-center gap-3 sm:gap-4" aria-hidden>
          {Array.from({ length: GENE_COUNT }, (_, i) => (
            <GeneNode key={i} p={p} index={i} />
          ))}
        </div>
      </motion.div>
    </>
  );
}

export default function Scene2DNA() {
  return (
    <SceneShell id="scene-2" label="DNA and root cause" heightClass="h-[200vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
