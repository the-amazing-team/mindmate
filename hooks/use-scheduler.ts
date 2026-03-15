import { useState, useCallback } from 'react';
import { callPipeline } from './use-supabase';
import { ChatMessage } from './use-chat';
import { JournalSection } from './use-journal';

export interface SchedulerResult {
  urgency_score: number;
  decision: string;
  checkin_scheduled?: boolean;
  call_scheduled?: boolean;
  reason?: string;
}

export function useScheduler(userId: string | undefined) {
  const [result,  setResult]  = useState<SchedulerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runScheduler = useCallback(async ({ messages, sections }: { messages: ChatMessage[], sections: JournalSection[] }) => {
    if (!userId) return;
    setLoading(true);

    // Summarise chat context (last 8 messages)
    const chat_summary = messages
      .slice(-8)
      .map(m => `${m.role}: ${m.text.slice(0, 80)}`)
      .join('\n');

    // Summarise journal emotion trend (last 7 days)
    const journal_summary = sections
      .slice(0, 7)
      .map(s => `[${new Date(s.created_at).toLocaleDateString()}] ${s.primary_emotion ?? 'unknown'} (${s.emotion_score ?? 0})`)
      .join('\n');

    try {
      // Pipeline D fetches call logs itself from the DB
      const res = await callPipeline('D', {
        user_id:         userId,
        chat_summary,
        journal_summary,
      });
      setResult(res);
    } catch (err) {
      console.warn('[useScheduler]', err);
    }

    setLoading(false);
  }, [userId]);

  return { result, loading, runScheduler };
}
