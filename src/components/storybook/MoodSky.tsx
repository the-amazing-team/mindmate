import { motion, AnimatePresence } from "framer-motion";
import { moodPalette, type Mood } from "@/lib/storybook-context";

export function MoodSky({ mood }: { mood: Mood }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={mood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: moodPalette[mood].sky }}
        />
      </AnimatePresence>
      {/* slow drifting aurora veil */}
      <motion.div
        className="absolute inset-0 mix-blend-screen opacity-40"
        animate={{
          backgroundPosition: ["0% 0%", "100% 50%", "0% 100%", "0% 0%"],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{
          background: `radial-gradient(40% 30% at 20% 30%, ${moodPalette[mood].glow}, transparent 60%), radial-gradient(35% 25% at 80% 60%, ${moodPalette[mood].glow}, transparent 60%)`,
          backgroundSize: "200% 200%",
        }}
      />
    </div>
  );
}
