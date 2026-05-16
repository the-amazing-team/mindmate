// ============================================================
// Journal Server Functions — Supabase CRUD operations
// Falls back to localStorage in demo mode
// ============================================================

import { supabase, isDemoMode, requireUserId } from "@/lib/supabase";
import { analyzeJournalEntry, type JournalAnalysis } from "./ai/journal-analyzer";
import { detectCrisis } from "@/lib/crisis-detector";

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood: string;
  ai_analysis: string | null;
  ai_invitation: string | null;
  emotional_score: number | null;
  anxiety_score: number | null;
  stress_score: number | null;
  positivity_score: number | null;
  themes: string[] | null;
  crisis_flag: boolean;
  created_at: string;
}

const LS_JOURNAL = "mindmate.journal.v2";

function getLocalEntries(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_JOURNAL) ?? "[]");
  } catch {
    return [];
  }
}

function setLocalEntries(entries: JournalEntry[]) {
  try {
    localStorage.setItem(LS_JOURNAL, JSON.stringify(entries.slice(0, 200)));
  } catch {
    /* ignore */
  }
}

/**
 * Save a journal entry with AI analysis
 */
export async function saveJournalEntry(params: {
  content: string;
  title?: string;
  userName?: string;
}): Promise<{ entry: JournalEntry; analysis: JournalAnalysis }> {
  const { content, title, userName = "Dear One" } = params;

  // Run AI analysis and crisis detection in parallel
  const [analysis] = await Promise.all([analyzeJournalEntry(content, userName)]);

  const crisis = detectCrisis(content);

  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    user_id: "",
    title: title ?? null,
    content,
    mood: analysis.mood,
    ai_analysis: analysis.ai_analysis,
    ai_invitation: analysis.ai_invitation,
    emotional_score: analysis.emotional_score,
    anxiety_score: analysis.anxiety_score,
    stress_score: analysis.stress_score,
    positivity_score: analysis.positivity_score,
    themes: analysis.themes,
    crisis_flag: crisis.level === "crisis" || analysis.crisis_flag,
    created_at: new Date().toISOString(),
  };

  if (isDemoMode || !supabase) {
    // Local mode
    const entries = getLocalEntries();
    entries.unshift(entry);
    setLocalEntries(entries);
    return { entry, analysis };
  }

  try {
    const userId = await requireUserId();
    entry.user_id = userId;

    const { data, error } = await supabase!
      .from("journal_entries")
      .insert({
        user_id: userId,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        ai_analysis: entry.ai_analysis,
        ai_invitation: entry.ai_invitation,
        emotional_score: entry.emotional_score,
        anxiety_score: entry.anxiety_score,
        stress_score: entry.stress_score,
        positivity_score: entry.positivity_score,
        themes: entry.themes,
        crisis_flag: entry.crisis_flag,
        word_count: content.split(/\s+/).length,
        deleted_at: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();

    if (error) throw error;

    // Also save to emotional_memory for RAG
    await supabase!.from("emotional_memory").insert({
      user_id: userId,
      source: "journal",
      text: content.slice(0, 400),
      mood: entry.mood,
      triggers: analysis.themes,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return { entry: data as JournalEntry, analysis };
  } catch (error) {
    console.error("Supabase journal save failed, using local:", error);
    const entries = getLocalEntries();
    entries.unshift(entry);
    setLocalEntries(entries);
    return { entry, analysis };
  }
}

/**
 * Get journal entries (paginated)
 */
export async function getJournalEntries(page = 0, limit = 20): Promise<JournalEntry[]> {
  if (isDemoMode || !supabase) {
    const all = getLocalEntries();
    return all.slice(page * limit, (page + 1) * limit);
  }

  try {
    const userId = await requireUserId();
    const { data, error } = await supabase!
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return (data as JournalEntry[]) ?? [];
  } catch {
    return getLocalEntries().slice(page * limit, (page + 1) * limit);
  }
}

/**
 * Delete a journal entry (soft delete)
 */
export async function deleteJournalEntry(id: string): Promise<void> {
  if (isDemoMode || !supabase) {
    const entries = getLocalEntries().filter((e) => e.id !== id);
    setLocalEntries(entries);
    return;
  }

  try {
    const userId = await requireUserId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase!.from("journal_entries") as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
  } catch (error) {
    console.error("Delete failed:", error);
  }
}
