import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── ✏️  Fill these in ──────────────────────────────────────────────────────────
export const SUPABASE_URL = 'https://wfghqovpmdhxbulivsjf.supabase.co';
export const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZ2hxb3ZwbWRoeGJ1bGl2c2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjA4MzMsImV4cCI6MjA4ODg5NjgzM30.a9Ah1zFtGm5ssQRPGYZmTG2ecYe1TVxPxla7AV9vDqM';
// ─────────────────────────────────────────────────────────────────────────────

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      storage: {
        getItem: (k: string) => AsyncStorage.getItem(k),
        setItem: (k: string, v: string) => AsyncStorage.setItem(k, v),
        removeItem: (k: string) => AsyncStorage.removeItem(k),
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return _client;
}

/**
 * callPipeline — POST to the ai-pipeline Edge Function.
 * pipeline: 'A' | 'B' | 'C' | 'D'
 * payload:  object matching the pipeline's expected input
 */
export async function callPipeline(pipeline: 'A' | 'B' | 'C' | 'D', payload: any) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  const url = `${SUPABASE_URL}/functions/v1/ai-pipeline`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ pipeline, payload }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Pipeline ${pipeline} failed (${res.status})`);
    }
    return res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Pipeline ${pipeline} timed out. Please try again.`);
    }
    throw err;
  }
}
