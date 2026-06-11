"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { bgStops } from "@/lib/scenes";
import Header from "@/components/Header";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";
import Scene1Beginning from "@/components/scenes/Scene1Beginning";
import Scene2DNA from "@/components/scenes/Scene2DNA";
import Scene3Bloodstream from "@/components/scenes/Scene3Bloodstream";
import Scene4Hormones from "@/components/scenes/Scene4Hormones";
import Scene5WeightLoss from "@/components/scenes/Scene5WeightLoss";
import Scene6Longevity from "@/components/scenes/Scene6Longevity";
import Scene7Regenerative from "@/components/scenes/Scene7Regenerative";
import Scene8Clinic from "@/components/scenes/Scene8Clinic";
import Scene9Doctor from "@/components/scenes/Scene9Doctor";
import Scene10Finale from "@/components/scenes/Scene10Finale";

/**
 * The full "Journey to Vitality": ten pinned scenes over a single
 * continuously-interpolated background that travels from pure black
 * to radiant warm white — darkness into light, illness into vitality.
 */
export default function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const backgroundColor = useTransform(
    scrollYProgress,
    bgStops.map((s) => s.at),
    bgStops.map((s) => s.color)
  );

  return (
    <div ref={ref} className="relative">
      {/* the journey's light: one smoothly blending background */}
      <motion.div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{ backgroundColor }}
      />
      <ScrollProgress />
      <Header />

      <main id="main">
        <Scene1Beginning />
        <Scene2DNA />
        <Scene3Bloodstream />
        <Scene4Hormones />
        <Scene5WeightLoss />
        <Scene6Longevity />
        <Scene7Regenerative />
        <Scene8Clinic />
        <Scene9Doctor />
        <Scene10Finale />
      </main>

      <Footer />
    </div>
  );
}
