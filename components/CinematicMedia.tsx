"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import manifest from "@/higgsfield/asset-manifest.json";
import AmbientLayer from "@/components/AmbientLayer";
import type { ScenePalette } from "@/lib/scenes";
import { useMotionPreference } from "@/lib/useMotionPreference";

type ManifestEntry = {
  id: string;
  scene: number;
  type: string;
  file: string;
  model: string;
  prompt: string;
  command: string;
  note?: string;
};

const entries = manifest as ManifestEntry[];

type Mask = "default" | "oval" | "wide";
const maskClass: Record<Mask, string> = {
  default: "feather-mask",
  oval: "feather-mask-oval",
  wide: "feather-mask-wide",
};

/**
 * The single gateway for all visual media. Looks up the Higgsfield
 * manifest by asset id; renders the generated video/image when the
 * file exists in /public, and falls back to a living procedural
 * ambient layer otherwise. Always feather-masked, blended and
 * optionally parallaxed — never a hard rectangle.
 */
export default function CinematicMedia({
  id,
  alt = "",
  palette,
  className = "",
  mask = "default",
  blend = "screen",
  parallax = 0,
}: {
  id: string;
  alt?: string;
  palette: ScenePalette;
  className?: string;
  mask?: Mask;
  blend?: "screen" | "lighten" | "multiply" | "normal";
  parallax?: number;
}) {
  const entry = entries.find((e) => e.id === id);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { parallaxEnabled } = useMotionPreference();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    parallaxEnabled ? [parallax, -parallax] : [0, 0]
  );

  const showFallback = !entry || failed;

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${maskClass[mask]} ${className}`}
      style={{
        y,
        mixBlendMode: blend === "normal" ? undefined : blend,
      }}
    >
      {showFallback ? (
        <AmbientLayer palette={palette} />
      ) : entry.type === "video" ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt || undefined}
          onError={() => setFailed(true)}
        >
          <source
            src={entry.file}
            type="video/mp4"
            onError={() => setFailed(true)}
          />
        </video>
      ) : (
        <Image
          src={entry.file}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </motion.div>
  );
}
