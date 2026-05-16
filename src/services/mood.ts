// ============================================================
// Mood Tracking Server Functions
// ============================================================

import { supabase, isDemoMode, requireUserId } from "@/lib/supabase";
import type { Mood } from "@/lib/storybook-context";

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: Mood;
  energy_level: number | null;
  anxiety_level: number | null;
  note: string | null;
  created_at: string;
}

const LS_MOOD = "mindmate.mood.v2";

function getLocalMoods(): MoodEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_MOOD) ?? "[]");
  } catch {
    return [];
  }
}

function setLocalMoods(entries: MoodEntry[]) {
  try {
    localStorage.setItem(LS_MOOD, JSON.stringify(entries.slice(0, 500)));
  } catch {
    /* ignore */
  }
}

export async function trackMood(params: {
  mood: Mood;
  energy_level?: number;
  anxiety_level?: number;
  note?: string;
}): Promise<MoodEntry> {
  const entry: MoodEntry = {
    id: crypto.randomUUID(),
    user_id: "",
    mood: params.mood,
    energy_level: params.energy_level ?? null,
    anxiety_level: params.anxiety_level ?? null,
    note: params.note ?? null,
    created_at: new Date().toISOString(),
  };

  if (isDemoMode || !supabase) {
    const moods = getLocalMoods();
    moods.unshift(entry);
    setLocalMoods(moods);
    return entry;
  }

  try {
    const userId = await requireUserId();
    entry.user_id = userId;
    const { data, error } = await supabase!
      .from("mood_tracking")
      .insert({
        user_id: userId,
        mood: entry.mood,
        energy_level: entry.energy_level,
        anxiety_level: entry.anxiety_level,
        note: entry.note,
        created_at: entry.created_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();
    if (error) throw error;
    return data as MoodEntry;
  } catch {
    const moods = getLocalMoods();
    moods.unshift(entry);
    setLocalMoods(moods);
    return entry;
  }
}

export async function getMoodHistory(days = 7): Promise<MoodEntry[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString();

  if (isDemoMode || !supabase) {
    return getLocalMoods().filter((m) => m.created_at > since);
  }

  try {
    const userId = await requireUserId();
    const { data, error } = await supabase!
      .from("mood_tracking")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as MoodEntry[]) ?? [];
  } catch {
    return getLocalMoods().filter((m) => m.created_at > since);
  }
}

/** Aggregate mood distribution for the past N days */
export async function getMoodDistribution(days = 30): Promise<Record<string, number>> {
  const history = await getMoodHistory(days);
  return history.reduce(
    (acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}
