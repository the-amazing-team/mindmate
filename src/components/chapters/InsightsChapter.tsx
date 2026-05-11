import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Moon, Flame } from "lucide-react";
import { moodPalette, type Mood } from "@/lib/storybook-context";
import { getMoodHistory, type MoodEntry } from "@/services/mood";
import { trackMood } from "@/services/mood";
import { useStorybook } from "@/lib/storybook-context";
import { getJournalEntries, type JournalEntry } from "@/services/journal";
import { getPluginData } from "@/services/plugins";
import { Heart, Activity, Book, Award, Smile } from "lucide-react";

const MOOD_EMOJIS: Record<Mood, string> = {
  calm: "💙",
  joy: "☀️",
  melancholy: "🌧️",
  anxious: "🌪️",
  hopeful: "🌱",
};

const MOOD_LABELS: Mood[] = ["calm", "joy", "melancholy", "anxious", "hopeful"];

export function InsightsChapter() {
  const { mood, setMood } = useStorybook();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(3);
  const [gratitudeCount, setGratitudeCount] = useState(0);
  const [potionsCount, setPotionsCount] = useState(0);

  useEffect(() => {
    const loadAll = async () => {
      const [moods, journals, gratitude, potions] = await Promise.all([
        getMoodHistory(14),
        getJournalEntries(),
        getPluginData<{ entries: { id: string; text: string }[] }>("gratitude-jar"),
        getPluginData<{ potions: { id: string; name: string }[] }>("mood-potion-lab"),
      ]);
      setMoodHistory(moods);
      setJournalHistory(journals);
      setGratitudeCount(gratitude?.entries?.length || 0);
      setPotionsCount(potions?.potions?.length || 0);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Build 7-day chart from real data
  const week = buildWeekData(moodHistory);

  const handleMoodCheckin = async (m: Mood) => {
    setSelectedMood(m);
    setMood(m);
    await trackMood({ mood: m, energy_level: energy, anxiety_level: anxiety });
    setCheckedIn(true);
    // Refresh chart
    getMoodHistory(7).then(setMoodHistory);
  };

  // Stats
  const totalEntries = moodHistory.length;
  const dominantMood = getDominantMood(moodHistory);
  const calmStreak = getCalmStreak(moodHistory);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="display text-4xl text-ink">The Observatory</h2>
        <p className="handwritten text-ink-soft text-lg">your week, charted in starlight —</p>
      </div>

      {/* Quick mood check-in */}
      <AnimatePresence>
        {!checkedIn && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.96 0.04 80 / 0.8), oklch(0.92 0.05 75 / 0.6))",
              border: "1px dashed oklch(0.78 0.13 75 / 0.3)",
            }}
          >
            <p className="handwritten text-ink text-lg mb-3">
              how is your inner weather right now?
            </p>
            <div className="flex gap-2 flex-wrap">
              {MOOD_LABELS.map((m) => (
                <motion.button
                  key={m}
                  onClick={() => handleMoodCheckin(m)}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl"
                  style={{
                    background:
                      selectedMood === m
                        ? "var(--gradient-gold)"
                        : "linear-gradient(180deg, oklch(0.95 0.04 80), oklch(0.88 0.06 75))",
                    boxShadow: "0 4px 12px oklch(0.2 0.05 50 / 0.15)",
                  }}
                >
                  <span className="text-2xl">{MOOD_EMOJIS[m]}</span>
                  <span className="handwritten text-sm text-ink">{moodPalette[m].label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {checkedIn && selectedMood && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl text-center"
            style={{
              background: "var(--gradient-gold)",
              boxShadow: "0 4px 20px oklch(0.78 0.13 75 / 0.3)",
            }}
          >
            <p className="handwritten text-xl text-ink">
              {MOOD_EMOJIS[selectedMood]} noted · feeling{" "}
              {moodPalette[selectedMood].label.toLowerCase()} · the stars remember
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Constellation chart */}
      <div
        className="relative rounded-2xl p-8 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, oklch(0.2 0.05 270), oklch(0.12 0.04 260))",
          minHeight: 280,
        }}
      >
        {/* Tiny background stars */}
        {Array.from({ length: 50 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: "oklch(0.95 0.02 80)",
              opacity: 0.2 + Math.random() * 0.5,
            }}
          />
        ))}

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="handwritten text-moonlight/60 text-lg"
            >
              reading the stars…
            </motion.p>
          </div>
        ) : (
          <>
            {/* Connection line */}
            {week.length > 1 && (
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 700 240"
                preserveAspectRatio="none"
              >
                <polyline
                  points={week
                    .map(
                      (w, i) => `${50 + i * (600 / (week.length - 1))},${220 - w.intensity * 180}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke="oklch(0.85 0.13 80 / 0.35)"
                  strokeWidth="1.5"
                  strokeDasharray="4 5"
                />
              </svg>
            )}

            <div
              className="relative grid gap-3 h-50 items-end"
              style={{ gridTemplateColumns: `repeat(${week.length}, 1fr)` }}
            >
              {week.map((w, i) => {
                const m = moodPalette[w.mood];
                return (
                  <motion.div
                    key={w.day}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.5, type: "spring" }}
                    className="flex flex-col items-center gap-2"
                    style={{ paddingBottom: `${(1 - w.intensity) * 140}px` }}
                  >
                    <motion.div
                      className="rounded-full animate-pulse-glow cursor-pointer"
                      style={
                        {
                          width: 18 + w.intensity * 14,
                          height: 18 + w.intensity * 14,
                          background: m.gradient,
                          ["--glow-color" as string]: m.glow,
                        } as React.CSSProperties
                      }
                      whileHover={{ scale: 1.3 }}
                      title={`${w.day}: ${m.label}`}
                    />
                    <span className="text-moonlight/60 text-xs handwritten">{w.day}</span>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* AI Narrative Insight — The Mate's Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="paper rounded-3xl p-8 relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-page)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--ink) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h3 className="display text-2xl text-ink">The Mate's Reflection</h3>
            <p className="handwritten text-ink-soft text-base">
              reading the layers of your heart —
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="handwritten text-xl text-ink leading-relaxed italic">
            "I've been watching your journey this week. You've sat with your{" "}
            {dominantMood || "thoughts"} for {totalEntries} moments, and even when the stars were
            dim, you folded in {gratitudeCount} gratitudes into your jar. That matters."
          </p>
          <p className="handwritten text-xl text-ink leading-relaxed">
            {journalHistory.length > 0
              ? `Your words show a beautiful pattern of ${journalHistory[0]?.themes?.[0] || "resilience"}. You aren't just surviving these days; you are documenting your growth, one page at a time. Keep going—the version of you from tomorrow is already proud of the you from today.`
              : "I'm waiting to see more of your story unfold. Every journal entry you write is a gift of clarity to your future self."}
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <div className="flex-1 p-4 rounded-2xl bg-ink/5 border border-dashed border-ink/10">
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Focus for today</p>
            <p className="display text-base text-ink">Gentle presence over perfect progress.</p>
          </div>
          <div className="flex-1 p-4 rounded-2xl bg-gold/5 border border-dashed border-gold/20">
            <p className="text-xs uppercase tracking-widest text-gold/60 mb-1">Soul Strength</p>
            <p className="display text-base text-ink">Reflective Honesty</p>
          </div>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: <Activity className="w-4 h-4" />,
            t: "Self-Check Intensity",
            v: totalEntries.toString(),
            d: "times you looked inward",
            color: "oklch(0.7 0.1 230)",
          },
          {
            icon: <Book className="w-4 h-4" />,
            t: "Journal Depth",
            v: journalHistory.length.toString(),
            d: "pages of your inner story",
            color: "oklch(0.78 0.13 75)",
          },
          {
            icon: <Award className="w-4 h-4" />,
            t: "Magical Resilience",
            v: (gratitudeCount + potionsCount).toString(),
            d: "potions brewed & gratitudes",
            color: "oklch(0.75 0.1 155)",
          },
          {
            icon: <Smile className="w-4 h-4" />,
            t: "Inner Balance",
            v: dominantMood ? moodPalette[dominantMood].label : "Stable",
            d: "your baseline this week",
            color: "oklch(0.78 0.1 155)",
          },
        ].map((c) => (
          <motion.div
            key={c.t}
            whileHover={{ y: -4, boxShadow: `0 12px 30px ${c.color}22` }}
            className="p-5 rounded-2xl border border-ink/5 transition-all"
            style={{
              background: "linear-gradient(180deg, white, oklch(0.98 0.01 80))",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${c.color}22`, color: c.color }}
            >
              {c.icon}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-bold">{c.t}</p>
            <p className="display text-3xl text-ink mt-1">{c.v}</p>
            <p className="handwritten text-ink-soft mt-1 text-sm">{c.d}</p>
          </motion.div>
        ))}
      </div>

      {/* Growth Themes */}
      {journalHistory.length > 0 && (
        <div className="p-8 rounded-3xl bg-ink/5 border border-ink/10">
          <h3 className="display text-xl text-ink mb-4">Emerging Themes</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(journalHistory.flatMap((j) => j.themes || [])))
              .slice(0, 8)
              .map((theme) => (
                <span
                  key={theme}
                  className="px-4 py-2 rounded-full glass handwritten text-base text-ink/70 border border-ink/10"
                >
                  ✧ {theme}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- helpers ----

function buildWeekData(history: MoodEntry[]): { day: string; mood: Mood; intensity: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const dayIdx = (today - i + 7) % 7;
    const dayLabel = days[dayIdx];
    const date = new Date(Date.now() - i * 86400000);
    const dateStr = date.toISOString().slice(0, 10);

    const dayEntries = history.filter((e) => e.created_at.startsWith(dateStr));
    const latestEntry = dayEntries[0];

    const moodIntensityMap: Record<Mood, number> = {
      joy: 0.9,
      hopeful: 0.8,
      calm: 0.7,
      anxious: 0.45,
      melancholy: 0.35,
    };

    result.push({
      day: dayLabel,
      mood: (latestEntry?.mood as Mood) ?? "calm",
      intensity: latestEntry ? (moodIntensityMap[latestEntry.mood as Mood] ?? 0.5) : 0.3,
    });
  }

  return result;
}

function getDominantMood(history: MoodEntry[]): Mood | null {
  if (!history.length) return null;
  const counts: Record<string, number> = {};
  for (const e of history) counts[e.mood] = (counts[e.mood] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as Mood;
}

function getCalmStreak(history: MoodEntry[]): number {
  return history.filter((e) => e.mood === "calm" || e.mood === "hopeful" || e.mood === "joy")
    .length;
}
