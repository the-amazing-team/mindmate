import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GratitudeJar } from "@/components/plugins/GratitudeJar";
import { SleepTracker } from "@/components/plugins/SleepTracker";
import { CBTRecord } from "@/components/plugins/CBTRecord";
import { AnxietyMonster } from "@/components/plugins/AnxietyMonster";
import { MoodPotionLab } from "@/components/plugins/MoodPotionLab";
import { FocusHourglass } from "@/components/plugins/FocusHourglass";

interface Plugin {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  color: string;
  component: React.ComponentType;
}

const PLUGINS: Plugin[] = [
  {
    id: "gratitude",
    name: "Gratitude Jar",
    emoji: "🫙",
    tagline: "fold in moments of thankfulness",
    color: "oklch(0.78 0.13 75)",
    component: GratitudeJar,
  },
  {
    id: "sleep",
    name: "Sleep Tracker",
    emoji: "🌙",
    tagline: "tend to your rest",
    color: "oklch(0.75 0.08 230)",
    component: SleepTracker,
  },
  {
    id: "cbt",
    name: "Thought Reframing",
    emoji: "🧠",
    tagline: "challenge the inner critic",
    color: "oklch(0.75 0.1 155)",
    component: CBTRecord,
  },
  {
    id: "monster",
    name: "Anxiety Monster",
    emoji: "👾",
    tagline: "name it to tame it",
    color: "oklch(0.72 0.12 25)",
    component: AnxietyMonster,
  },
  {
    id: "potions",
    name: "Mood Potion Lab",
    emoji: "⚗️",
    tagline: "brew your emotional antidote",
    color: "oklch(0.7 0.1 290)",
    component: MoodPotionLab,
  },
  {
    id: "focus",
    name: "Focus Hourglass",
    emoji: "⏳",
    tagline: "settle into deep presence",
    color: "oklch(0.7 0.1 230)",
    component: FocusHourglass,
  },
];

export function PluginsChapter() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = activeId ? PLUGINS.find((p) => p.id === activeId) : null;
  const ActiveComponent = active?.component ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="display text-4xl text-ink">The Apothecary</h2>
        <p className="handwritten text-ink-soft text-lg mt-1">
          enchanted tools for your healing journey —
        </p>
      </div>

      {/* Plugin cards grid */}
      <AnimatePresence mode="wait">
        {!activeId ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {PLUGINS.map((plugin, i) => (
              <motion.button
                key={plugin.id}
                onClick={() => setActiveId(plugin.id)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -5, boxShadow: `0 20px 40px ${plugin.color}44` }}
                whileTap={{ scale: 0.97 }}
                className="relative p-6 rounded-2xl text-left overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, oklch(0.96 0.04 80), oklch(0.9 0.06 75))",
                  boxShadow: `0 8px 24px oklch(0.2 0.05 50 / 0.15)`,
                  border: `1px solid ${plugin.color}33`,
                }}
              >
                {/* Subtle color accent */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-30"
                  style={{ background: plugin.color, transform: "translate(30%, -30%)" }}
                />

                <span className="text-5xl block mb-3">{plugin.emoji}</span>
                <h3 className="display text-xl text-ink mb-1">{plugin.name}</h3>
                <p className="handwritten text-ink-soft text-base">{plugin.tagline}</p>

                <div
                  className="mt-4 flex items-center gap-1.5 text-xs uppercase tracking-widest"
                  style={{ color: plugin.color }}
                >
                  <span>open</span>
                  <span>→</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={activeId}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            {/* Back button */}
            <motion.button
              onClick={() => setActiveId(null)}
              whileHover={{ x: -3 }}
              className="flex items-center gap-2 text-ink-soft hover:text-ink transition-colors mb-6"
            >
              <span className="text-sm">←</span>
              <span className="handwritten text-base">back to the apothecary</span>
            </motion.button>

            {/* Active plugin */}
            <div
              className="p-6 rounded-2xl"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.96 0.04 80 / 0.8), oklch(0.9 0.06 75 / 0.6))",
                boxShadow: "0 8px 32px oklch(0.2 0.05 50 / 0.2)",
              }}
            >
              {ActiveComponent && <ActiveComponent />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
