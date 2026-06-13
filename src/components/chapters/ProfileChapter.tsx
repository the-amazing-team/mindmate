import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, LogOut, Trash2, BookOpen, MessageCircle, Sparkles, RefreshCw } from "lucide-react";
import { moodPalette, useStorybook, type Mood } from "@/lib/storybook-context";
import { useAuth } from "@/lib/auth-context";
import { supabase, isDemoMode } from "@/lib/supabase";
import { MBTI_TYPES } from "@/components/auth/PersonalityTestFlow";

const moods: Mood[] = ["calm", "joy", "hopeful", "melancholy", "anxious"];
const AFFIRMATIONS = [
  "You are allowed to take up space, in joy and in stillness.",
  "Healing is not linear — and that is okay.",
  "Your softness is not weakness. It's how the light gets in.",
  "You don't have to earn rest.",
  "Small consistent care adds up to something beautiful.",
];

export function ProfileChapter() {
  const { profile, updateProfile, memories, triggerCounts, clearMemories, exitBook } =
    useStorybook();
  const { user, signOut, isGuest } = useAuth();
  const [name, setName] = useState(
    profile.name || (user?.user_metadata?.full_name as string) || "",
  );
  const [intention, setIntention] = useState(profile.intention || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [retaking, setRetaking] = useState(false);

  const handleRetakeTest = async () => {
    setRetaking(true);
    updateProfile({
      onboarding_complete: false,
      mbti_personality: undefined,
      mbti_scores: undefined,
    });
    if (!isDemoMode && supabase && user) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("profiles") as any)
          .update({
            onboarding_complete: false,
            mbti_personality: null,
            mbti_scores: null,
            emotional_profile: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...((profile as any).emotional_profile || {}),
              onboarding_complete: false,
              mbti_personality: null,
              mbti_scores: null,
            },
          })
          .eq("id", user.id);
      } catch (err) {
        console.warn("Failed to reset onboarding in database:", err);
      }
    }
    setRetaking(false);
    exitBook();
  };

  const affirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];
  const totalEntries = memories.length;
  const journalCount = memories.filter((m) => m.source === "journal").length;
  const companionCount = memories.filter((m) => m.source === "companion").length;
  const m = moodPalette[profile.signatureMood];
  const joinedDate = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "today";

  const save = async () => {
    setSaving(true);
    updateProfile({ name, intention });
    if (!isDemoMode && supabase && user) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("profiles") as any).update({ name, intention }).eq("id", user.id);
      } catch (e) {
        console.warn(e);
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10">
      {/* Left: avatar + mood */}
      <div className="flex flex-col items-center text-center">
        <p className="handwritten text-ink-soft text-xl mb-4">your self-portrait —</p>
        <motion.div
          className="relative w-48 h-48 rounded-full flex items-center justify-center animate-pulse-glow"
          style={
            {
              background: m.gradient,
              ["--glow-color" as string]: m.glow,
            } as React.CSSProperties
          }
          whileHover={{ rotate: 4, scale: 1.02 }}
        >
          <span className="display text-5xl text-ink">
            {(name.trim() || user?.email || "me")[0].toUpperCase()}
          </span>
          {!isGuest && user && (
            <span
              className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white"
              style={{ background: "var(--sage)" }}
              title="Signed in"
            />
          )}
        </motion.div>
        <p className="display text-3xl mt-6 text-ink">
          {name.trim() || user?.email?.split("@")[0] || "Unnamed Reader"}
        </p>
        <p className="handwritten text-ink-soft text-lg mt-1">
          carrier of {m.label.toLowerCase()} skies
        </p>
        {profile.mbti_personality && MBTI_TYPES[profile.mbti_personality] && (
          <div
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white"
            style={{
              background: MBTI_TYPES[profile.mbti_personality].gradient,
              boxShadow: `0 4px 12px ${MBTI_TYPES[profile.mbti_personality].color}40`,
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>
              {profile.mbti_personality} · {MBTI_TYPES[profile.mbti_personality].title}
            </span>
          </div>
        )}
        {user?.email && <p className="text-xs text-ink/40 mt-1">{user.email}</p>}
        <p className="handwritten text-ink-soft/50 text-sm mt-1">here since {joinedDate}</p>

        <div className="ink-divider w-32 my-5" />
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-3">signature mood</p>
        <div className="flex flex-wrap justify-center gap-2">
          {moods.map((mm) => (
            <motion.button
              key={mm}
              onClick={() => updateProfile({ signatureMood: mm })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-full text-sm handwritten transition-all"
              style={{
                background: mm === profile.signatureMood ? moodPalette[mm].gradient : "transparent",
                color: mm === profile.signatureMood ? "var(--ink)" : "var(--ink-soft)",
                border: `1px solid ${mm === profile.signatureMood ? "transparent" : "oklch(0.5 0.05 50 / 0.25)"}`,
              }}
            >
              {moodPalette[mm].label.toLowerCase()}
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-xl w-full text-left"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.96 0.04 80 / 0.7), oklch(0.9 0.06 75 / 0.5))",
            border: "1px dashed oklch(0.78 0.13 75 / 0.3)",
          }}
        >
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">today's affirmation</p>
          <p className="display text-base text-ink italic leading-relaxed">{affirmation}</p>
        </motion.div>
      </div>

      {/* Right: form + stats */}
      <div className="space-y-6">
        <div>
          <h2 className="display text-4xl text-ink">Tell the book about you</h2>
          <p className="text-ink/70 leading-relaxed max-w-md mt-1">
            A few lines so the pages can greet you by name.
          </p>
        </div>

        <div
          className="p-5 rounded-xl space-y-4"
          style={{
            background: "linear-gradient(180deg, oklch(0.96 0.04 80), oklch(0.9 0.06 75))",
            boxShadow: "0 6px 18px -8px oklch(0.2 0.05 50 / 0.25)",
          }}
        >
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-ink/50">
              what should we call you?
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name, or something tender"
              className="w-full bg-transparent handwritten text-2xl text-ink focus:outline-none border-b border-dashed border-ink-soft/30 py-1 mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-ink/50">your intention</span>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              rows={2}
              placeholder="why are you here?"
              className="w-full bg-transparent handwritten text-xl text-ink focus:outline-none border-b border-dashed border-ink-soft/30 py-1 mt-1 resize-none"
            />
          </label>
          <motion.button
            onClick={save}
            disabled={saving}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-ink display"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Save className="w-4 h-4" />
            <span className="handwritten text-lg">
              {saving ? "saving…" : saved ? "✦ saved" : "press into page"}
            </span>
          </motion.button>
        </div>

        {profile.mbti_personality && MBTI_TYPES[profile.mbti_personality] && (
          <div
            className="p-5 rounded-xl space-y-3 text-ink relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, oklch(0.96 0.04 80), oklch(0.9 0.06 75))",
              boxShadow: "0 6px 18px -8px oklch(0.2 0.05 50 / 0.25)",
              border: "1px solid oklch(0.78 0.13 75 / 0.15)",
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-widest text-ink/50">
                  your soul signature
                </span>
                <h3 className="display text-2xl font-bold tracking-tight text-ink mt-1 flex flex-wrap items-baseline gap-2">
                  {profile.mbti_personality}
                  <span className="handwritten text-base text-ink-soft italic font-normal">
                    the {MBTI_TYPES[profile.mbti_personality].title}
                  </span>
                </h3>
                <p className="text-[10px] uppercase tracking-wider text-ink/40 font-semibold pt-0.5">
                  {MBTI_TYPES[profile.mbti_personality].category}
                </p>
              </div>

              <button
                onClick={handleRetakeTest}
                disabled={retaking}
                className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink transition-colors border border-ink-soft/20 rounded-full px-3 py-1 bg-white/40 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${retaking ? "animate-spin" : ""}`} />
                <span className="handwritten">{retaking ? "resetting..." : "retake"}</span>
              </button>
            </div>

            <p className="text-sm text-ink-soft leading-relaxed border-t border-dashed border-ink-soft/20 pt-3">
              {MBTI_TYPES[profile.mbti_personality].description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: <Sparkles className="w-4 h-4" />,
              t: "memories",
              v: totalEntries,
            },
            {
              icon: <BookOpen className="w-4 h-4" />,
              t: "journal",
              v: journalCount,
            },
            {
              icon: <MessageCircle className="w-4 h-4" />,
              t: "whispers",
              v: companionCount,
            },
          ].map((c) => (
            <div
              key={c.t}
              className="p-4 rounded-xl"
              style={{
                background: "linear-gradient(180deg, oklch(0.96 0.04 80), oklch(0.9 0.06 75))",
                boxShadow: "0 6px 18px -8px oklch(0.2 0.05 50 / 0.3)",
              }}
            >
              <div className="flex items-center gap-1.5 text-ink-soft mb-1">{c.icon}</div>
              <p className="text-[10px] uppercase tracking-widest text-ink/50">{c.t}</p>
              <p className="display text-3xl text-ink">{c.v}</p>
            </div>
          ))}
        </div>

        {triggerCounts.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">
              themes the book has noticed in you
            </p>
            <div className="flex flex-wrap gap-1.5">
              {triggerCounts.slice(0, 10).map((t) => (
                <span
                  key={t.trigger}
                  className="px-2.5 py-1 rounded-full handwritten text-base text-ink"
                  style={{
                    background: "linear-gradient(180deg, oklch(0.95 0.05 80), oklch(0.85 0.07 65))",
                  }}
                >
                  {t.trigger} · {t.count}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-2 border-t border-dashed border-ink-soft/20">
          <AnimatePresence mode="wait">
            {!confirmClear ? (
              <motion.button
                key="clear"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="handwritten">let the pages forget</span>
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <span className="handwritten text-sm text-ink-soft">are you sure?</span>
                <button
                  onClick={() => {
                    clearMemories();
                    setConfirmClear(false);
                  }}
                  className="handwritten text-sm px-3 py-1 rounded-full"
                  style={{
                    background: "oklch(0.7 0.12 25 / 0.2)",
                    color: "oklch(0.6 0.12 25)",
                  }}
                >
                  forget all
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="handwritten text-sm text-ink-soft"
                >
                  keep them
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isGuest && (
            <motion.button
              onClick={signOut}
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors ml-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="handwritten">close the book</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
