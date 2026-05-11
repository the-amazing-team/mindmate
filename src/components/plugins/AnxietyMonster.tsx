import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPluginData, savePluginData } from "@/services/plugins";

interface MonsterData {
  name: string;
  level: number;
  lastFed: string | null;
  tamingNotes: string[];
}

const MONSTER_LEVELS = [
  { level: 0, emoji: "🥚", desc: "dormant", color: "oklch(0.88 0.05 75)" },
  { level: 1, emoji: "🐣", desc: "hatching", color: "oklch(0.82 0.09 60)" },
  { level: 2, emoji: "👾", desc: "restless", color: "oklch(0.75 0.1 25)" },
  { level: 3, emoji: "😤", desc: "agitated", color: "oklch(0.7 0.12 15)" },
  { level: 4, emoji: "🌪️", desc: "raging", color: "oklch(0.65 0.14 5)" },
  { level: 5, emoji: "🌊", desc: "tsunami", color: "oklch(0.55 0.15 360)" },
];

const TAMING_ACTIONS = [
  { label: "breathe slowly", effect: -1, emoji: "🌬️" },
  { label: "write in journal", effect: -1, emoji: "✍️" },
  { label: "drink water", effect: -0.5, emoji: "💧" },
  { label: "take a walk", effect: -1, emoji: "🚶" },
  { label: "call someone", effect: -1.5, emoji: "📞" },
];

const DEFAULT: MonsterData = { name: "Anxious", level: 2, lastFed: null, tamingNotes: [] };

export function AnxietyMonster() {
  const [data, setData] = useState<MonsterData>(DEFAULT);
  const [tamedMsg, setTamedMsg] = useState<string | null>(null);

  useEffect(() => {
    getPluginData<MonsterData>("anxiety-monster").then((d) => {
      if (d) setData(d);
    });
  }, []);

  const persist = async (updated: MonsterData) => {
    setData(updated);
    await savePluginData("anxiety-monster", updated);
  };

  const feed = async () => {
    const updated = {
      ...data,
      level: Math.min(5, data.level + 1),
      lastFed: new Date().toISOString(),
    };
    await persist(updated);
  };

  const tame = async (action: (typeof TAMING_ACTIONS)[number]) => {
    const newLevel = Math.max(0, data.level + action.effect);
    const note = `${action.emoji} ${action.label} — ${new Date().toLocaleDateString()}`;
    const updated = {
      ...data,
      level: newLevel,
      tamingNotes: [note, ...data.tamingNotes.slice(0, 9)],
    };
    await persist(updated);
    setTamedMsg(`${action.emoji} The monster calmed a little.`);
    setTimeout(() => setTamedMsg(null), 3000);
  };

  const cur = MONSTER_LEVELS[Math.round(Math.min(5, Math.max(0, data.level)))];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-4xl">👾</span>
        <div>
          <h3 className="display text-2xl text-ink">Anxiety Monster</h3>
          <p className="handwritten text-ink-soft text-base">name it to tame it —</p>
        </div>
      </div>

      {/* Monster display */}
      <div
        className="flex flex-col items-center py-6 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${cur.color}33, transparent 70%)`,
          border: `1px solid ${cur.color}55`,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1], y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="text-8xl mb-3 select-none"
        >
          {cur.emoji}
        </motion.div>
        <p className="display text-2xl text-ink">
          {data.name} · {cur.desc}
        </p>
        <div className="flex gap-1 mt-3">
          {MONSTER_LEVELS.map((_, i) => (
            <div
              key={i}
              className="w-5 h-2 rounded-full transition-all"
              style={{ background: i <= data.level ? cur.color : "oklch(0.88 0.05 75 / 0.4)" }}
            />
          ))}
        </div>
        <p className="handwritten text-ink-soft/60 text-sm mt-2">
          anxiety level {Math.round(data.level)} / 5
        </p>
      </div>

      {/* Name editor */}
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-ink/50 shrink-0">
          monster's name:
        </span>
        <input
          value={data.name}
          onChange={(e) => persist({ ...data, name: e.target.value })}
          className="flex-1 bg-transparent handwritten text-xl text-ink focus:outline-none border-b border-dashed border-ink-soft/25 py-0.5"
        />
      </div>

      {/* Taming actions */}
      <div>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">tame it with</p>
        <div className="flex flex-wrap gap-2">
          {TAMING_ACTIONS.map((a) => (
            <motion.button
              key={a.label}
              onClick={() => tame(a)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 rounded-xl handwritten text-sm text-ink"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.92 0.06 155 / 0.5), oklch(0.85 0.08 130 / 0.4))",
                border: "1px solid oklch(0.78 0.07 155 / 0.4)",
              }}
            >
              {a.emoji} {a.label}
            </motion.button>
          ))}
          <motion.button
            onClick={feed}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-xl handwritten text-sm text-ink"
            style={{
              background: "oklch(0.7 0.12 25 / 0.2)",
              border: "1px solid oklch(0.7 0.12 25 / 0.3)",
            }}
          >
            🍖 feed it (acknowledge)
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {tamedMsg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="handwritten text-ink-soft text-base text-center"
          >
            {tamedMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {data.tamingNotes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">taming history</p>
          <div className="space-y-1">
            {data.tamingNotes.slice(0, 4).map((n, i) => (
              <p key={i} className="handwritten text-ink-soft text-sm">
                {n}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
