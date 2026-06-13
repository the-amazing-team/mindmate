import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Heart } from "lucide-react";
import { EmotionalOrb } from "@/components/storybook/EmotionalOrb";
import { moodPalette, useStorybook, type Mood } from "@/lib/storybook-context";
import { MBTI_TYPES } from "@/components/auth/PersonalityTestFlow";
import { getMoodHistory } from "@/services/mood";
import { getJournalEntries } from "@/services/journal";

const moods: Mood[] = ["calm", "joy", "hopeful", "melancholy", "anxious"];

const STATIC_NOTES = [
  {
    title: "today's whisper",
    body: "You carried more than you realized this week. Set it down, gently.",
    tilt: -2,
  },
  {
    title: "an affirmation",
    body: "I am allowed to take up space, in joy and in stillness.",
    tilt: 1.5,
  },
  {
    title: "a small invitation",
    body: "Step outside for three breaths. The sky is keeping a seat for you.",
    tilt: -1,
  },
];

export function HomeChapter() {
  const { mood, setMood, profile, memories, setChapter } = useStorybook();
  const [streakDays, setStreakDays] = useState(0);
  const [latestInsight, setLatestInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);

  // Load today's stats on mount
  useEffect(() => {
    (async () => {
      try {
        const [moodHistory, journalEntries] = await Promise.all([
          getMoodHistory(30),
          getJournalEntries(0, 5),
        ]);

        // Calculate streak
        const streak = calcStreak(
          moodHistory.map((m) => m.created_at).concat(journalEntries.map((e) => e.created_at)),
        );
        setStreakDays(streak);

        // Get AI insight from latest journal
        if (journalEntries[0]?.ai_analysis) {
          setLatestInsight(journalEntries[0].ai_analysis);
        }
      } catch {
        // silently fail — home page is always available
      } finally {
        setLoadingInsight(false);
      }
    })();
  }, []);

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
      {/* Left: orb + mood selector */}
      <div className="flex flex-col items-center text-center">
        <p className="handwritten text-ink-soft text-xl mb-4">how the universe feels today —</p>
        <EmotionalOrb mood={mood} />
        <p className="display text-3xl mt-8 text-ink">{moodPalette[mood].label}</p>
        <div className="ink-divider w-32 my-4" />
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {moods.map((m) => (
            <motion.button
              key={m}
              onClick={() => setMood(m)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 rounded-full text-sm transition-all handwritten"
              style={{
                background: m === mood ? moodPalette[m].gradient : "transparent",
                color: m === mood ? "var(--ink)" : "var(--ink-soft)",
                border: `1px solid ${m === mood ? "transparent" : "oklch(0.5 0.05 50 / 0.25)"}`,
                boxShadow: m === mood ? `0 4px 14px ${moodPalette[m].glow}` : "none",
              }}
            >
              {moodPalette[m].label.toLowerCase()}
            </motion.button>
          ))}
        </div>

        {/* Streak counter */}
        {streakDays > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "var(--gradient-gold)",
              boxShadow: "0 4px 16px oklch(0.78 0.13 75 / 0.3)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span className="handwritten text-base text-ink">{streakDays} day streak</span>
          </motion.div>
        )}
      </div>

      {/* Right: notes + AI insight */}
      <div className="space-y-5">
        <h2 className="display text-4xl text-ink">
          {profile.name
            ? `Welcome back, ${profile.name.split(" ")[0]}.`
            : "Your emotional universe"}
        </h2>
        <p className="text-ink/70 leading-relaxed max-w-md">
          Each page of this book breathes with you. The orb listens. The pages remember. Below are
          today's small offerings —
        </p>

        {profile.mbti_personality && MBTI_TYPES[profile.mbti_personality] && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="p-6 rounded-2xl relative overflow-hidden text-white flex flex-col justify-between"
            style={{
              background: MBTI_TYPES[profile.mbti_personality].gradient,
              boxShadow: `0 12px 30px -10px ${MBTI_TYPES[profile.mbti_personality].color}60`,
            }}
          >
            <div className="absolute top-3 right-3 opacity-20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-white/70 font-semibold flex items-center gap-1">
                <Heart className="w-3 h-3" /> Your Personality Signature
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <h3 className="display text-3xl font-bold tracking-tight text-white">
                  {profile.mbti_personality}
                </h3>
                <span className="handwritten text-lg text-white/90 italic">
                  — the {MBTI_TYPES[profile.mbti_personality].title}
                </span>
              </div>
              <p className="text-sm text-white/85 leading-relaxed pt-2">
                {MBTI_TYPES[profile.mbti_personality].description}
              </p>
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={() => setChapter("insights")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-6 py-3 rounded-full glass text-ink border border-gold/30 hover:border-gold/60 transition-all"
        >
          <TrendingUp className="w-4 h-4 text-gold" />
          <span className="display text-base">View Your Weekly Insights</span>
        </motion.button>

        {/* Latest AI insight — shown first if available */}
        <AnimatePresence>
          {!loadingInsight && latestInsight && (
            <motion.div
              initial={{ opacity: 0, y: 10, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              whileHover={{ rotate: 0, scale: 1.01 }}
              className="relative p-5 rounded-lg cursor-default"
              style={{
                background: "linear-gradient(135deg, oklch(0.97 0.04 85), oklch(0.92 0.06 75))",
                boxShadow: "0 10px 24px -10px oklch(0.2 0.05 50 / 0.35)",
                border: "1px dashed oklch(0.78 0.13 75 / 0.4)",
              }}
            >
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3 rounded-sm"
                style={{
                  background: "oklch(0.78 0.13 75 / 0.5)",
                  boxShadow: "0 2px 4px oklch(0 0 0 / 0.15)",
                }}
              />
              <div className="flex items-center gap-2 mb-2 text-ink-soft">
                <Sparkles className="w-3.5 h-3.5" />
                <p className="text-xs uppercase tracking-widest">from your companion</p>
              </div>
              <p className="display text-lg text-ink italic leading-snug">{latestInsight}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static daily notes */}
        <div className="space-y-4">
          {STATIC_NOTES.map((n, i) => (
            <motion.div
              key={n.title}
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: n.tilt }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.8 }}
              whileHover={{ rotate: 0, scale: 1.02 }}
              className="relative p-5 rounded-lg cursor-default"
              style={{
                background: "linear-gradient(180deg, oklch(0.97 0.04 85), oklch(0.92 0.06 75))",
                boxShadow:
                  "0 10px 24px -10px oklch(0.2 0.05 50 / 0.35), 0 2px 4px oklch(0.2 0.05 50 / 0.1)",
              }}
            >
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3 rounded-sm"
                style={{
                  background: "oklch(0.7 0.05 70 / 0.5)",
                  boxShadow: "0 2px 4px oklch(0 0 0 / 0.15)",
                }}
              />
              <p className="handwritten text-ink-soft text-sm uppercase tracking-widest mb-1">
                {n.title}
              </p>
              <p className="display text-xl text-ink leading-snug">{n.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Memory count */}
        {memories.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="handwritten text-ink-soft/60 text-sm text-right"
          >
            the book holds {memories.length} of your memories ✦
          </motion.p>
        )}
      </div>
    </div>
  );
}

function calcStreak(timestamps: string[]): number {
  if (!timestamps.length) return 0;
  const dates = [...new Set(timestamps.map((t) => t.slice(0, 10)))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (dates[i] === expected || (i === 0 && dates[i] === today)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
