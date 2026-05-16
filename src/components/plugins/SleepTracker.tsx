import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPluginData, savePluginData } from "@/services/plugins";

interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  quality: number;
  note: string;
}
interface SleepData {
  sessions: SleepEntry[];
}

const QUALITY_LABELS = ["", "terrible", "poor", "okay", "good", "wonderful"];

export function SleepTracker() {
  const [sessions, setSessions] = useState<SleepEntry[]>([]);
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(3);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPluginData<SleepData>("sleep-tracker").then((d) => {
      if (d?.sessions) setSessions(d.sessions);
    });
  }, []);

  const logSleep = async () => {
    setSaving(true);
    const entry: SleepEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      hours,
      quality,
      note,
    };
    const updated = [entry, ...sessions];
    setSessions(updated);
    setNote("");
    await savePluginData("sleep-tracker", { sessions: updated });
    setSaving(false);
  };

  const avgHours = sessions.length
    ? (
        sessions.slice(0, 7).reduce((s, e) => s + e.hours, 0) / Math.min(sessions.length, 7)
      ).toFixed(1)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🌙</span>
        <div>
          <h3 className="display text-2xl text-ink">Sleep Tracker</h3>
          <p className="handwritten text-ink-soft text-base">how did you rest last night? —</p>
        </div>
      </div>

      <div
        className="p-5 rounded-xl space-y-4"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.2 0.05 270 / 0.15), oklch(0.15 0.04 250 / 0.1))",
          border: "1px dashed oklch(0.78 0.08 230 / 0.3)",
        }}
      >
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs uppercase tracking-widest text-ink/50">hours slept</span>
            <span className="display text-2xl text-ink">{hours}h</span>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: "oklch(0.78 0.08 230)" }}
          />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-ink/50">sleep quality</span>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((q) => (
              <motion.button
                key={q}
                onClick={() => setQuality(q)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="flex-1 py-2 rounded-lg text-xl transition-all"
                style={{
                  background:
                    quality >= q
                      ? "linear-gradient(135deg, oklch(0.75 0.08 230), oklch(0.65 0.1 250))"
                      : "oklch(0.88 0.05 75 / 0.5)",
                }}
              >
                {"★"}
              </motion.button>
            ))}
          </div>
          <p className="handwritten text-ink-soft text-sm mt-1 text-center">
            {QUALITY_LABELS[quality]}
          </p>
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="any dreams or notes… (optional)"
          className="w-full bg-transparent handwritten text-lg text-ink placeholder:text-ink-soft/40 focus:outline-none border-b border-dashed border-ink-soft/20 py-1"
        />

        <motion.button
          onClick={logSleep}
          disabled={saving}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-2.5 rounded-full text-ink handwritten text-lg"
          style={{
            background: "linear-gradient(135deg, oklch(0.75 0.08 230), oklch(0.65 0.1 250))",
          }}
        >
          {saving ? "logging…" : "log this night"}
        </motion.button>
      </div>

      {/* History */}
      {sessions.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs uppercase tracking-widest text-ink/50">recent nights</p>
            {avgHours && (
              <p className="handwritten text-ink-soft text-sm">avg {avgHours}h / night</p>
            )}
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.96 0.04 80 / 0.7), oklch(0.9 0.06 75 / 0.5))",
                }}
              >
                <span className="text-xl">🌙</span>
                <div className="flex-1">
                  <p className="handwritten text-ink text-base">
                    {s.hours}h · {QUALITY_LABELS[s.quality]}
                  </p>
                  <p className="text-xs text-ink-soft/60">
                    {new Date(s.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex">
                  {Array.from({ length: s.quality }).map((_, i) => (
                    <span key={i} className="text-sm" style={{ color: "oklch(0.75 0.08 230)" }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
