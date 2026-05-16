import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  chapterLabels,
  chapterOrder,
  chapterShort,
  useStorybook,
  type Chapter,
} from "@/lib/storybook-context";
import { useEffect, type ReactNode } from "react";

export function BookFrame({ children }: { children: ReactNode }) {
  const { chapter, setChapter } = useStorybook();
  const idx = chapterOrder.indexOf(chapter as Chapter);
  const canPrev = idx > 0;
  const canNext = idx < chapterOrder.length - 1;

  const go = (dir: -1 | 1) => {
    const next = chapterOrder[idx + dir];
    if (next) setChapter(next);
  };

  // Keyboard arrows for page-flip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // Drag-to-flip
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-300, 0, 300], [-22, 0, 22]);
  const shadow = useTransform(
    x,
    [-300, 0, 300],
    [
      "0 30px 60px -20px oklch(0.1 0.05 50 / 0.6)",
      "0 30px 60px -20px oklch(0.1 0.05 50 / 0.5)",
      "0 30px 60px -20px oklch(0.1 0.05 50 / 0.6)",
    ],
  );

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-8">
      {/* Book shadow */}
      <div
        className="absolute -inset-4 rounded-4xl blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.78 0.13 75 / 0.2), transparent 70%)",
        }}
      />

      <motion.div
        className="relative rounded-3xl overflow-hidden paper"
        style={{
          minHeight: "min(82vh, 760px)",
          boxShadow: shadow as unknown as string,
          rotateY,
          transformPerspective: 1600,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          if (info.offset.x < -120 && canNext) go(1);
          else if (info.offset.x > 120 && canPrev) go(-1);
        }}
      >
        {/* Spine highlight */}
        <div
          className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, oklch(0 0 0 / 0.18), transparent)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-3 pointer-events-none"
          style={{
            background: "linear-gradient(270deg, oklch(0 0 0 / 0.12), transparent)",
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 sm:px-12 pt-6">
          <div className="handwritten text-ink-soft text-lg">MindMate</div>
          <div className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Ch. {idx + 1} · {chapterLabels[chapter]}
          </div>
          <div className="handwritten text-ink-soft text-lg italic hidden sm:block">
            a living storybook
          </div>
        </div>

        {/* Chapter tabs */}
        <div className="relative z-10 flex flex-wrap justify-center gap-1.5 mt-3 px-4">
          {chapterOrder.map((c, i) => {
            const active = c === chapter;
            return (
              <motion.button
                key={c}
                onClick={() => setChapter(c)}
                whileHover={{ y: -3 }}
                whileTap={{ y: 0, scale: 0.96 }}
                className="relative px-3 sm:px-4 py-1.5 rounded-t-md handwritten text-sm sm:text-base"
                style={{
                  background: active
                    ? "var(--gradient-gold)"
                    : "linear-gradient(180deg, oklch(0.92 0.05 75), oklch(0.85 0.06 70))",
                  color: "var(--ink)",
                  boxShadow: active
                    ? "0 -2px 0 oklch(0.55 0.13 30) inset, 0 6px 14px -8px oklch(0.2 0.05 50 / 0.5)"
                    : "0 2px 4px oklch(0.2 0.05 50 / 0.18)",
                  transform: active ? "translateY(-2px)" : "none",
                  borderBottom: active ? "none" : "1px dashed oklch(0.5 0.05 50 / 0.25)",
                }}
                title={chapterLabels[c]}
              >
                <span className="text-xs uppercase tracking-widest text-ink/50 mr-1">{i + 1}</span>
                {chapterShort[c]}
              </motion.button>
            );
          })}
        </div>

        {/* Page content */}
        <div className="relative z-10 px-6 sm:px-12 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={chapter}
              initial={{ rotateY: 25, opacity: 0, x: 80 }}
              animate={{ rotateY: 0, opacity: 1, x: 0 }}
              exit={{ rotateY: -25, opacity: 0, x: -80 }}
              transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
              style={{ transformPerspective: 1400, transformOrigin: "left center" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* hidden motion value carrier */}
        <motion.div style={{ x }} className="absolute -z-10" />

        {/* Page corner curl */}
        <motion.button
          onClick={() => canNext && go(1)}
          whileHover={canNext ? { scale: 1.05 } : undefined}
          className="absolute bottom-0 right-0 w-20 h-20 cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, oklch(0.85 0.05 70 / 0.6) 50%, oklch(0.7 0.05 60 / 0.4))",
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            opacity: canNext ? 1 : 0.4,
          }}
          title={canNext ? "flip page" : ""}
        />

        {/* Footer nav */}
        <div className="relative z-10 flex items-center justify-between px-6 sm:px-12 pb-6 pt-4">
          <button
            onClick={() => go(-1)}
            disabled={!canPrev}
            className="group flex items-center gap-2 text-ink-soft hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="handwritten text-base">previous page</span>
          </button>

          <p className="handwritten text-ink/40 text-xs hidden md:block">
            ← swipe or use arrow keys →
          </p>

          <button
            onClick={() => go(1)}
            disabled={!canNext}
            className="group flex items-center gap-2 text-ink-soft hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="handwritten text-base">next page</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>

      {/* Bookmark ribbon */}
      <div
        className="absolute top-0 right-16 w-6 h-32 animate-sway"
        style={{
          background: "linear-gradient(180deg, oklch(0.55 0.18 25), oklch(0.4 0.16 20))",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
          transformOrigin: "top center",
          boxShadow: "0 4px 12px oklch(0 0 0 / 0.3)",
        }}
      />
    </div>
  );
}
