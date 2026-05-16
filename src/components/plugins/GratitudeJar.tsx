import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPluginData, savePluginData } from "@/services/plugins";

interface GratitudeEntry {
  id: string;
  text: string;
  date: string;
}
interface GratitudeData {
  entries: GratitudeEntry[];
}

export function GratitudeJar() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<GratitudeEntry | null>(null);

  useEffect(() => {
    getPluginData<GratitudeData>("gratitude-jar").then((d) => {
      if (d?.entries) setEntries(d.entries);
    });
  }, []);

  const add = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    const entry: GratitudeEntry = {
      id: crypto.randomUUID(),
      text: draft.trim(),
      date: new Date().toISOString(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    setDraft("");
    await savePluginData("gratitude-jar", { entries: updated });
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🫙</span>
        <div>
          <h3 className="display text-2xl text-ink">Gratitude Jar</h3>
          <p className="handwritten text-ink-soft text-base">
            fold in one thing you're grateful for —
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3 items-end">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              add();
            }
          }}
          placeholder="today I'm grateful for…"
          rows={2}
          className="flex-1 bg-transparent resize-none handwritten text-xl text-ink placeholder:text-ink-soft/40 focus:outline-none border-b border-dashed border-ink-soft/25 py-1"
        />
        <motion.button
          onClick={add}
          disabled={saving || !draft.trim()}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="px-4 py-2 rounded-full text-ink handwritten text-base disabled:opacity-40"
          style={{ background: "var(--gradient-gold)" }}
        >
          {saving ? "…" : "fold in"}
        </motion.button>
      </div>

      {/* Jar contents */}
      <div
        className="relative rounded-2xl p-4 min-h-45 overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.88 0.08 75 / 0.5), oklch(0.82 0.1 65 / 0.4))",
          border: "2px solid oklch(0.78 0.13 75 / 0.3)",
        }}
      >
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">
          {entries.length} gratitude{entries.length !== 1 ? "s" : ""} inside
        </p>
        {entries.length === 0 && (
          <p className="handwritten text-ink-soft/50 text-base italic text-center mt-8">
            the jar is waiting for your first note…
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {entries.slice(0, 12).map((e, i) => (
              <motion.button
                key={e.id}
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: i % 2 === 0 ? -3 : 3 }}
                whileHover={{ scale: 1.1, rotate: 0, zIndex: 10 }}
                onClick={() => setOpen(e)}
                className="px-3 py-2 rounded-lg handwritten text-sm text-ink cursor-pointer relative"
                style={{
                  background: "linear-gradient(135deg, oklch(0.97 0.04 80), oklch(0.9 0.07 70))",
                  boxShadow:
                    "0 3px 10px oklch(0.2 0.05 50 / 0.2), 0 1px 3px oklch(0.2 0.05 50 / 0.1)",
                  maxWidth: 140,
                }}
              >
                <span className="line-clamp-2 text-left">{e.text}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Open note modal */}
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
              initial={{ scale: 0.9, rotate: -5, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="paper max-w-sm w-full p-8 rounded-2xl text-center"
              style={{ boxShadow: "var(--shadow-page)" }}
            >
              <p className="text-4xl mb-4">🫙</p>
              <p className="handwritten text-ink-soft text-sm mb-3">
                {new Date(open.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="display text-xl text-ink italic leading-relaxed">{open.text}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
