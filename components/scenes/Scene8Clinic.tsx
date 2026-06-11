"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import { Eyebrow, Headline, Sub } from "@/components/SceneCopy";
import { sceneConfig } from "@/lib/scenes";

const MOMENTS: { title: string; copy: string; asset: string | null }[] = [
  {
    title: "Reception",
    copy: "You are welcomed by name, never by number.",
    asset: "scene8-reception-still",
  },
  {
    title: "Consultation",
    copy: "Unhurried conversations that begin with listening.",
    asset: "scene8-consult-still",
  },
  {
    title: "Treatment Suites",
    copy: "Advanced medicine in a setting designed for calm.",
    asset: "scene8-suite-still",
  },
  {
    title: "Your Care Team",
    copy: "A physician-led team invested in your long-term vitality.",
    asset: null,
  },
];

function Moment({
  p,
  index,
  title,
  copy,
  asset,
}: {
  p: MotionValue<number>;
  index: number;
  title: string;
  copy: string;
  asset: string | null;
}) {
  const start = 0.42 + index * 0.1;
  const opacity = useTransform(p, [start, start + 0.08], [0, 1]);
  const y = useTransform(p, [start, start + 0.08], [28, 0]);
  return (
    <motion.li style={{ opacity, y }} className="flex flex-col items-center text-center">
      {asset ? (
        <div className="relative mb-4 aspect-[3/2] w-full">
          <CinematicMedia
            id={asset}
            alt={`${title} at Boca Center for Healthy Living`}
            palette={sceneConfig[8].palette}
            className="absolute inset-0"
            blend="multiply"
            parallax={18}
          />
        </div>
      ) : (
        <div
          aria-hidden
          className="mb-4 flex aspect-[3/2] w-full items-center justify-center"
        >
          <span
            className="block h-24 w-24 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,106,0.55) 0%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        </div>
      )}
      <h3 className="font-display text-xl font-light text-[#231d14]">{title}</h3>
      <p className="mt-2 max-w-[16rem] text-sm font-light leading-relaxed text-[#3d362a]/75">
        {copy}
      </p>
    </motion.li>
  );
}

function Stage({ p }: { p: MotionValue<number> }) {
  const videoOpacity = useTransform(p, [0, 0.12, 0.3, 0.42], [0, 1, 1, 0.25]);
  const videoScale = useTransform(p, [0, 0.4], [1.08, 1]);
  const introOpacity = useTransform(p, [0.06, 0.18, 0.3, 0.4], [0, 1, 1, 0]);
  const gridOpacity = useTransform(p, [0.38, 0.48, 0.9, 1], [0, 1, 1, 0]);

  return (
    <>
      <motion.div style={{ opacity: videoOpacity, scale: videoScale }} className="absolute inset-0">
        <CinematicMedia
          id="scene8-walkthrough-video"
          alt="Frosted glass doors opening into a warm, sunlit clinic reception"
          palette={sceneConfig[8].palette}
          className="absolute inset-0"
          mask="wide"
          blend="multiply"
          parallax={45}
        />
      </motion.div>

      <motion.div
        style={{ opacity: introOpacity }}
        className="absolute inset-x-0 z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <Eyebrow tone="dark">{sceneConfig[8].eyebrow}</Eyebrow>
        <Headline tone="dark">Where science meets warmth.</Headline>
        <Sub tone="dark" className="mx-auto">
          Step through our doors and the journey becomes personal — a place
          built around your comfort, your privacy, and your goals.
        </Sub>
      </motion.div>

      <motion.ul
        style={{ opacity: gridOpacity }}
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-8 gap-y-10 px-6 lg:grid-cols-4"
      >
        {MOMENTS.map((m, i) => (
          <Moment key={m.title} p={p} index={i} {...m} />
        ))}
      </motion.ul>
    </>
  );
}

export default function Scene8Clinic() {
  return (
    <SceneShell id="scene-8" label="Enter Boca Center" heightClass="h-[260vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
