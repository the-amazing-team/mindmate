import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useStorybook } from "@/lib/storybook-context";
import { supabase, isDemoMode } from "@/lib/supabase";
import type { Mood } from "@/lib/storybook-context";

interface OnboardingQuestion {
  id: string;
  pageLabel: string;
  question: string;
  subtitle: string;
  type: "choice" | "slider" | "text";
  options?: { value: string; label: string; emoji: string; mood?: Mood }[];
  sliderMin?: number;
  sliderMax?: number;
  sliderLabels?: [string, string];
}

const QUESTIONS: OnboardingQuestion[] = [
  {
    id: "goal",
    pageLabel: "Chapter I",
    question: "What brings you to these pages?",
    subtitle: "Every story begins with a reason.",
    type: "choice",
    options: [
      { value: "anxiety", label: "ease my anxiety", emoji: "🌊", mood: "anxious" },
      { value: "grief", label: "process grief or loss", emoji: "🍂", mood: "melancholy" },
      { value: "growth", label: "grow emotionally", emoji: "🌱", mood: "hopeful" },
      { value: "journal", label: "build a journaling habit", emoji: "📖", mood: "calm" },
      { value: "connection", label: "feel less alone", emoji: "✨", mood: "melancholy" },
      { value: "joy", label: "cultivate more joy", emoji: "☀️", mood: "joy" },
    ],
  },
  {
    id: "stress",
    pageLabel: "Chapter II",
    question: "How heavy is the sky today?",
    subtitle: "No right or wrong answer — only your truth.",
    type: "slider",
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: ["featherlight", "stormy"],
  },
  {
    id: "sleep",
    pageLabel: "Chapter III",
    question: "How has sleep been visiting you?",
    subtitle: "Rest is its own kind of healing.",
    type: "choice",
    options: [
      { value: "well", label: "sleeping well", emoji: "🌙" },
      { value: "okay", label: "okay, could be better", emoji: "💫" },
      { value: "troubled", label: "restless nights", emoji: "🌪️" },
      { value: "insomnia", label: "barely sleeping", emoji: "🕯️" },
    ],
  },
  {
    id: "coping",
    pageLabel: "Chapter IV",
    question: "What helps you breathe when it's hard?",
    subtitle: "Choose all that resonate.",
    type: "choice",
    options: [
      { value: "writing", label: "writing / journaling", emoji: "✍️" },
      { value: "nature", label: "being in nature", emoji: "🌿" },
      { value: "music", label: "music", emoji: "🎵" },
      { value: "breathing", label: "deep breathing", emoji: "🌬️" },
      { value: "talking", label: "talking to someone", emoji: "💬" },
      { value: "movement", label: "movement / exercise", emoji: "🏃" },
    ],
  },
  {
    id: "intention",
    pageLabel: "Chapter V",
    question: "Set your intention for this journey.",
    subtitle: "Finish this sentence: 'I am here to…'",
    type: "text",
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user } = useAuth();
  const { updateProfile, setMood } = useStorybook();
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [sliderValue, setSliderValue] = useState(5);
  const [textValue, setTextValue] = useState("");
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const question = QUESTIONS[pageIndex];
  const isLast = pageIndex === QUESTIONS.length - 1;
  const progress = (pageIndex / QUESTIONS.length) * 100;

  const handleChoice = (value: string, mood?: Mood) => {
    if (mood) setMood(mood);
    if (question.id === "coping") {
      setSelectedMulti((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    } else {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      setTimeout(() => advance({ [question.id]: value }), 300);
    }
  };

  const advance = async (extra?: Record<string, unknown>) => {
    const allAnswers = { ...answers, ...extra };

    if (isLast || (question.type !== "choice" && !isLast)) {
      const textAnswer = question.type === "text" ? textValue : undefined;
      const sliderAnswer = question.type === "slider" ? sliderValue : undefined;
      const multiAnswer = question.id === "coping" ? selectedMulti : undefined;

      const finalAnswers = {
        ...allAnswers,
        ...(textAnswer ? { [question.id]: textAnswer } : {}),
        ...(sliderAnswer ? { [question.id]: sliderAnswer } : {}),
        ...(multiAnswer ? { [question.id]: multiAnswer } : {}),
      };

      if (isLast) {
        await completeOnboarding(finalAnswers);
        return;
      }
      setAnswers(finalAnswers);
    }

    setPageIndex((p) => p + 1);
  };

  const completeOnboarding = async (finalAnswers: Record<string, unknown>) => {
    setSaving(true);
    const intention = (finalAnswers.intention as string) || "to grow";

    updateProfile({ intention, onboarding_complete: true });

    if (!isDemoMode && supabase && user) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("profiles") as any)
          .update({
            onboarding_complete: true,
            intention,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emotional_profile: finalAnswers as any,
          })
          .eq("id", user.id);
      } catch (e) {
        console.warn("Onboarding save failed:", e);
      }
    }

    setSaving(false);
    onComplete();
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-8">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-10">
        <div className="h-0.5 bg-ink/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--gradient-gold)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="handwritten text-ink-soft/50 text-xs mt-1">{question.pageLabel}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ rotateY: 25, opacity: 0, x: 80 }}
          animate={{ rotateY: 0, opacity: 1, x: 0 }}
          exit={{ rotateY: -25, opacity: 0, x: -80 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          style={{ transformPerspective: 1400, transformOrigin: "left center" }}
          className="w-full max-w-md"
        >
          <h2 className="display text-3xl text-ink mb-2">{question.question}</h2>
          <p className="handwritten text-ink-soft text-lg mb-8">{question.subtitle}</p>

          {/* CHOICE type */}
          {question.type === "choice" && question.options && (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((opt) => {
                const isSelected =
                  question.id === "coping"
                    ? selectedMulti.includes(opt.value)
                    : answers[question.id] === opt.value;

                return (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleChoice(opt.value, opt.mood)}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected
                        ? "var(--gradient-gold)"
                        : "linear-gradient(180deg, oklch(0.96 0.04 80), oklch(0.9 0.06 75))",
                      boxShadow: isSelected
                        ? "0 8px 24px oklch(0.78 0.13 75 / 0.4)"
                        : "0 4px 12px oklch(0.2 0.05 50 / 0.15)",
                      border: isSelected
                        ? "1px solid oklch(0.78 0.13 75 / 0.5)"
                        : "1px solid transparent",
                    }}
                  >
                    <span className="text-2xl block mb-1">{opt.emoji}</span>
                    <span className="handwritten text-base text-ink">{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* SLIDER type */}
          {question.type === "slider" && (
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="range"
                  min={question.sliderMin}
                  max={question.sliderMax}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--gold) ${((sliderValue - 1) / 9) * 100}%, oklch(0.88 0.05 75) ${((sliderValue - 1) / 9) * 100}%)`,
                  }}
                />
                <div className="flex justify-between mt-2">
                  <span className="handwritten text-ink-soft/60 text-sm">
                    {question.sliderLabels?.[0]}
                  </span>
                  <span className="display text-2xl text-ink font-light">{sliderValue}</span>
                  <span className="handwritten text-ink-soft/60 text-sm">
                    {question.sliderLabels?.[1]}
                  </span>
                </div>
              </div>

              <motion.button
                onClick={() => advance({ [question.id]: sliderValue })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-full flex items-center justify-center gap-2 text-ink display"
                style={{ background: "var(--gradient-gold)" }}
              >
                <span className="handwritten text-lg">continue</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}

          {/* TEXT type */}
          {question.type === "text" && (
            <div className="space-y-4">
              <div
                className="relative p-4 rounded-xl"
                style={{
                  background:
                    "repeating-linear-gradient(transparent 0 27px, oklch(0.7 0.05 230 / 0.15) 27px 28px)",
                  boxShadow: "inset 0 0 30px oklch(0.7 0.06 60 / 0.2)",
                }}
              >
                <span className="handwritten text-2xl text-ink-soft mr-2">I am here to</span>
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="be kinder to myself…"
                  rows={3}
                  className="w-full bg-transparent resize-none handwritten text-2xl text-ink placeholder:text-ink-soft/40 focus:outline-none leading-7"
                  style={{ lineHeight: "28px" }}
                />
              </div>

              <motion.button
                onClick={() =>
                  saving ? null : completeOnboarding({ ...answers, intention: textValue })
                }
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-full flex items-center justify-center gap-2 text-ink"
                style={{ background: "var(--gradient-gold)" }}
              >
                {saving ? (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="handwritten text-lg"
                  >
                    opening your book…
                  </motion.span>
                ) : (
                  <>
                    <span className="handwritten text-lg">open the book ✦</span>
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Multi-select continue button */}
          {question.id === "coping" && selectedMulti.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => advance({ coping: selectedMulti })}
              className="mt-4 w-full py-3 rounded-full flex items-center justify-center gap-2 text-ink display"
              style={{ background: "var(--gradient-gold)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="handwritten text-lg">continue →</span>
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
