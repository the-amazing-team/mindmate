import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Zap } from "lucide-react";
import { useStorybook } from "@/lib/storybook-context";
import { useAIChat } from "@/hooks/use-ai-chat";
import { useVoice } from "@/hooks/use-voice";
import { detectCrisis } from "@/lib/crisis-detector";
import { CrisisOverlay } from "@/components/crisis/CrisisOverlay";

type CompanionMode = "default" | "anxiety" | "motivational" | "reflective" | "grounding";

const MODE_LABELS: Record<CompanionMode, { label: string; emoji: string }> = {
  default: { label: "companion", emoji: "💬" },
  anxiety: { label: "calm", emoji: "🌊" },
  motivational: { label: "uplift", emoji: "⚡" },
  reflective: { label: "reflect", emoji: "🔮" },
  grounding: { label: "ground", emoji: "🌿" },
};

export function CompanionChapter() {
  const { mood, triggerCounts } = useStorybook();
  const [opened, setOpened] = useState(false);
  const [draft, setDraft] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [crisisState, setCrisisState] = useState<{
    level: "none" | "concern" | "crisis";
    exercise: string;
  }>({ level: "none", exercise: "" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isStreaming, mode, setMode, sendMessage, stopStreaming } = useAIChat();

  const voice = useVoice({
    onFinalTranscript: (text) => {
      setDraft(text);
    },
  });

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Speak AI responses when voice is enabled
  useEffect(() => {
    if (!voiceEnabled || isStreaming) return;
    const last = messages[messages.length - 1];
    if (last?.from === "mate" && last.text && !last.streaming) {
      voice.speak(last.text);
    }
  }, [messages, isStreaming, voiceEnabled]);

  const send = () => {
    const t = draft.trim();
    if (!t || isStreaming) return;

    // Crisis check before sending
    const crisis = detectCrisis(t);
    if (crisis.level !== "none") {
      setCrisisState({ level: crisis.level, exercise: crisis.groundingExercise });
    }

    sendMessage(t);
    setDraft("");
    textareaRef.current?.focus();
  };

  if (!opened) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="display text-4xl text-ink mb-3">The Listening Room</h2>
        <p className="handwritten text-ink-soft text-xl mb-12">pick up the pen to begin —</p>
        <motion.button
          onClick={() => setOpened(true)}
          whileHover={{ rotate: -8, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          <div
            className="w-56 h-2 rounded-full mx-auto mb-3"
            style={{ background: "var(--gradient-gold)" }}
          />
          <Feather className="w-32 h-32 mx-auto text-ink animate-sway" strokeWidth={1} />
          <p className="handwritten text-lg text-ink mt-4">tap the fountain pen</p>
        </motion.button>
        <p className="handwritten text-ink-soft/50 text-sm mt-8 max-w-xs">
          powered by AI · your companion remembers · always safe
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Crisis overlay */}
      <AnimatePresence>
        {crisisState.level !== "none" && (
          <CrisisOverlay
            level={crisisState.level}
            groundingExercise={crisisState.exercise}
            onDismiss={() => setCrisisState({ level: "none", exercise: "" })}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ clipPath: "circle(0% at 0% 100%)" }}
        animate={{ clipPath: "circle(150% at 0% 100%)" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="grid lg:grid-cols-[1fr_2fr] gap-8 min-h-[60vh]"
      >
        {/* Left panel: memory + mode switcher */}
        <div className="flex flex-col px-2">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-ink-soft" />
            <h3 className="display text-xl text-ink">Emotional memory</h3>
          </div>
          <p className="handwritten text-ink-soft text-sm mb-4 italic">
            "the pages remember what you've shared."
          </p>

          {/* Trigger counts */}
          {triggerCounts.length > 0 && (
            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">
                recurring threads
              </p>
              <div className="flex flex-wrap gap-1.5">
                {triggerCounts.slice(0, 6).map((t) => (
                  <motion.span
                    key={t.trigger}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-1 rounded-full handwritten text-sm text-ink"
                    style={{
                      background:
                        "linear-gradient(180deg, oklch(0.95 0.05 80), oklch(0.88 0.06 70))",
                      boxShadow: "0 2px 6px oklch(0.2 0.05 50 / 0.18)",
                    }}
                  >
                    {t.trigger} · {t.count}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          <div className="ink-divider w-full my-4" />

          {/* Mode switcher */}
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">companion mode</p>
          <div className="flex flex-wrap gap-1.5">
            {(
              Object.entries(MODE_LABELS) as [CompanionMode, { label: string; emoji: string }][]
            ).map(([key, val]) => (
              <motion.button
                key={key}
                onClick={() => setMode(key)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-full handwritten text-sm transition-all"
                style={{
                  background:
                    mode === key
                      ? "var(--gradient-gold)"
                      : "linear-gradient(180deg, oklch(0.95 0.04 80), oklch(0.88 0.06 70))",
                  color: "var(--ink)",
                  boxShadow: mode === key ? "0 4px 12px oklch(0.78 0.13 75 / 0.3)" : "none",
                }}
              >
                {val.emoji} {val.label}
              </motion.button>
            ))}
          </div>

          <div className="ink-divider w-full my-4" />
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">tone · {mood}</p>

          {/* Voice toggle */}
          <div className="mt-auto pt-4">
            <button
              onClick={() => setVoiceEnabled((v) => !v)}
              className="flex items-center gap-2 text-ink-soft hover:text-ink transition-colors text-sm"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="handwritten">{voiceEnabled ? "voice on" : "voice off"}</span>
            </button>
          </div>
        </div>

        {/* Right panel: chat */}
        <div className="flex flex-col">
          <div ref={scrollRef} className="flex-1 max-h-[55vh] overflow-y-auto pr-3 space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={m.from === "you" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={`max-w-[85%] ${
                      m.from === "you"
                        ? "handwritten text-2xl text-ink leading-snug"
                        : "display text-xl text-ink-soft italic leading-relaxed"
                    }`}
                    style={
                      m.from === "you"
                        ? { borderBottom: "1px dashed oklch(0.5 0.05 50 / 0.3)", paddingBottom: 6 }
                        : undefined
                    }
                  >
                    {m.text}
                    {m.streaming && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="inline-block ml-1 text-ink-soft"
                      >
                        ▍
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input area */}
          <div className="mt-6 flex items-end gap-3 pt-4 border-t border-dashed border-ink-soft/20">
            {/* Voice mic button */}
            {voice.supported && (
              <motion.button
                onClick={voice.toggleListening}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="shrink-0 p-3 rounded-full transition-all relative"
                style={{
                  background: voice.isListening
                    ? "linear-gradient(135deg, oklch(0.75 0.08 230), oklch(0.65 0.1 250))"
                    : "oklch(0.88 0.05 75 / 0.6)",
                }}
              >
                {voice.isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ background: "oklch(0.75 0.08 230 / 0.4)" }}
                  />
                )}
                {voice.isListening ? (
                  <MicOff className="w-4 h-4 text-moonlight" />
                ) : (
                  <Mic className="w-4 h-4 text-ink" />
                )}
              </motion.button>
            )}

            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={voice.isListening ? "listening…" : "write a thought…"}
              rows={2}
              className="flex-1 bg-transparent resize-none handwritten text-2xl text-ink placeholder:text-ink-soft/40 focus:outline-none"
            />

            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="shrink-0 p-3 rounded-full text-ink-soft hover:text-ink transition-colors"
                style={{ background: "oklch(0.88 0.05 75 / 0.5)" }}
                title="stop"
              >
                <Zap className="w-4 h-4" />
              </button>
            ) : (
              <motion.button
                onClick={send}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={!draft.trim()}
                className="shrink-0 p-3 rounded-full text-ink disabled:opacity-40"
                style={{ background: "var(--gradient-gold)" }}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {voice.transcript && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="handwritten text-ink-soft/60 text-sm mt-2 px-1"
            >
              hearing: "{voice.transcript}"
            </motion.p>
          )}
        </div>
      </motion.div>
    </>
  );
}
