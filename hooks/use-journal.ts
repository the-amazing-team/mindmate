import { useCallback, useEffect, useRef, useState } from 'react';
import { callPipeline, getSupabase } from './use-supabase';

export interface JournalSection {
  id: string;
  content: string;
  section_order: number;
  created_at: string;
  reflection_text: string | null;
  primary_emotion: string | null;
  emotion_score: number | null;
}

export interface JournalEntry {
  id: string;
  title: string | null;
  overall_mood: string | null;
  created_at: string;
  updated_at: string;
  sections: JournalSection[];
}

export interface SaveEntryParams {
  title: string | null;
  overall_mood: string | null;
  content_blocks: string[];
}

const DUMMY_ENTRIES: JournalEntry[] = [
  {
    id: 'dummy-1',
    title: 'A Bright Morning',
    overall_mood: '5',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    sections: [
      {
        id: 'ds-1',
        content: "I woke up feeling refreshed today. The sun was shining and I had a great cup of coffee. It's the little things that matter.",
        section_order: 0,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        reflection_text: "It's wonderful that you're finding joy in small moments. Maintaining this perspective can significantly boost your overall well-being.",
        primary_emotion: 'Joyful',
        emotion_score: 0.95
      }
    ]
  },
  {
    id: 'dummy-2',
    title: 'Work Stress',
    overall_mood: '2',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    sections: [
      {
        id: 'ds-2',
        content: "The deadline is approaching and I feel overwhelmed. There's so much to do and not enough time. I need to find a way to manage this pressure.",
        section_order: 0,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        reflection_text: "Feeling overwhelmed during deadlines is common. Try breaking your tasks into smaller, manageable steps. Remember to take short breaks to clear your mind.",
        primary_emotion: 'Anxious',
        emotion_score: 0.82
      }
    ]
  }
];

export function useJournal(userId: string | undefined) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [sections, setSections] = useState<JournalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const subRef = useRef<any[] | null>(null);

  function patchSection(sectionId: string, patch: Partial<JournalSection>) {
    setEntries(prev => prev.map(entry => ({
      ...entry,
      sections: entry.sections.map((s: JournalSection) =>
        s.id === sectionId ? { ...s, ...patch } as JournalSection : s
      ),
    })));
    setSections(prev => prev.map((s: JournalSection) => s.id === sectionId ? { ...s, ...patch } as JournalSection : s));
  }

  const fetchEntries = useCallback(async () => {
    if (!userId) {
      setEntries(DUMMY_ENTRIES);
      setSections(DUMMY_ENTRIES.flatMap(e => e.sections));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error: fetchErr } = await getSupabase()
        .from('journal_entries')
        .select(`
          id, title, overall_mood, created_at, updated_at,
          journal_sections (
            id, content, section_order, created_at,
            ai_reflections ( reflection_text ),
            emotion_analysis ( primary_emotion, emotion_score )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (fetchErr) { 
        console.warn('Fetch error, using dummy data:', fetchErr.message);
        setEntries(DUMMY_ENTRIES);
        setSections(DUMMY_ENTRIES.flatMap(e => e.sections));
        setLoading(false);
        return; 
      }
      
      const normalised = (data ?? []).map(normaliseEntry);
      
      if (normalised.length === 0) {
        setEntries(DUMMY_ENTRIES);
        setSections(DUMMY_ENTRIES.flatMap(e => e.sections));
      } else {
        setEntries(normalised);
        setSections(normalised.flatMap((e: JournalEntry) => e.sections));
      }
    } catch (e) {
      setEntries(DUMMY_ENTRIES);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEntries();
    if (!userId) return;
    
    const sb = getSupabase();
    let reflSub: any, emotSub: any;

    try {
      reflSub = sb
        .channel('reflections:' + userId)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_reflections' },
          ({ new: row }: { new: any }) => patchSection(row.section_id, { reflection_text: row.reflection_text })
        ).subscribe();

      emotSub = sb
        .channel('emotions:' + userId)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emotion_analysis' },
          ({ new: row }: { new: any }) => patchSection(row.section_id, { primary_emotion: row.primary_emotion, emotion_score: row.emotion_score })
        ).subscribe();

      subRef.current = [reflSub, emotSub];
    } catch (e) {
      console.warn('Realtime subscription failed');
    }
    
    return () => { subRef.current?.forEach(s => sb.removeChannel(s)); };
  }, [userId, fetchEntries]);

  const save = useCallback(async ({ title, overall_mood, content_blocks }: SaveEntryParams) => {
    setSaving(true); setError('');

    if (!userId) {
      // Offline/Dummy mode save
      const newEntry: JournalEntry = {
        id: 'local-' + Date.now(),
        title: title || 'Local Entry',
        overall_mood: overall_mood,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sections: content_blocks.map((content, i) => ({
          id: 'ls-' + i + '-' + Date.now(),
          content,
          section_order: i,
          created_at: new Date().toISOString(),
          reflection_text: "You're journaling in offline mode. Connect to see AI insights!",
          primary_emotion: 'Thoughtful',
          emotion_score: 0.8
        }))
      };
      setEntries(prev => [newEntry, ...prev]);
      setSections(prev => [...newEntry.sections, ...prev]);
      
      // Simulate AI reflection arriving after 3 seconds
      setTimeout(() => {
        const reflection = "This is a simulated reflection. In production, our AI pipeline analyzes your text for deep emotional insights and patterns.";
        patchSection(newEntry.sections[0].id, { 
          reflection_text: reflection,
          primary_emotion: 'Creative',
          emotion_score: 0.88
        });
      }, 3000);

      setSaving(false);
      return { error: null, entry_id: newEntry.id };
    }

    try {
      const { data: entry, error: entryErr } = await getSupabase()
        .from('journal_entries')
        .insert({ user_id: userId, title: title ?? null, overall_mood: overall_mood ?? null })
        .select().single();

      if (entryErr) throw entryErr;

      const sectionRows = content_blocks.map((content, i) => ({
        journal_entry_id: entry.id, content, section_order: i,
      }));

      const { data: insertedSections, error: secErr } = await getSupabase()
        .from('journal_sections').insert(sectionRows).select();

      if (secErr) throw secErr;

      // Fire Pipeline A for each section async — results come back via Realtime
      (insertedSections ?? []).forEach((sec: any) => {
        callPipeline('A', { section_id: sec.id, journal_entry_id: entry.id, content: sec.content })
          .catch(err => console.warn('[Pipeline A]', err.message));
      });

      const optimisticEntry: JournalEntry = {
        ...entry,
        sections: (insertedSections ?? []).map((s: any) => ({
          ...s,
          reflection_text: null,
          primary_emotion: null,
          emotion_score: null
        } as JournalSection)),
      };
      setEntries(prev => [optimisticEntry, ...prev]);
      setSections(prev => [...optimisticEntry.sections, ...prev]);

      getSupabase().rpc('update_streak', { uid: userId }).then(() => { });
      setSaving(false);
      return { error: null, entry_id: entry.id };
    } catch (err: any) {
      setSaving(false);
      setError(err.message);
      return { error: err.message };
    }
  }, [userId]);

  return { entries, sections, loading, saving, error, save, refresh: fetchEntries };
}

function normaliseEntry(e: any): JournalEntry {
  return {
    id: e.id, title: e.title, overall_mood: e.overall_mood,
    created_at: e.created_at, updated_at: e.updated_at,
    sections: (e.journal_sections ?? [])
      .sort((a: any, b: any) => a.section_order - b.section_order)
      .map((s: any) => ({
        id: s.id, content: s.content, section_order: s.section_order, created_at: s.created_at,
        reflection_text: s.ai_reflections?.[0]?.reflection_text ?? null,
        primary_emotion: s.emotion_analysis?.[0]?.primary_emotion ?? null,
        emotion_score: s.emotion_analysis?.[0]?.emotion_score ?? null,
      })),
  };
}
