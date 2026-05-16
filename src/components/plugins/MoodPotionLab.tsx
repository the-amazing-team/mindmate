import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPluginData, savePluginData } from "@/services/plugins";
import type { Mood } from "@/lib/storybook-context";

interface Potion {
  id: string;
  name: string;
  mood: Mood;
  ingredients: string[];
  color: string;
  created: string;
}
interface PotionData {
  potions: Potion[];
}

const MOOD_COLORS: Record<Mood, string> = {
  calm: "oklch(0.78 0.08 230)",
  joy: "oklch(0.85 0.13 80)",
  hopeful: "oklch(0.78 0.1 155)",
  melancholy: "oklch(0.65 0.08 270)",
  anxious: "oklch(0.75 0.09 30)",
};

const INGREDIENT_OPTIONS: Record<Mood, string[]> = {
  calm: ["chamomile tea", "soft rain", "lavender", "silence", "a slow walk"],
  joy: ["sunshine", "laughter", "music", "favourite food", "good news"],
  hopeful: ["morning light", "a plan", "kind words", "progress", "rest"],
  melancholy: ["solitude", "old songs", "a good cry", "comfort food", "gentle company"],
  anxious: ["deep breaths", "grounding", "cold water", "movement", "a safe space"],
};

const MOOD_LABELS: Mood[] = ["calm", "joy", "hopeful", "melancholy", "anxious"];

export function MoodPotionLab() {
  const [potions, setPotions] = useState<Potion[]>([]);
  const [targetMood, setTargetMood] = useState<Mood>("calm");
  const [potionName, setPotionName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [brewing, setBrewing] = useState(false);
  const [brewedPotion, setBrewedPotion] = useState<Potion | null>(null);

  useEffect(() => {
    getPluginData<PotionData>("mood-potion-lab").then((d) => {
      if (d?.potions) setPotions(d.potions);
    });
  }, []);

  const toggleIngredient = (ing: string) => {
    setSelected((prev) => (prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]));
  };

  const brew = async () => {
    if (!selected.length || brewing) return;
    setBrewing(true);
    await new Promise((r) => setTimeout(r, 1500)); // brewing animation
    const potion: Potion = {
      id: crypto.randomUUID(),
      name: potionName || `${targetMood} potion`,
      mood: targetMood,
      ingredients: selected,
      color: MOOD_COLORS[targetMood],
      created: new Date().toISOString(),
    };
    const updated = [potion, ...potions];
    setPotions(updated);
    setBrewedPotion(potion);
    setSelected([]);
    setPotionName("");
    await savePluginData("mood-potion-lab", { potions: updated });
    setBrewing(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-4xl">⚗️</span>
        <div>
          <h3 className="display text-2xl text-ink">Mood Potion Lab</h3>
          <p className="handwritten text-ink-soft text-base">brew your emotional antidote —</p>
        </div>
      </div>

      {/* Target mood */}
      <div>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">I want to feel…</p>
        <div className="flex gap-2 flex-wrap">
          {MOOD_LABELS.map((m) => (
            <motion.button
              key={m}
              onClick={() => {
                setTargetMood(m);
                setSelected([]);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-full handwritten text-sm"
              style={{
                background:
                  targetMood === m
                    ? `linear-gradient(135deg, ${MOOD_COLORS[m]}, ${MOOD_COLORS[m]}aa)`
                    : "oklch(0.88 0.05 75 / 0.5)",
                color: targetMood === m ? "oklch(0.15 0.02 50)" : "var(--ink-soft)",
                boxShadow: targetMood === m ? `0 4px 12px ${MOOD_COLORS[m]}66` : "none",
              }}
            >
              {m}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">add ingredients</p>
        <div className="flex flex-wrap gap-2">
          {INGREDIENT_OPTIONS[targetMood].map((ing) => (
            <motion.button
              key={ing}
              onClick={() => toggleIngredient(ing)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 rounded-xl handwritten text-sm text-ink"
              style={{
                background: selected.includes(ing)
                  ? `${MOOD_COLORS[targetMood]}33`
                  : "oklch(0.92 0.04 80 / 0.6)",
                border: `1px solid ${selected.includes(ing) ? MOOD_COLORS[targetMood] + "88" : "transparent"}`,
              }}
            >
              {ing}
            </motion.button>
          ))}
        </div>
      </div>

      <input
        value={potionName}
        onChange={(e) => setPotionName(e.target.value)}
        placeholder="name your potion… (optional)"
        className="w-full bg-transparent handwritten text-lg text-ink placeholder:text-ink-soft/40 focus:outline-none border-b border-dashed border-ink-soft/20 py-1"
      />

      {/* Brew button */}
      <motion.button
        onClick={brew}
        disabled={!selected.length || brewing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-full text-ink handwritten text-xl disabled:opacity-40 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${MOOD_COLORS[targetMood]}, ${MOOD_COLORS[targetMood]}88)`,
        }}
      >
        {brewing ? (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ⚗️ brewing…
          </motion.span>
        ) : (
          "brew this potion ✦"
        )}
      </motion.button>

      {/* Brewed potion flash */}
      <AnimatePresence>
        {brewedPotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl text-center"
            style={{
              background: `${brewedPotion.color}22`,
              border: `1px solid ${brewedPotion.color}55`,
            }}
          >
            <p className="text-3xl mb-2">🧪</p>
            <p className="display text-lg text-ink">"{brewedPotion.name}" brewed!</p>
            <p className="handwritten text-ink-soft text-sm mt-1">
              {brewedPotion.ingredients.join(" · ")}
            </p>
            <button
              onClick={() => setBrewedPotion(null)}
              className="handwritten text-xs text-ink-soft/50 mt-3"
            >
              add to shelf
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Potion shelf */}
      {potions.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">potion shelf</p>
          <div className="flex flex-wrap gap-2">
            {potions.slice(0, 8).map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4, rotate: 5 }}
                className="flex flex-col items-center gap-1 cursor-default"
                title={p.ingredients.join(", ")}
              >
                <div
                  className="w-10 h-14 rounded-b-xl rounded-t-sm flex items-end justify-center pb-2 text-xl"
                  style={{
                    background: `linear-gradient(180deg, ${p.color}44, ${p.color}88)`,
                    border: `1px solid ${p.color}66`,
                  }}
                >
                  🧪
                </div>
                <span className="handwritten text-xs text-ink/60 text-center max-w-15 line-clamp-1">
                  {p.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
