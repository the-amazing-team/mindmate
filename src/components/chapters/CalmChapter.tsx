import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logBreathingSession } from "@/services/plugins";
import { useStorybook } from "@/lib/storybook-context";

type BreathingPattern = {
  name: string;
  description: string;
  phases: { label: string; duration: number; scale: number }[];
  color: string;
  mood: string;
};

const PATTERNS: BreathingPattern[] = [
  {
    name: "4-7-8",
    description: "Activates your parasympathetic system — perfect for anxiety.",
    phases: [
      { label: "breathe in", duration: 4000, scale: 1.45 },
      { label: "hold", duration: 7000, scale: 1.45 },
      { label: "breathe out", duration: 8000, scale: 1 },
    ],
    color: "oklch(0.78 0.08 230)",
    mood: "anxious",
  },
  {
    name: "box breathing",
    description: "Used by Navy SEALs to find calm under pressure.",
    phases: [
      { label: "breathe in", duration: 4000, scale: 1.4 },
      { label: "hold", duration: 4000, scale: 1.4 },
      { label: "breathe out", duration: 4000, scale: 1 },
      { label: "hold empty", duration: 4000, scale: 1 },
    ],
    color: "oklch(0.78 0.1 155)",
    mood: "calm",
  },
  {
    name: "gentle breath",
    description: "Slow, simple, restorative. For winding down.",
    phases: [
      { label: "breathe in", duration: 5000, scale: 1.35 },
      { label: "breathe out", duration: 7000, scale: 1 },
    ],
    color: "oklch(0.78 0.13 75)",
    mood: "melancholy",
  },
];

const GROUNDING_STEPS = [
  "5 things you can see",
  "4 things you can touch",
  "3 things you can hear",
  "2 things you can smell",
  "1 thing you can taste",
];

export function CalmChapter() {
  const { mood } = useStorybook();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(PATTERNS[0]);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionSaved, setSessionSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-select pattern based on mood
  useEffect(() => {
    const match = PATTERNS.find((p) => p.mood === mood);
    if (match) setSelectedPattern(match);
  }, [mood]);

  useEffect(() => {
    if (!active) return;
    const cur = selectedPattern.phases[phase];
    timerRef.current = setTimeout(() => {
      const nextPhase = (phase + 1) % selectedPattern.phases.length;
      setPhase(nextPhase);
      if (nextPhase === 0) setCycles((c) => c + 1);
    }, cur.duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, phase, selectedPattern]);

  const handleStart = () => {
    setActive(true);
    setPhase(0);
    setCycles(0);
    setSessionStart(Date.now());
    setSessionSaved(false);
  };

  const handleStop = async () => {
    setActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (sessionStart && cycles > 0) {
      const duration = Math.round((Date.now() - sessionStart) / 1000);
      await logBreathingSession({
        session_type: selectedPattern.name,
        duration_seconds: duration,
        completed_cycles: cycles,
        calming_score: Math.min(10, cycles * 1.5),
      });
      setSessionSaved(true);
    }
    setSessionStart(null);
    setCycles(0);
  };

  const cur = selectedPattern.phases[phase];

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
      {/* Left panel */}
      <div>
        <h2 className="display text-4xl text-ink mb-2">Safe Space</h2>
        <p className="handwritten text-ink-soft text-xl mb-6">when the world spins too fast —</p>

        {/* Pattern selector */}
        <div className="space-y-2 mb-8">
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-3">choose your breath</p>
          {PATTERNS.map((p) => (
            <motion.button
              key={p.name}
              onClick={() => {
                setSelectedPattern(p);
                setActive(false);
                setPhase(0);
              }}
              whileHover={{ x: 4 }}
              className="w-full text-left p-4 rounded-xl transition-all"
              style={{
                background:
                  selectedPattern.name === p.name
                    ? "linear-gradient(135deg, oklch(0.96 0.04 80), oklch(0.9 0.06 75))"
                    : "transparent",
                border: `1px solid ${selectedPattern.name === p.name ? "oklch(0.78 0.13 75 / 0.4)" : "oklch(0.5 0.05 50 / 0.12)"}`,
                boxShadow:
                  selectedPattern.name === p.name ? "0 4px 16px oklch(0.2 0.05 50 / 0.15)" : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: p.color }}
                />
                <div>
                  <p className="handwritten text-lg text-ink">{p.name}</p>
                  <p className="text-xs text-ink-soft/70">{p.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* 5-4-3-2-1 grounding */}
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-3">5-4-3-2-1 grounding</p>
          <div className="space-y-2.5">
            {GROUNDING_STEPS.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-3 handwritten text-lg text-ink"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: "var(--gold)" }}
                />
                {s}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: breathing orb */}
      <div className="relative flex flex-col items-center justify-center min-h-110">
        {/* Halo rings */}
        {[1, 2, 3].map((r) => (
          <motion.span
            key={r}
            className="absolute rounded-full border"
            animate={
              active
                ? { scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }
                : { scale: 1, opacity: 0.12 }
            }
            transition={{ duration: 4, repeat: Infinity, delay: r * 0.6 }}
            style={{
              width: 160 + r * 80,
              height: 160 + r * 80,
              borderColor: selectedPattern.color,
            }}
          />
        ))}

        {/* Main orb */}
        <motion.button
          onClick={active ? handleStop : handleStart}
          animate={{ scale: active ? cur.scale : 1 }}
          transition={{ duration: active ? cur.duration / 1000 : 0.5, ease: "easeInOut" }}
          className="relative w-44 h-44 rounded-full flex flex-col items-center justify-center text-ink"
          style={{
            background: `radial-gradient(circle at 35% 35%, oklch(0.95 0.05 230), ${selectedPattern.color})`,
            boxShadow: `0 0 80px ${selectedPattern.color}99, 0 0 40px ${selectedPattern.color}55`,
          }}
        >
          <span className="display text-xl text-ink">{active ? cur.label : "begin"}</span>
          {active && cycles > 0 && (
            <span className="handwritten text-sm text-ink/70 mt-1">
              {cycles} cycle{cycles !== 1 ? "s" : ""}
            </span>
          )}
        </motion.button>

        {/* Phase timer bar */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 w-48 h-1.5 rounded-full overflow-hidden"
              style={{ background: "oklch(0.88 0.05 75 / 0.5)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: selectedPattern.color }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                key={`${phase}-${active}`}
                transition={{ duration: cur.duration / 1000, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-5 handwritten text-ink-soft text-base text-center">
          {active
            ? `${selectedPattern.name} · tap the crystal to stop`
            : "tap the crystal to begin"}
        </p>

        {/* Session saved confirmation */}
        <AnimatePresence>
          {sessionSaved && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-center"
            >
              <p className="handwritten text-ink-soft/70 text-sm">
                ✦ {cycles} breath cycle{cycles !== 1 ? "s" : ""} logged · your body thanks you
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
