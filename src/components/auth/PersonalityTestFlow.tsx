import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, RefreshCw, BookOpen, Heart, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useStorybook } from "@/lib/storybook-context";
import { supabase, isDemoMode } from "@/lib/supabase";
import type { Mood } from "@/lib/storybook-context";

interface Question {
  id: number;
  text: string;
  dimension: "EI" | "SN" | "TF" | "JP";
  direction: 1 | -1; // 1: Yes = E/S/T/J, No = I/N/F/P. -1: Yes = I/N/F/P, No = E/S/T/J.
}

const QUESTIONS: Question[] = [
  // BATCH 1 (1 - 10)
  { id: 1, text: "I feel energized when I spend time with people.", dimension: "EI", direction: 1 },
  {
    id: 2,
    text: "I prefer talking things out rather than thinking alone.",
    dimension: "EI",
    direction: 1,
  },
  { id: 3, text: "I feel drained after long social interaction.", dimension: "EI", direction: -1 },
  {
    id: 4,
    text: "I enjoy being around active or crowded environments.",
    dimension: "EI",
    direction: 1,
  },
  { id: 5, text: "I prefer spending time alone to recharge.", dimension: "EI", direction: -1 },
  { id: 6, text: "I focus more on facts than ideas.", dimension: "SN", direction: 1 },
  {
    id: 7,
    text: "I often think about possibilities beyond what is happening now.",
    dimension: "SN",
    direction: -1,
  },
  { id: 8, text: "I notice small practical details easily.", dimension: "SN", direction: 1 },
  {
    id: 9,
    text: "I make decisions based on logic more than feelings.",
    dimension: "TF",
    direction: 1,
  },
  {
    id: 10,
    text: "I consider how others feel before making decisions.",
    dimension: "TF",
    direction: -1,
  },

  // BATCH 2 (11 - 20)
  { id: 11, text: "I enjoy meeting new people regularly.", dimension: "EI", direction: 1 },
  { id: 12, text: "I think better when I am alone.", dimension: "EI", direction: -1 },
  {
    id: 13,
    text: "I feel comfortable speaking in group conversations.",
    dimension: "EI",
    direction: 1,
  },
  { id: 14, text: "I enjoy imagining future scenarios.", dimension: "SN", direction: -1 },
  {
    id: 15,
    text: "I prefer practical solutions over abstract thinking.",
    dimension: "SN",
    direction: 1,
  },
  {
    id: 16,
    text: "I often look for hidden meaning in situations.",
    dimension: "SN",
    direction: -1,
  },
  { id: 17, text: "I value fairness over emotional comfort.", dimension: "TF", direction: 1 },
  {
    id: 18,
    text: "I avoid hurting people even if logic says otherwise.",
    dimension: "TF",
    direction: -1,
  },
  { id: 19, text: "I like having clear plans and structure.", dimension: "JP", direction: 1 },
  {
    id: 20,
    text: "I prefer keeping options open rather than fixed plans.",
    dimension: "JP",
    direction: -1,
  },

  // BATCH 3 (21 - 29)
  {
    id: 21,
    text: "I enjoy exploring multiple possibilities before deciding.",
    dimension: "SN",
    direction: -1,
  },
  { id: 22, text: "I often think about long-term outcomes.", dimension: "SN", direction: -1 },
  { id: 23, text: "I enjoy creative and abstract thinking.", dimension: "SN", direction: -1 },
  {
    id: 24,
    text: "I trust my gut feelings when making decisions.",
    dimension: "SN",
    direction: -1,
  },
  {
    id: 25,
    text: "I rely on logic more than intuition in most situations.",
    dimension: "TF",
    direction: 1,
  },
  { id: 26, text: "I prefer simple and direct explanations.", dimension: "TF", direction: 1 },
  { id: 27, text: "I feel uncomfortable with last-minute changes.", dimension: "JP", direction: 1 },
  { id: 28, text: "I like finishing tasks early.", dimension: "JP", direction: 1 },
  { id: 29, text: "I prefer routine over unpredictability.", dimension: "JP", direction: 1 },

  // BATCH 4 (30 - 39)
  { id: 30, text: "I enjoy debating ideas with others.", dimension: "EI", direction: 1 },
  { id: 31, text: "I feel comfortable leading group decisions.", dimension: "EI", direction: 1 },
  {
    id: 32,
    text: "I prefer supporting roles over leadership roles.",
    dimension: "EI",
    direction: -1,
  },
  {
    id: 33,
    text: "I focus more on what is happening right now than the future.",
    dimension: "SN",
    direction: 1,
  },
  { id: 34, text: "I prefer stable and predictable environments.", dimension: "SN", direction: 1 },
  { id: 35, text: "I prefer planned activities.", dimension: "JP", direction: 1 },
  { id: 36, text: "I enjoy spontaneous activities.", dimension: "JP", direction: -1 },
  { id: 37, text: "I often decide things at the last moment.", dimension: "JP", direction: -1 },
  { id: 38, text: "I prefer clear rules and systems.", dimension: "TF", direction: 1 },
  { id: 39, text: "I adapt easily to changing situations.", dimension: "TF", direction: -1 },
];

export const MBTI_TYPES: Record<
  string,
  {
    title: string;
    category: string;
    description: string;
    gradient: string;
    mood: Mood;
    color: string;
  }
> = {
  INTJ: {
    title: "Strategic Builder",
    category: "Analyst Types (NT)",
    description:
      "Independent planner who thinks long-term and focuses on systems, efficiency, and future outcomes.",
    gradient: "linear-gradient(135deg, oklch(0.35 0.08 230), oklch(0.18 0.05 250))",
    color: "oklch(0.78 0.08 230)",
    mood: "calm",
  },
  INTP: {
    title: "Idea Explorer",
    category: "Analyst Types (NT)",
    description:
      "Deep thinker who loves theories, concepts, and understanding how things work behind the surface.",
    gradient: "linear-gradient(135deg, oklch(0.35 0.08 230), oklch(0.2 0.05 260))",
    color: "oklch(0.78 0.08 230)",
    mood: "calm",
  },
  ENTJ: {
    title: "Commanding Leader",
    category: "Analyst Types (NT)",
    description:
      "Natural leader who is goal-driven, decisive, and focused on execution and results.",
    gradient: "linear-gradient(135deg, oklch(0.42 0.11 150), oklch(0.18 0.06 170))",
    color: "oklch(0.78 0.1 155)",
    mood: "hopeful",
  },
  ENTP: {
    title: "Idea Challenger",
    category: "Analyst Types (NT)",
    description:
      "Creative thinker who enjoys debates, new ideas, and challenging existing systems.",
    gradient: "linear-gradient(135deg, oklch(0.5 0.14 70), oklch(0.22 0.08 40))",
    color: "oklch(0.85 0.13 80)",
    mood: "joy",
  },
  INFJ: {
    title: "Insightful Guide",
    category: "Diplomat Types (NF)",
    description:
      "Quiet, deep thinker who understands people well and focuses on meaning and purpose.",
    gradient: "linear-gradient(135deg, oklch(0.28 0.07 290), oklch(0.13 0.04 270))",
    color: "oklch(0.65 0.08 270)",
    mood: "melancholy",
  },
  INFP: {
    title: "Idealist",
    category: "Diplomat Types (NF)",
    description:
      "Value-driven individual who seeks authenticity, emotional depth, and personal meaning.",
    gradient: "linear-gradient(135deg, oklch(0.42 0.11 150), oklch(0.2 0.06 180))",
    color: "oklch(0.78 0.1 155)",
    mood: "hopeful",
  },
  ENFJ: {
    title: "Social Guide",
    category: "Diplomat Types (NF)",
    description: "People-focused leader who naturally supports, motivates, and understands others.",
    gradient: "linear-gradient(135deg, oklch(0.5 0.14 70), oklch(0.25 0.08 50))",
    color: "oklch(0.85 0.13 80)",
    mood: "joy",
  },
  ENFP: {
    title: "Creative Explorer",
    category: "Diplomat Types (NF)",
    description:
      "Energetic, curious personality who loves possibilities, ideas, and new experiences.",
    gradient: "linear-gradient(135deg, oklch(0.42 0.11 150), oklch(0.32 0.1 25))",
    color: "oklch(0.78 0.1 155)",
    mood: "hopeful",
  },
  ISTJ: {
    title: "Responsible Organizer",
    category: "Sentinel Types (SJ)",
    description: "Practical and reliable person who values structure, rules, and consistency.",
    gradient: "linear-gradient(135deg, oklch(0.35 0.08 230), oklch(0.16 0.05 250))",
    color: "oklch(0.78 0.08 230)",
    mood: "calm",
  },
  ISFJ: {
    title: "Quiet Protector",
    category: "Sentinel Types (SJ)",
    description: "Caring and loyal individual who supports others through stability and attention.",
    gradient: "linear-gradient(135deg, oklch(0.35 0.08 230), oklch(0.18 0.06 240))",
    color: "oklch(0.78 0.08 230)",
    mood: "calm",
  },
  ESTJ: {
    title: "Efficient Manager",
    category: "Sentinel Types (SJ)",
    description: "Direct, organized leader who focuses on execution, order, and results.",
    gradient: "linear-gradient(135deg, oklch(0.35 0.08 230), oklch(0.2 0.05 250))",
    color: "oklch(0.78 0.08 230)",
    mood: "calm",
  },
  ESFJ: {
    title: "Social Caregiver",
    category: "Sentinel Types (SJ)",
    description: "Warm, supportive person who values harmony and strong social relationships.",
    gradient: "linear-gradient(135deg, oklch(0.5 0.14 70), oklch(0.22 0.08 30))",
    color: "oklch(0.85 0.13 80)",
    mood: "joy",
  },
  ISTP: {
    title: "Logical Fixer",
    category: "Explorer Types (SP)",
    description: "Calm problem-solver who prefers action, logic, and practical solutions.",
    gradient: "linear-gradient(135deg, oklch(0.35 0.08 230), oklch(0.15 0.04 250))",
    color: "oklch(0.78 0.08 230)",
    mood: "calm",
  },
  ISFP: {
    title: "Quiet Artist",
    category: "Explorer Types (SP)",
    description: "Sensitive and creative individual who values personal expression and freedom.",
    gradient: "linear-gradient(135deg, oklch(0.28 0.07 290), oklch(0.16 0.06 15))",
    color: "oklch(0.65 0.08 270)",
    mood: "melancholy",
  },
  ESTP: {
    title: "Action Driver",
    category: "Explorer Types (SP)",
    description: "Energetic, bold personality who thrives in fast-paced and dynamic environments.",
    gradient: "linear-gradient(135deg, oklch(0.42 0.11 150), oklch(0.32 0.1 25))",
    color: "oklch(0.78 0.1 155)",
    mood: "hopeful",
  },
  ESFP: {
    title: "Social Performer",
    category: "Explorer Types (SP)",
    description:
      "Outgoing and expressive person who enjoys attention, fun, and social experiences.",
    gradient: "linear-gradient(135deg, oklch(0.5 0.14 70), oklch(0.22 0.08 40))",
    color: "oklch(0.85 0.13 80)",
    mood: "joy",
  },
};

interface PersonalityTestFlowProps {
  onComplete: () => void;
}

export function PersonalityTestFlow({ onComplete }: PersonalityTestFlowProps) {
  const { user } = useAuth();
  const { updateProfile, setMood } = useStorybook();

  const [step, setStep] = useState<"name" | "test" | "confirm-next" | "result">("name");
  const [nameInput, setNameInput] = useState(user?.user_metadata?.full_name || "");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "yes" | "sometimes" | "no">>({});
  const [intentionInput, setIntentionInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Results state
  const [mbtiType, setMbtiType] = useState<string>("INFP");
  const [mbtiScores, setMbtiScores] = useState<Record<string, number>>({});

  const currentBatch = Math.floor(currentQIndex / 10) + 1;
  const isLastQuestionOfBatch =
    (currentQIndex + 1) % 10 === 0 || currentQIndex === QUESTIONS.length - 1;
  const totalQuestionsInBatch = currentBatch === 3 ? 9 : 10;
  const qInBatchIndex = (currentQIndex % 10) + 1;
  const progress = (currentQIndex / QUESTIONS.length) * 100;

  const handleStart = () => {
    if (!nameInput.trim()) return;
    setStep("test");
  };

  const handleAnswer = (val: "yes" | "sometimes" | "no") => {
    const updated = { ...answers, [QUESTIONS[currentQIndex].id]: val };
    setAnswers(updated);

    if (isLastQuestionOfBatch) {
      // End of a batch, ask if they want to continue
      setStep("confirm-next");
    } else {
      // Advance to next question
      setCurrentQIndex((idx) => idx + 1);
    }
  };

  const calculateResults = (currentAnswers: typeof answers) => {
    let scoreE = 0,
      scoreI = 0;
    let scoreS = 0,
      scoreN = 0;
    let scoreT = 0,
      scoreF = 0;
    let scoreJ = 0,
      scoreP = 0;

    QUESTIONS.forEach((q) => {
      const ans = currentAnswers[q.id];
      if (!ans) return; // Skip unanswered questions

      const isPositive = q.direction === 1;

      if (q.dimension === "EI") {
        if (ans === "yes") {
          if (isPositive) scoreE++;
          else scoreI++;
        } else if (ans === "no") {
          if (isPositive) scoreI++;
          else scoreE++;
        } else {
          scoreE += 0.5;
          scoreI += 0.5;
        }
      } else if (q.dimension === "SN") {
        if (ans === "yes") {
          if (isPositive) scoreS++;
          else scoreN++;
        } else if (ans === "no") {
          if (isPositive) scoreN++;
          else scoreS++;
        } else {
          scoreS += 0.5;
          scoreN += 0.5;
        }
      } else if (q.dimension === "TF") {
        if (ans === "yes") {
          if (isPositive) scoreT++;
          else scoreF++;
        } else if (ans === "no") {
          if (isPositive) scoreF++;
          else scoreT++;
        } else {
          scoreT += 0.5;
          scoreF += 0.5;
        }
      } else if (q.dimension === "JP") {
        if (ans === "yes") {
          if (isPositive) scoreJ++;
          else scoreP++;
        } else if (ans === "no") {
          if (isPositive) scoreP++;
          else scoreJ++;
        } else {
          scoreJ += 0.5;
          scoreP += 0.5;
        }
      }
    });

    const type =
      (scoreE >= scoreI ? "E" : "I") +
      (scoreS >= scoreN ? "S" : "N") +
      (scoreT >= scoreF ? "T" : "F") +
      (scoreJ >= scoreP ? "J" : "P");

    setMbtiType(type);
    const scores = {
      E: scoreE,
      I: scoreI,
      S: scoreS,
      N: scoreN,
      T: scoreT,
      F: scoreF,
      J: scoreJ,
      P: scoreP,
    };
    setMbtiScores(scores);

    // Set signature mood matching the MBTI type
    const archetype = MBTI_TYPES[type] || MBTI_TYPES.INFP;
    setMood(archetype.mood);

    setStep("result");
  };

  const handleContinueBatch = () => {
    setCurrentQIndex((idx) => idx + 1);
    setStep("test");
  };

  const handleFinishEarly = () => {
    calculateResults(answers);
  };

  const handleFinishTest = async () => {
    setSaving(true);
    const intention = intentionInput.trim() || "to live authentically and grow";
    const name = nameInput.trim();

    // Update locally in StorybookProvider
    const archetype = MBTI_TYPES[mbtiType] || MBTI_TYPES.INFP;
    updateProfile({
      name,
      intention,
      signatureMood: archetype.mood,
      onboarding_complete: true,
      mbti_personality: mbtiType,
      mbti_scores: mbtiScores,
    });

    // Save to Supabase (robust update with column fallback)
    if (!isDemoMode && supabase && user) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("profiles") as any)
          .update({
            name,
            intention,
            signature_mood: archetype.mood,
            onboarding_complete: true,
            mbti_personality: mbtiType,
            mbti_scores: mbtiScores,
            emotional_profile: {
              name,
              intention,
              onboarding_complete: true,
              mbti_personality: mbtiType,
              mbti_scores: mbtiScores,
            },
          })
          .eq("id", user.id);

        if (error) {
          console.warn("Direct column update failed, falling back to emotional_profile:", error);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("profiles") as any)
            .update({
              name,
              intention,
              signature_mood: archetype.mood,
              onboarding_complete: true,
              emotional_profile: {
                name,
                intention,
                onboarding_complete: true,
                mbti_personality: mbtiType,
                mbti_scores: mbtiScores,
              },
            })
            .eq("id", user.id);
        }
      } catch (err) {
        console.error("Error saving MBTI onboarding profile:", err);
      }
    }

    setSaving(false);
    onComplete();
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-6">
      <AnimatePresence mode="wait">
        {/* STEP 1: NAME INPUT */}
        {step === "name" && (
          <motion.div
            key="name-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-6 text-center"
          >
            <div className="flex justify-center mb-2">
              <BookOpen className="w-12 h-12 text-gold animate-pulse" />
            </div>
            <h2 className="display text-3xl text-ink">Welcome, traveler.</h2>
            <p className="handwritten text-ink-soft text-lg">
              Before we open the pages, what name should we write on the cover of your book?
            </p>

            <div className="relative pt-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="your name..."
                maxLength={40}
                className="w-full bg-transparent text-center handwritten text-3xl text-ink focus:outline-none border-b border-dashed border-ink-soft/40 py-2 focus:border-gold/60 transition-all placeholder:text-ink-soft/20"
              />
            </div>

            <motion.button
              onClick={handleStart}
              disabled={!nameInput.trim()}
              whileHover={nameInput.trim() ? { scale: 1.02 } : {}}
              whileTap={nameInput.trim() ? { scale: 0.98 } : {}}
              className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 text-ink display transition-opacity"
              style={{
                background: "var(--gradient-gold)",
                opacity: nameInput.trim() ? 1 : 0.5,
              }}
            >
              <span className="handwritten text-xl font-medium">begin the assessment</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2: TEST QUESTIONNAIRE */}
        {step === "test" && (
          <motion.div
            key={`q-${currentQIndex}`}
            initial={{ opacity: 0, x: 50, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -50, rotateY: -15 }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
            style={{ transformPerspective: 1200 }}
            className="w-full max-w-lg space-y-8"
          >
            {/* Batch & Progress Tracker */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs tracking-wider text-ink-soft/60 uppercase">
                <span>Chapter {currentBatch} of IV</span>
                <span>
                  Question {qInBatchIndex} of {totalQuestionsInBatch}
                </span>
              </div>
              <div className="h-1 bg-ink/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--gradient-gold)" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
              <span className="text-gold text-2xl">✦</span>
              <h3 className="display text-3xl sm:text-4xl text-ink leading-snug">
                "{QUESTIONS[currentQIndex].text}"
              </h3>
            </div>

            {/* Scale Options */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { label: "Yes", val: "yes" as const, color: "var(--gold)", emoji: "🌱" },
                {
                  label: "Sometimes",
                  val: "sometimes" as const,
                  color: "oklch(0.85 0.05 75)",
                  emoji: "💫",
                },
                { label: "No", val: "no" as const, color: "oklch(0.7 0.05 230)", emoji: "🍂" },
              ].map((opt) => (
                <motion.button
                  key={opt.label}
                  onClick={() => handleAnswer(opt.val)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-5 rounded-xl flex flex-col items-center justify-center transition-all border border-ink-soft/10 cursor-pointer"
                  style={{
                    background: "linear-gradient(180deg, oklch(0.97 0.04 85), oklch(0.92 0.06 75))",
                    boxShadow: "0 6px 16px oklch(0.2 0.05 50 / 0.08)",
                  }}
                >
                  <span className="text-3xl mb-2">{opt.emoji}</span>
                  <span className="handwritten text-lg text-ink font-medium">
                    {opt.label.toLowerCase()}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Back Button */}
            {currentQIndex > 0 && (
              <button
                onClick={() => setCurrentQIndex((idx) => idx - 1)}
                className="flex items-center gap-1.5 text-sm text-ink-soft/60 hover:text-ink transition-colors pt-2 handwritten"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>go back one page</span>
              </button>
            )}
          </motion.div>
        )}

        {/* STEP 3: CONFIRM NEXT BATCH */}
        {step === "confirm-next" && (
          <motion.div
            key="confirm-step"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8 text-center"
          >
            <div className="flex justify-center">
              <Sparkles className="w-12 h-12 text-gold animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="display text-3xl text-ink">End of Chapter {currentBatch}.</h2>
              <p className="handwritten text-ink-soft text-lg leading-relaxed">
                You have completed a chapter of your self-exploration. Do you want to continue to
                the next set of questions to refine your personality results?
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <motion.button
                onClick={handleContinueBatch}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 text-ink display"
                style={{ background: "var(--gradient-gold)" }}
              >
                <span className="handwritten text-lg font-medium">Yes, let's continue</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={handleFinishEarly}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 border border-gold/40 text-gold display transition-all hover:bg-gold/5"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="handwritten text-lg font-medium">No, show results now</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: RESULT SCREEN */}
        {step === "result" && (
          <motion.div
            key="result-step"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            className="w-full max-w-xl space-y-8"
          >
            {/* Personality Header Banner */}
            <div
              className="p-8 rounded-2xl text-center space-y-3 relative overflow-hidden"
              style={{
                background: MBTI_TYPES[mbtiType]?.gradient || MBTI_TYPES.INFP.gradient,
                boxShadow: "0 15px 35px -10px oklch(0.2 0.05 50 / 0.3)",
              }}
            >
              {/* Decorative sparkles */}
              <div className="absolute top-4 left-4 opacity-30 text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="absolute bottom-4 right-4 opacity-30 text-white">
                <Heart className="w-5 h-5" />
              </div>

              <span className="text-white/60 uppercase tracking-widest text-xs handwritten">
                {MBTI_TYPES[mbtiType]?.category || "Diplomat Types"}
              </span>
              <h2 className="display text-5xl text-white font-bold tracking-tight">{mbtiType}</h2>
              <p className="handwritten text-white text-2xl italic">
                the {MBTI_TYPES[mbtiType]?.title || "Idealist"}
              </p>
            </div>

            {/* Description Text */}
            <div className="paper-card p-6 rounded-xl space-y-3 border border-ink-soft/10 bg-paper">
              <span className="text-xs uppercase tracking-widest text-ink/40 font-semibold">
                archetype summary
              </span>
              <p className="display text-xl text-ink leading-relaxed font-light">
                {MBTI_TYPES[mbtiType]?.description}
              </p>
            </div>

            {/* Scores summary */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Energy Style",
                  l1: "E (Extraversion)",
                  s1: mbtiScores.E || 0,
                  l2: "I (Introversion)",
                  s2: mbtiScores.I || 0,
                },
                {
                  label: "Information Style",
                  l1: "S (Sensing)",
                  s1: mbtiScores.S || 0,
                  l2: "N (Intuition)",
                  s2: mbtiScores.N || 0,
                },
                {
                  label: "Decision Style",
                  l1: "T (Thinking)",
                  s1: mbtiScores.T || 0,
                  l2: "F (Feeling)",
                  s2: mbtiScores.F || 0,
                },
                {
                  label: "Lifestyle Style",
                  l1: "J (Judging)",
                  s1: mbtiScores.J || 0,
                  l2: "P (Perceiving)",
                  s2: mbtiScores.P || 0,
                },
              ].map((dim) => {
                const total = dim.s1 + dim.s2 || 1;
                const p1 = (dim.s1 / total) * 100;
                return (
                  <div
                    key={dim.label}
                    className="p-4 rounded-xl border border-ink-soft/5 space-y-2 text-xs"
                    style={{ background: "oklch(0.97 0.04 85 / 0.5)" }}
                  >
                    <span className="text-ink-soft/60 uppercase font-semibold">{dim.label}</span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-ink">
                        <span>{dim.l1}</span>
                        <span>{dim.l2}</span>
                      </div>
                      <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-gold" style={{ width: `${p1}%` }} />
                        <div className="h-full bg-ink/30" style={{ width: `${100 - p1}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Set Intention Form */}
            <div className="space-y-4 pt-4 border-t border-dashed border-ink-soft/20">
              <div className="space-y-1 text-center">
                <h3 className="display text-xl text-ink">What is your intention for this diary?</h3>
                <p className="handwritten text-ink-soft text-base">
                  Finish this sentence to finalize your prologue chapter.
                </p>
              </div>

              <div
                className="p-5 rounded-xl"
                style={{
                  background:
                    "repeating-linear-gradient(transparent 0 27px, oklch(0.7 0.05 230 / 0.1) 27px 28px)",
                  boxShadow: "inset 0 0 20px oklch(0.7 0.06 60 / 0.1)",
                  border: "1px solid oklch(0.78 0.13 75 / 0.2)",
                }}
              >
                <span className="handwritten text-2xl text-ink-soft mr-2">I am here to</span>
                <textarea
                  value={intentionInput}
                  onChange={(e) => setIntentionInput(e.target.value)}
                  placeholder="explore my feelings and heal at my own pace…"
                  rows={2}
                  className="w-full bg-transparent resize-none handwritten text-2xl text-ink placeholder:text-ink-soft/30 focus:outline-none leading-7"
                />
              </div>

              <motion.button
                onClick={handleFinishTest}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-full flex items-center justify-center gap-2 text-ink display font-medium"
                style={{ background: "var(--gradient-gold)" }}
              >
                {saving ? (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="handwritten text-xl"
                  >
                    writing personality signature into book…
                  </motion.span>
                ) : (
                  <span className="handwritten text-xl">open your storybook ✦</span>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
