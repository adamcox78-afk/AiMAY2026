"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Optional heartbeat ambience. Off by default; plays
 * /assets/heartbeat.mp3 if present and degrades silently if not.
 */
export default function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = new Audio("/assets/heartbeat.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.addEventListener("error", () => setAvailable(false));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  if (!available) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (on) {
      audio.pause();
      setOn(false);
    } else {
      audio
        .play()
        .then(() => setOn(true))
        .catch(() => setAvailable(false));
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute heartbeat sound" : "Play heartbeat sound"}
      className="absolute bottom-8 right-6 z-10 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/60 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white sm:right-10"
    >
      <span
        aria-hidden
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          on ? "heartbeat bg-[#c9a86a]" : "bg-white/40"
        }`}
      />
      {on ? "Sound on" : "Sound"}
    </button>
  );
}
