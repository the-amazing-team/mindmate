import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Music, Volume2, VolumeX } from "lucide-react";

type TimerMode = "focus" | "short" | "long";

const MODES: Record<TimerMode, { label: string; time: number; color: string }> = {
  focus: { label: "Deep Focus", time: 25 * 60, color: "oklch(0.7 0.1 230)" },
  short: { label: "Quick Breath", time: 5 * 60, color: "oklch(0.78 0.13 75)" },
  long: { label: "Deep Rest", time: 15 * 60, color: "oklch(0.65 0.08 180)" },
};

const AMBIENT_TRACKS = [
  { name: "Lofi Rain", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }, // Placeholder
  { name: "Quiet Forest", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
];

export function FocusHourglass() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time);
  const [isActive, setIsActive] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a gentle chime if we had audio context
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (musicPlaying && !muted) {
      audioRef.current?.play().catch(() => setMusicPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [musicPlaying, muted]);

  const reset = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">⏳</span>
          <div>
            <h3 className="display text-2xl text-ink">Focus Hourglass</h3>
            <p className="handwritten text-ink-soft text-base">time for your spirit to settle —</p>
          </div>
        </div>
        
        {/* Music toggle */}
        <div className="flex items-center gap-2">
           <audio 
            ref={audioRef}
            src="https://assets.mixkit.co/music/preview/mixkit-lo-fi-night-vibes-924.mp3" 
            loop 
          />
          <button
            onClick={() => setMusicPlaying(!musicPlaying)}
            className="p-2 rounded-full glass hover:scale-110 transition-transform"
            style={{ color: musicPlaying ? "var(--gold)" : "var(--ink-soft)" }}
          >
            <Music className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-full glass hover:scale-110 transition-transform"
          >
            {muted ? <VolumeX className="w-5 h-5 text-ink-soft" /> : <Volume2 className="w-5 h-5 text-gold" />}
          </button>
        </div>
      </div>

      {/* Mode selection */}
      <div className="flex gap-2 justify-center">
        {(Object.keys(MODES) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setIsActive(false);
              setTimeLeft(MODES[m].time);
            }}
            className="px-4 py-2 rounded-full handwritten text-sm transition-all"
            style={{
              background: mode === m ? MODES[m].color : "transparent",
              color: mode === m ? "white" : "var(--ink-soft)",
              border: mode === m ? "none" : "1px solid oklch(0.2 0.05 50 / 0.1)",
            }}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="relative flex flex-col items-center justify-center py-10">
        {/* Animated Hourglass Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
           <motion.div 
            animate={{ rotate: isActive ? [0, 180] : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 border-4 border-ink rounded-full flex flex-col overflow-hidden"
           >
              <div className="flex-1 bg-ink w-full" style={{ height: `${(timeLeft / MODES[mode].time) * 100}%` }} />
              <div className="flex-1 w-full" />
           </motion.div>
        </div>

        <motion.div
          key={timeLeft}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="display text-7xl text-ink tracking-tighter"
        >
          {formatTime(timeLeft)}
        </motion.div>
        
        <p className="handwritten text-ink-soft/60 text-lg mt-2 italic">
          {isActive ? "the sand is flowing…" : "resting at the narrow neck"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          onClick={reset}
          whileHover={{ rotate: -90 }}
          whileTap={{ scale: 0.9 }}
          className="p-4 rounded-full glass text-ink-soft"
        >
          <RotateCcw className="w-6 h-6" />
        </motion.button>

        <motion.button
          onClick={() => setIsActive(!isActive)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-20 h-20 rounded-full flex items-center justify-center text-white"
          style={{ 
            background: isActive ? "oklch(0.5 0.05 50)" : "var(--gradient-gold)",
            boxShadow: isActive ? "none" : "0 8px 30px oklch(0.78 0.13 75 / 0.4)"
          }}
        >
          {isActive ? <Pause className="w-8 h-8" fill="currentColor" /> : <Play className="w-8 h-8 translate-x-0.5" fill="currentColor" />}
        </motion.button>

        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>

      {/* Bottom hint */}
      <AnimatePresence>
        {musicPlaying && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="handwritten text-xs text-ink/40">
              currently playing: <span className="text-gold">Lofi Ethereal Vibes</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
