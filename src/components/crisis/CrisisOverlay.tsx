import { motion, AnimatePresence } from "framer-motion";
import { Heart, Phone } from "lucide-react";
import { CRISIS_RESOURCES, type CrisisLevel } from "@/lib/crisis-detector";

interface CrisisOverlayProps {
  level: CrisisLevel;
  groundingExercise: string;
  onDismiss: () => void;
}

export function CrisisOverlay({ level, groundingExercise, onDismiss }: CrisisOverlayProps) {
  if (level === "none") return null;

  const isCrisis = level === "crisis";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-6"
        style={{
          background: isCrisis ? "oklch(0.12 0.04 280 / 0.85)" : "oklch(0.12 0.03 260 / 0.7)",
          backdropFilter: "blur(16px)",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="paper rounded-3xl p-8 sm:p-10 max-w-lg w-full relative overflow-hidden"
          style={{ boxShadow: "var(--shadow-page)" }}
        >
          {/* Soft ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              background: isCrisis
                ? "radial-gradient(ellipse at 50% 0%, oklch(0.78 0.08 230 / 0.12), transparent 70%)"
                : "radial-gradient(ellipse at 50% 0%, oklch(0.78 0.13 75 / 0.08), transparent 70%)",
            }}
          />

          {/* Heart icon — calm, not alarming */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-5"
          >
            <Heart
              className="w-10 h-10"
              style={{ color: isCrisis ? "oklch(0.78 0.08 230)" : "var(--gold)" }}
              strokeWidth={1.2}
            />
          </motion.div>

          {/* Main message */}
          <div className="text-center mb-6">
            <h3 className="display text-2xl text-ink mb-3">
              {isCrisis ? "You are not alone in this." : "I hear how much you're carrying."}
            </h3>
            <p className="handwritten text-ink-soft text-lg leading-relaxed">
              {isCrisis
                ? "Before anything else — take one breath with me. Just one."
                : "It's okay to feel this way. Let's slow down together for a moment."}
            </p>
          </div>

          {/* Grounding exercise */}
          <div
            className="p-5 rounded-2xl mb-6"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.96 0.04 230 / 0.5), oklch(0.94 0.03 260 / 0.4))",
              border: "1px dashed oklch(0.78 0.08 230 / 0.3)",
            }}
          >
            <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">grounding exercise</p>
            <p className="display text-base text-ink italic leading-relaxed">{groundingExercise}</p>
          </div>

          {/* Crisis resources — shown gently when crisis level */}
          {isCrisis && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <p className="handwritten text-ink-soft text-base mb-3 text-center">
                {CRISIS_RESOURCES.title}
              </p>
              <div className="space-y-2">
                {CRISIS_RESOURCES.resources.slice(0, 2).map((r) => (
                  <a
                    key={r.name}
                    href={r.url}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.9 0.06 75 / 0.6), oklch(0.88 0.05 70 / 0.5))",
                      border: "1px solid oklch(0.78 0.13 75 / 0.3)",
                    }}
                  >
                    <Phone className="w-4 h-4 shrink-0 text-ink-soft" strokeWidth={1.5} />
                    <div>
                      <p className="display text-sm text-ink">{r.name}</p>
                      <p className="handwritten text-ink-soft text-sm">{r.detail}</p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* Dismiss */}
          <div className="flex gap-3">
            <motion.button
              onClick={onDismiss}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-full text-ink display text-base"
              style={{
                background: "var(--gradient-gold)",
                boxShadow: "0 4px 20px oklch(0.78 0.13 75 / 0.3)",
              }}
            >
              <span className="handwritten text-lg">I'm okay, continue</span>
            </motion.button>
          </div>

          {/* Subtle note */}
          <p className="handwritten text-ink/30 text-xs text-center mt-4">
            this page stays private · you are safe here
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
