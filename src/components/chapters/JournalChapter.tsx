import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Sparkles, Trash2, Loader } from "lucide-react";
import { useStorybook } from "@/lib/storybook-context";
import { detectCrisis } from "@/lib/crisis-detector";
import { CrisisOverlay } from "@/components/crisis/CrisisOverlay";
import {
  saveJournalEntry,
  getJournalEntries,
  deleteJournalEntry,
  type JournalEntry,
} from "@/services/journal";

export function JournalChapter() {
  const { addMemory, setMood } = useStorybook();
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [open, setOpen] = useState<JournalEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<{
    ai_analysis: string;
    ai_invitation: string;
    emotional_score: number;
    mood: string;
  } | null>(null);
  const [crisisState, setCrisisState] = useState<{
    level: "none" | "concern" | "crisis";
    exercise: string;
  }>({
    level: "none",
    exercise: "",
  });
  const [loadingEntries, setLoadingEntries] = useState(true);

  // Load entries on mount
  useEffect(() => {
    getJournalEntries()
      .then(setEntries)
      .finally(() => setLoadingEntries(false));
  }, []);

  // Live analysis preview (debounced)
  useEffect(() => {
    if (draft.length < 20) {
      setAnalysis(null);
      return;
    }
    const t = setTimeout(async () => {
      const { analyzeJournalEntry } = await import("@/services/ai/journal-analyzer");
      const result = await analyzeJournalEntry(draft);
      setAnalysis({
        ai_analysis: result.ai_analysis,
        ai_invitation: result.ai_invitation,
        emotional_score: result.emotional_score,
        mood: result.mood,
      });
    }, 1200);
    return () => clearTimeout(t);
  }, [draft]);

  const save = async () => {
    if (!draft.trim() || saving) return;

    // Crisis check
    const crisis = detectCrisis(draft);
    if (crisis.level !== "none") {
      setCrisisState({ level: crisis.level, exercise: crisis.groundingExercise });
    }

    setSaving(true);
    try {
      const { entry, analysis: result } = await saveJournalEntry({
        content: draft,
        title: title || undefined,
      });

      addMemory({
        text: draft,
        source: "journal",
        mood: result.mood as Parameters<typeof addMemory>[0]["mood"],
      });
      setMood(result.mood as Parameters<typeof setMood>[0]);

      setEntries((prev) => [entry, ...prev]);
      setAnalysis({
        ai_analysis: result.ai_analysis,
        ai_invitation: result.ai_invitation,
        emotional_score: result.emotional_score,
        mood: result.mood,
      });
      setDraft("");
      setTitle("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteJournalEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (open?.id === id) setOpen(null);
  };

  return (
    <>
      <AnimatePresence>
        {crisisState.level !== "none" && (
          <CrisisOverlay
            level={crisisState.level}
            groundingExercise={crisisState.exercise}
            onDismiss={() => setCrisisState({ level: "none", exercise: "" })}
          />
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        {/* Writing area */}
        <div>
          <h2 className="display text-4xl text-ink mb-1">The Living Diary</h2>
          <p className="handwritten text-ink-soft text-lg mb-6">ink your day onto the page —</p>

          {/* Title field */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="give this page a title… (optional)"
            className="w-full bg-transparent handwritten text-xl text-ink placeholder:text-ink-soft/40 focus:outline-none border-b border-dashed border-ink-soft/20 pb-2 mb-4"
          />

          {/* Paper-lined writing area */}
          <div
            className="relative p-6 rounded-lg"
            style={{
              background:
                "repeating-linear-gradient(transparent 0 28px, oklch(0.7 0.05 230 / 0.18) 28px 29px)",
              boxShadow: "inset 0 0 40px oklch(0.7 0.06 60 / 0.25)",
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Today I felt…"
              rows={8}
              className="w-full bg-transparent resize-none handwritten text-2xl text-ink leading-7 placeholder:text-ink-soft/40 focus:outline-none"
              style={{ lineHeight: "29px" }}
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs uppercase tracking-widest text-ink/50">
                {draft.split(/\s+/).filter(Boolean).length} words
              </span>
              <motion.button
                onClick={save}
                disabled={saving || !draft.trim()}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-full text-ink display text-base disabled:opacity-40 flex items-center gap-2"
                style={{ background: "var(--gradient-gold)" }}
              >
                {saving ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span className="handwritten">reflecting…</span>
                  </>
                ) : (
                  <span className="handwritten text-lg">press into page</span>
                )}
              </motion.button>
            </div>
          </div>

          {/* AI Analysis card */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-5 rounded-lg glass"
              >
                <div className="flex items-center gap-2 mb-3 text-ink-soft">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest">AI reflection</span>
                  {analysis.emotional_score !== undefined && (
                    <span className="ml-auto text-xs" style={{ color: "var(--gold)" }}>
                      wellness {Math.round(analysis.emotional_score)}%
                    </span>
                  )}
                </div>
                <p className="display text-lg text-ink italic mb-3 leading-relaxed">
                  {analysis.ai_analysis}
                </p>
                {analysis.ai_invitation && (
                  <p className="handwritten text-ink-soft text-base border-t border-dashed border-ink-soft/20 pt-3 mt-2">
                    ✦ {analysis.ai_invitation}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Memory shelf */}
        <div>
          <h3 className="display text-2xl text-ink mb-4">memory shelf</h3>
          {loadingEntries ? (
            <div className="flex items-center gap-2 text-ink-soft handwritten text-lg">
              <Loader className="w-4 h-4 animate-spin" />
              <span>gathering your pages…</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {entries.length === 0 && (
                <p className="handwritten text-ink-soft/60 text-base italic">
                  your entries will gather here, like pressed flowers.
                </p>
              )}
              {entries.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <motion.button
                    onClick={() => setOpen(e)}
                    whileHover={{ x: -4 }}
                    className="w-full text-left p-4 rounded-md flex gap-3 items-start"
                    style={{
                      background:
                        "linear-gradient(180deg, oklch(0.96 0.04 80), oklch(0.9 0.06 75))",
                      boxShadow: "0 6px 16px -8px oklch(0.2 0.05 50 / 0.3)",
                    }}
                  >
                    <Bookmark className="w-4 h-4 mt-1 shrink-0" style={{ color: "var(--gold)" }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="handwritten text-ink-soft text-sm">
                          {new Date(e.created_at).toLocaleDateString(undefined, {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded handwritten"
                          style={{
                            background: "oklch(0.88 0.06 70 / 0.6)",
                            color: "var(--ink-soft)",
                          }}
                        >
                          {e.mood}
                        </span>
                      </div>
                      {e.title && (
                        <p className="display text-sm text-ink font-medium mt-0.5">{e.title}</p>
                      )}
                      <p className="display text-sm text-ink truncate mt-0.5">{e.content}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-ink-soft/40 hover:text-rose-400"
                    title="delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entry modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "oklch(0.1 0.03 270 / 0.6)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.9, rotateX: -20, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="paper max-w-xl w-full p-8 rounded-2xl overflow-y-auto max-h-[80vh]"
              style={{ boxShadow: "var(--shadow-page)" }}
            >
              <p className="handwritten text-ink-soft mb-1">
                {new Date(open.created_at).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {open.title && <h3 className="display text-2xl text-ink mb-3">{open.title}</h3>}
              <p className="display text-xl text-ink leading-relaxed mb-6">{open.content}</p>

              {open.ai_analysis && (
                <div className="border-t border-dashed border-ink-soft/20 pt-4">
                  <div className="flex items-center gap-2 mb-2 text-ink-soft">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs uppercase tracking-widest">reflection</span>
                  </div>
                  <p className="display text-base text-ink-soft italic">{open.ai_analysis}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
