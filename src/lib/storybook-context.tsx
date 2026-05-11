import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase, isDemoMode } from "./supabase";

export type Mood = "calm" | "joy" | "melancholy" | "anxious" | "hopeful";

export type Chapter =
  | "opening"
  | "home"
  | "companion"
  | "journal"
  | "insights"
  | "calm"
  | "plugins"
  | "profile";

export const chapterOrder: Chapter[] = [
  "home",
  "companion",
  "journal",
  "insights",
  "calm",
  "plugins",
  "profile",
];

export const chapterLabels: Record<Chapter, string> = {
  opening: "Prologue",
  home: "Emotional Universe",
  companion: "The Listening Room",
  journal: "The Living Diary",
  insights: "The Observatory",
  calm: "Safe Space",
  plugins: "The Apothecary",
  profile: "Your Self-Portrait",
};

export const chapterShort: Record<Chapter, string> = {
  opening: "Prologue",
  home: "Sky",
  companion: "Listen",
  journal: "Diary",
  insights: "Insights",
  calm: "Calm",
  plugins: "Magic",
  profile: "You",
};

export const moodPalette: Record<
  Mood,
  {
    color: string;
    glow: string;
    label: string;
    gradient: string;
    sky: string; // ambient background for the mood
    particle: string;
  }
> = {
  calm: {
    color: "oklch(0.78 0.08 230)",
    glow: "oklch(0.78 0.08 230 / 0.5)",
    label: "Calm",
    gradient: "linear-gradient(135deg, oklch(0.85 0.08 230), oklch(0.75 0.09 260))",
    sky: "radial-gradient(ellipse at 30% 20%, oklch(0.35 0.08 230) 0%, oklch(0.16 0.05 250) 55%, oklch(0.08 0.03 260) 100%)",
    particle: "oklch(0.85 0.1 230 / 0.55)",
  },
  joy: {
    color: "oklch(0.85 0.13 80)",
    glow: "oklch(0.85 0.13 80 / 0.5)",
    label: "Joyful",
    gradient: "linear-gradient(135deg, oklch(0.88 0.13 80), oklch(0.78 0.14 50))",
    sky: "radial-gradient(ellipse at 50% 25%, oklch(0.5 0.14 70) 0%, oklch(0.22 0.08 40) 55%, oklch(0.1 0.04 30) 100%)",
    particle: "oklch(0.9 0.14 80 / 0.7)",
  },
  melancholy: {
    color: "oklch(0.65 0.08 270)",
    glow: "oklch(0.65 0.08 270 / 0.5)",
    label: "Tender",
    gradient: "linear-gradient(135deg, oklch(0.7 0.08 270), oklch(0.55 0.09 250))",
    sky: "radial-gradient(ellipse at 60% 30%, oklch(0.28 0.07 290) 0%, oklch(0.13 0.04 270) 60%, oklch(0.06 0.02 260) 100%)",
    particle: "oklch(0.78 0.09 290 / 0.5)",
  },
  anxious: {
    color: "oklch(0.75 0.09 30)",
    glow: "oklch(0.75 0.09 30 / 0.5)",
    label: "Restless",
    gradient: "linear-gradient(135deg, oklch(0.8 0.09 30), oklch(0.7 0.1 10))",
    sky: "radial-gradient(ellipse at 40% 30%, oklch(0.32 0.1 25) 0%, oklch(0.16 0.06 15) 55%, oklch(0.08 0.03 350) 100%)",
    particle: "oklch(0.85 0.11 25 / 0.55)",
  },
  hopeful: {
    color: "oklch(0.78 0.1 155)",
    glow: "oklch(0.78 0.1 155 / 0.5)",
    label: "Hopeful",
    gradient: "linear-gradient(135deg, oklch(0.82 0.1 155), oklch(0.75 0.11 130))",
    sky: "radial-gradient(ellipse at 50% 25%, oklch(0.42 0.11 150) 0%, oklch(0.18 0.06 170) 55%, oklch(0.08 0.03 200) 100%)",
    particle: "oklch(0.85 0.12 150 / 0.6)",
  },
};

// ---------- Memory ----------

export type Memory = {
  id: string;
  at: number;
  source: "journal" | "companion";
  text: string;
  mood: Mood;
  triggers: string[];
};

const TRIGGER_DICT: Record<string, string> = {
  work: "work",
  job: "work",
  boss: "work",
  deadline: "work",
  meeting: "work",
  family: "family",
  mom: "family",
  dad: "family",
  parent: "family",
  sister: "family",
  brother: "family",
  partner: "relationship",
  boyfriend: "relationship",
  girlfriend: "relationship",
  husband: "relationship",
  wife: "relationship",
  friend: "friendship",
  lonely: "loneliness",
  alone: "loneliness",
  sleep: "sleep",
  tired: "sleep",
  insomnia: "sleep",
  money: "finances",
  rent: "finances",
  bills: "finances",
  health: "health",
  sick: "health",
  pain: "health",
  panic: "anxiety",
  anxious: "anxiety",
  worry: "anxiety",
  scared: "anxiety",
  sad: "sadness",
  cry: "sadness",
  grief: "grief",
  loss: "grief",
};

export function extractTriggers(text: string): string[] {
  const t = text.toLowerCase();
  const found = new Set<string>();
  for (const [k, v] of Object.entries(TRIGGER_DICT)) {
    if (new RegExp(`\\b${k}\\w*\\b`).test(t)) found.add(v);
  }
  return [...found];
}

export function detectMood(text: string): Mood {
  const t = text.toLowerCase();
  if (/(panic|anxious|worry|scared|afraid|overwhelm)/.test(t)) return "anxious";
  if (/(sad|cry|lonely|alone|grief|tired|hurt|empty)/.test(t)) return "melancholy";
  if (/(happy|joy|grateful|love|delight|excited|wonderful)/.test(t)) return "joy";
  if (/(hope|better|trying|forward|new|growing|believe)/.test(t)) return "hopeful";
  return "calm";
}

// ---------- Profile ----------

export type Profile = {
  name: string;
  intention: string;
  signatureMood: Mood;
  joinedAt: number;
  onboarding_complete?: boolean;
};

const defaultProfile: Profile = {
  name: "",
  intention: "to be gentler with myself",
  signatureMood: "calm",
  joinedAt: Date.now(),
};

// ---------- Context ----------

type Ctx = {
  chapter: Chapter;
  setChapter: (c: Chapter) => void;
  mood: Mood;
  setMood: (m: Mood) => void;
  enteredBook: boolean;
  enterBook: () => void;
  memories: Memory[];
  addMemory: (input: { text: string; source: Memory["source"]; mood?: Mood }) => void;
  clearMemories: () => void;
  triggerCounts: { trigger: string; count: number }[];
  profile: Profile;
  updateProfile: (p: Partial<Profile>) => void;
};

const StorybookCtx = createContext<Ctx | null>(null);

const LS_MEM = "mindmate.memories.v1";
const LS_PROFILE = "mindmate.profile.v1";

export function StorybookProvider({ children }: { children: ReactNode }) {
  const [chapter, setChapter] = useState<Chapter>("opening");
  const [mood, setMood] = useState<Mood>("calm");
  const [enteredBook, setEntered] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [profile, setProfile] = useState<Profile>(defaultProfile);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const m = localStorage.getItem(LS_MEM);
      if (m) setMemories(JSON.parse(m));
      const p = localStorage.getItem(LS_PROFILE);
      if (p) setProfile({ ...defaultProfile, ...JSON.parse(p) });
    } catch {
      /* ignore */
    }
  }, []);

  // Hydrate from Supabase if logged in
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data, error } = await supabase!
          .from("profiles")
          .select("intention, signature_mood, onboarding_complete")
          .eq("id", session.user.id)
          .single();

        if (data && !error) {
          setProfile((prev) => ({
            ...prev,
            intention: data.intention || prev.intention,
            signatureMood: (data.signature_mood as Mood) || prev.signatureMood,
            onboarding_complete: data.onboarding_complete,
          }));
        }
      } else if (event === "SIGNED_OUT") {
        setEntered(false);
        setChapter("opening");
        setProfile(defaultProfile);
        setMemories([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_MEM, JSON.stringify(memories.slice(0, 200)));
    } catch {
      /* ignore */
    }
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile]);

  const addMemory = useCallback<Ctx["addMemory"]>((input) => {
    const inferred = input.mood ?? detectMood(input.text);
    const triggers = extractTriggers(input.text);
    setMemories((prev) => [
      {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2),
        at: Date.now(),
        source: input.source,
        text: input.text.slice(0, 400),
        mood: inferred,
        triggers,
      },
      ...prev,
    ]);
    setMood(inferred);
  }, []);

  const triggerCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of memories) {
      for (const t of m.triggers) map.set(t, (map.get(t) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count);
  }, [memories]);

  const updateProfile = useCallback((p: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...p }));
  }, []);

  const clearMemories = useCallback(() => setMemories([]), []);

  return (
    <StorybookCtx.Provider
      value={{
        chapter,
        setChapter,
        mood,
        setMood,
        enteredBook,
        enterBook: () => {
          setEntered(true);
          setChapter("home");
        },
        memories,
        addMemory,
        clearMemories,
        triggerCounts,
        profile,
        updateProfile,
      }}
    >
      {children}
    </StorybookCtx.Provider>
  );
}

export function useStorybook(): Ctx {
  const ctx = useContext(StorybookCtx);
  if (!ctx) throw new Error("StorybookProvider missing");
  return ctx;
}
