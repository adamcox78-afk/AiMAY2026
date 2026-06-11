"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import SceneShell from "@/components/SceneShell";
import CinematicMedia from "@/components/CinematicMedia";
import { Eyebrow, Headline, Sub } from "@/components/SceneCopy";
import { sceneConfig, PHONE_DISPLAY, PHONE_TEL } from "@/lib/scenes";

function Stage({ p }: { p: MotionValue<number> }) {
  const bloomOpacity = useTransform(p, [0, 0.25, 1], [0, 0.85, 1]);
  const bloomScale = useTransform(p, [0, 1], [1.15, 1]);
  const logoOpacity = useTransform(p, [0.12, 0.3], [0, 1]);
  const logoY = useTransform(p, [0.12, 0.34], [30, 0]);
  const textOpacity = useTransform(p, [0.22, 0.42], [0, 1]);
  const textY = useTransform(p, [0.22, 0.45], [36, 0]);
  const ctaOpacity = useTransform(p, [0.32, 0.52], [0, 1]);

  return (
    <>
      <motion.div style={{ opacity: bloomOpacity, scale: bloomScale }} className="absolute inset-0">
        <CinematicMedia
          id="scene10-lightbloom-loop"
          alt="Radiant white-gold light blooming outward"
          palette={sceneConfig[10].palette}
          className="absolute inset-0"
          mask="wide"
          blend="multiply"
        />
      </motion.div>

      <div id="contact" className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div style={{ opacity: logoOpacity, y: logoY }}>
          <p className="font-display text-2xl tracking-[0.22em] text-[#231d14] sm:text-3xl">
            BOCA CENTER
          </p>
          <p className="mt-1 text-[0.65rem] uppercase tracking-eyebrow text-[#8a6d3b]">
            for Healthy Living
          </p>
        </motion.div>

        <motion.div style={{ opacity: textOpacity, y: textY }} className="mt-10">
          <Eyebrow tone="dark">{sceneConfig[10].eyebrow}</Eyebrow>
          <Headline tone="dark">Your journey to vitality starts here.</Headline>
          <Sub tone="dark" className="mx-auto">
            Take the first step toward a healthier, stronger, more vibrant
            future.
          </Sub>
        </motion.div>

        <motion.div
          style={{ opacity: ctaOpacity }}
          className="mt-12 flex flex-col items-center gap-5"
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <a
              href={PHONE_TEL}
              className="rounded-full bg-[#231d14] px-8 py-3.5 text-sm uppercase tracking-[0.16em] text-[#faf7f1] transition-transform duration-300 hover:scale-[1.03]"
            >
              Schedule Your Consultation
            </a>
            <a
              href="#scene-4"
              className="rounded-full border border-[#231d14]/30 px-8 py-3.5 text-sm uppercase tracking-[0.16em] text-[#231d14] transition-colors duration-300 hover:border-[#231d14]"
            >
              Explore Treatments
            </a>
          </div>
          <a
            href={PHONE_TEL}
            className="text-sm tracking-[0.08em] text-[#8a6d3b] underline-offset-4 hover:underline"
          >
            Call {PHONE_DISPLAY}
          </a>
        </motion.div>
      </div>
    </>
  );
}

export default function Scene10Finale() {
  return (
    <SceneShell id="scene-10" label="Your journey begins" heightClass="h-[180vh]">
      {(p) => <Stage p={p} />}
    </SceneShell>
  );
}
