import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPluginData, savePluginData } from "@/services/plugins";

interface CBTRecord {
  id: string;
  date: string;
  thought: string;
  reframe: string;
  emotion: string;
}
interface CBTData {
  records: CBTRecord[];
}

const EMOTION_OPTIONS = ["anxious", "sad", "angry", "ashamed", "hopeless", "overwhelmed", "other"];

export function CBTRecord() {
  const [records, setRecords] = useState<CBTRecord[]>([]);
  const [thought, setThought] = useState("");
  const [reframe, setReframe] = useState("");
  const [emotion, setEmotion] = useState("anxious");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getPluginData<CBTData>("cbt-records").then((d) => {
      if (d?.records) setRecords(d.records);
    });
  }, []);

  const save = async () => {
    if (!thought.trim() || !reframe.trim() || saving) return;
    setSaving(true);
    const entry: CBTRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      thought: thought.trim(),
      reframe: reframe.trim(),
      emotion,
    };
    const updated = [entry, ...records];
    setRecords(updated);
    setThought("");
    setReframe("");
    await savePluginData("cbt-records", { records: updated });
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🧠</span>
        <div>
          <h3 className="display text-2xl text-ink">Thought Reframing</h3>
          <p className="handwritten text-ink-soft text-base">CBT-inspired thought records —</p>
        </div>
      </div>

      <div
        className="p-5 rounded-xl space-y-4"
        style={{
          background: "linear-gradient(180deg, oklch(0.96 0.04 80), oklch(0.9 0.06 75))",
          boxShadow: "0 4px 16px oklch(0.2 0.05 50 / 0.15)",
        }}
      >
        <div>
          <span className="text-xs uppercase tracking-widest text-ink/50">
            the thought that's bothering you
          </span>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            rows={2}
            placeholder="I'm not good enough…"
            className="w-full bg-transparent resize-none handwritten text-lg text-ink placeholder:text-ink-soft/40 focus:outline-none border-b border-dashed border-ink-soft/25 py-1 mt-1"
          />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-ink/50">emotion underneath</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {EMOTION_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmotion(e)}
                className="px-2.5 py-1 rounded-full handwritten text-sm transition-all"
                style={{
                  background: emotion === e ? "var(--gradient-gold)" : "oklch(0.88 0.05 75 / 0.5)",
                  color: "var(--ink)",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-ink/50">a kinder reframe</span>
          <textarea
            value={reframe}
            onChange={(e) => setReframe(e.target.value)}
            rows={2}
            placeholder="What would I say to a friend who thought this?…"
            className="w-full bg-transparent resize-none handwritten text-lg text-ink placeholder:text-ink-soft/40 focus:outline-none border-b border-dashed border-ink-soft/25 py-1 mt-1"
          />
        </div>

        <motion.button
          onClick={save}
          disabled={saving || !thought.trim() || !reframe.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-2.5 rounded-full text-ink handwritten text-lg disabled:opacity-40"
          style={{ background: "var(--gradient-gold)" }}
        >
          {saving ? "recording…" : "record this thought"}
        </motion.button>
      </div>

      {records.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-ink/50">
            {records.length} thought record{records.length !== 1 ? "s" : ""}
          </p>
          {records.slice(0, 5).map((r) => (
            <motion.div
              key={r.id}
              whileHover={{ x: 3 }}
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              className="p-4 rounded-xl cursor-pointer"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.96 0.04 80 / 0.7), oklch(0.9 0.06 75 / 0.5))",
              }}
            >
              <div className="flex justify-between items-start">
                <p className="display text-base text-ink line-clamp-1 flex-1">{r.thought}</p>
                <span className="handwritten text-xs text-ink-soft/60 ml-2 shrink-0">
                  {new Date(r.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {expanded === r.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-2"
                >
                  <p className="text-xs uppercase tracking-widest text-ink/40">
                    feeling: {r.emotion}
                  </p>
                  <p className="handwritten text-base text-ink-soft">→ {r.reframe}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
