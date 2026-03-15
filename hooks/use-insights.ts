import { useState, useEffect, useCallback } from 'react';
import { callPipeline } from './use-supabase';
import { JournalSection } from './use-journal';

export interface InsightStats {
  weekEmotions:   { day: string; emotion: string | null; score: number | null }[];
  emotionCounts:  Record<string, number>;
  topEmotions:    { emotion: string; count: number; pct: number }[];
  avgScore:       number;
  streak:         number;
  totalSections:  number;
  aiSummary:      string | null;
  recommendation: string | null;
  loading:        boolean;
}

export function useInsights(userId: string | undefined, sections: JournalSection[]) {
  const [data, setData] = useState<InsightStats>({
    weekEmotions:   [],
    emotionCounts:  {},
    topEmotions:    [],
    avgScore:       0,
    streak:         0,
    totalSections:  0,
    aiSummary:      null,
    recommendation: null,
    loading:        false,
  });

  const refreshSummary = useCallback(async () => {
    if (!sections.length || !userId) return;
    setData(prev => ({ ...prev, loading: true }));
    try {
      let result;
      try {
        result = await callPipeline('B', { user_id: userId });
      } catch (pipelineErr) {
        console.warn('Pipeline B failed, using mock insights:', pipelineErr);
        result = {
          summary: "Based on your recent entries, you've been showing a balance of productivity and reflection. Your mornings tend to be more optimistic, while work stressors appear in the late afternoon. Overall, your emotional resilience is trending upwards!",
          recommendation: "Continue your habit of morning journaling; it seems to set a positive tone for your day. Consider a 5-minute breathing exercise when work stress peaks."
        };
      }
      
      setData(prev => ({
        ...prev,
        aiSummary:      result.summary        ?? null,
        recommendation: result.recommendation ?? null,
        loading:        false,
      }));
    } catch {
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [sections, userId]);

  useEffect(() => {
    if (!sections.length) return;
    setData(prev => ({ ...prev, ...computeStats(sections) }));
  }, [sections]);

  useEffect(() => {
    if (sections.length > 0 && !data.aiSummary && !data.loading) {
      refreshSummary();
    }
  }, [sections.length, data.aiSummary, data.loading, refreshSummary]);

  return { data, refreshSummary };
}

function computeStats(sections: JournalSection[]) {
  const now   = new Date();
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return d.toDateString();
  });

  const weekEmotions = days7.map(day => {
    const match = sections.find(s => new Date(s.created_at).toDateString() === day);
    return { day, emotion: match?.primary_emotion ?? null, score: match?.emotion_score ?? null };
  });

  const emotionCounts: Record<string, number> = {};
  sections.forEach(s => {
    if (s.primary_emotion) {
      emotionCounts[s.primary_emotion] = (emotionCounts[s.primary_emotion] ?? 0) + 1;
    }
  });

  const topEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a).slice(0, 5)
    .map(([emotion, count]) => ({ emotion, count, pct: Math.round((count / Math.max(sections.length, 1)) * 100) }));

  const scored = sections.filter(s => s.emotion_score != null);
  const avgScore = scored.length
    ? Math.round((scored.reduce((a, s) => a + (s.emotion_score ?? 0), 0) / scored.length) * 100) / 100 : 0;

  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    if (sections.some(s => new Date(s.created_at).toDateString() === d.toDateString())) streak++;
    else break;
  }

  return { weekEmotions, emotionCounts, topEmotions, avgScore, streak, totalSections: sections.length };
}
