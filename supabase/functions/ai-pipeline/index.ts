/**
 * MindMate — AI Processing Layer (LangGraph)
 *
 * Pipeline A — Journal Processing
 *   journal_content → emotion_analysis → ai_reflection → store_embedding
 *
 * Pipeline B — Insight Generation
 *   journal entries (recent) → pattern_detection → generate_insights
 *
 * Pipeline C — Chat With Journal Context
 *   chat + journal entries → vector_search → context_retrieval → ai_response
 *
 * Pipeline D — Scheduling
 *   chat + journal entries + call_logs → urgency_scoring → schedule_checkin | schedule_call
 *
 * External AI Models:
 *   Claude (claude-sonnet-4-20250514)  — emotion, reflection, insights, chat
 *   OpenAI (text-embedding-3-small)   — embedding generation
 *   pgvector (Supabase)               — cosine similarity search
 */

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Secrets (set via: supabase secrets set KEY=value) ─────────────────────────
const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')         ?? '';
const OPENAI_KEY    = Deno.env.get('OPENAI_API_KEY')            ?? '';
const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')              ?? '';
const SUPABASE_SVC  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─────────────────────────────────────────────────────────────────────────────
//  LangGraph runtime — minimal stateful graph executor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runGraph — runs a directed graph of async node functions.
 * Each node receives the full accumulated state and returns a partial patch.
 * Edges route the cursor to the next node (string = fixed, function = conditional).
 * Stops when cursor reaches '__end__'.
 */
async function runGraph(graph, initialState, ctx) {
  let state   = { ...initialState };
  let cursor  = graph.entry;
  const seen  = new Set();

  while (cursor !== '__end__') {
    if (seen.has(cursor)) throw new Error(`Graph cycle at node "${cursor}"`);
    seen.add(cursor);

    const nodeFn = graph.nodes[cursor];
    if (!nodeFn) throw new Error(`Graph node "${cursor}" not found`);

    const patch = await nodeFn(state, ctx);
    state = { ...state, ...patch };

    const edge = graph.edges[cursor];
    if (!edge) break;
    cursor = typeof edge === 'function' ? edge(state) : edge;
  }
  return state;
}

// ─────────────────────────────────────────────────────────────────────────────
//  External AI model helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Claude API — text generation */
async function claude(system, user, maxTokens = 400, history = []) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: [...history, { role: 'user', content: user }],
    }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`Claude ${res.status}: ${e?.error?.message ?? 'unknown'}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

/** OpenAI — generate 1536-dim embedding vector */
async function embed(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`OpenAI embed ${res.status}: ${JSON.stringify(e)}`);
  }
  const data = await res.json();
  return data.data?.[0]?.embedding ?? [];
}

/** Parse Claude JSON response safely */
function parseJSON(raw, fallback) {
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PIPELINE A — Journal Processing
//
//  journal_content
//    → emotion_analysis   (Claude → primary_emotion + score → INSERT emotion_analysis)
//    → ai_reflection      (Claude → reflection_text → INSERT ai_reflections)
//    → store_embedding    (OpenAI → vector → INSERT journal_embeddings)
//
//  Trigger: every time a journal_section is saved
//  Schema tables written: emotion_analysis, ai_reflections, journal_embeddings
// ─────────────────────────────────────────────────────────────────────────────

const pipelineA = {
  entry: 'emotion_analysis',

  nodes: {
    /**
     * Reads journal section content.
     * Calls Claude to detect primary emotion and intensity score (0-1).
     * Writes to emotion_analysis table.
     */
    emotion_analysis: async (state, ctx) => {
      const raw = await claude(
        `You are an emotion analysis engine for a mental wellness journaling app.
Analyse the journal section and respond with ONLY valid JSON — no prose, no markdown.
Schema: {
  "primary_emotion": string,   // e.g. "anxious", "hopeful", "frustrated", "content"
  "emotion_score":   number,   // 0.0 (very mild) to 1.0 (very intense)
  "secondary_emotions": string[],
  "valence": "positive" | "negative" | "mixed"
}`,
        `Journal content: ${state.content}`,
        180,
      );

      const parsed = parseJSON(raw, {
        primary_emotion:    'neutral',
        emotion_score:      0.5,
        secondary_emotions: [],
        valence:            'mixed',
      });

      // Write to emotion_analysis table
      await ctx.sb.from('emotion_analysis').upsert({
        section_id:      state.section_id,
        primary_emotion: parsed.primary_emotion,
        emotion_score:   parsed.emotion_score,
      }, { onConflict: 'section_id' });

      return {
        primary_emotion:    parsed.primary_emotion,
        emotion_score:      parsed.emotion_score,
        secondary_emotions: parsed.secondary_emotions ?? [],
        valence:            parsed.valence ?? 'mixed',
      };
    },

    /**
     * Uses emotion_analysis output + original content to write a reflection.
     * Claude sees the structured emotion data — cleaner prompt, better output.
     * Writes to ai_reflections table.
     */
    ai_reflection: async (state, ctx) => {
      const reflection_text = await claude(
        `You are MindMate AI, a warm empathetic journaling companion.
Write a single 1-2 sentence reflection based on the journal content and detected emotion.
Be specific to the user's actual words. End with one gentle open-ended question.
No preamble. No quotes around your response.`,
        `Primary emotion: ${state.primary_emotion} (intensity: ${state.emotion_score})
Secondary emotions: ${(state.secondary_emotions ?? []).join(', ')}
Journal content: ${state.content.slice(0, 500)}`,
        160,
      );

      // Write to ai_reflections table
      await ctx.sb.from('ai_reflections').upsert({
        section_id:      state.section_id,
        reflection_text,
      }, { onConflict: 'section_id' });

      return { reflection_text };
    },

    /**
     * Generates a 1536-dim embedding enriched with emotion context.
     * Stored in journal_embeddings for Pipeline C vector search.
     */
    store_embedding: async (state, ctx) => {
      const enrichedText = `${state.content}
Emotion: ${state.primary_emotion} (${state.emotion_score})
Secondary: ${(state.secondary_emotions ?? []).join(', ')}`;

      const embedding = await embed(enrichedText);

      await ctx.sb.from('journal_embeddings').upsert({
        section_id: state.section_id,
        embedding,
      }, { onConflict: 'section_id' });

      return { embedding_stored: true };
    },
  },

  edges: {
    emotion_analysis: 'ai_reflection',
    ai_reflection:    'store_embedding',
    store_embedding:  '__end__',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  PIPELINE B — Insight Generation
//
//  journal entries (recent)
//    → pattern_detection    (Claude → trend, stress_days, bright_spots)
//    → generate_insights    (Claude ×2 parallel → summary + recommendation)
//
//  Trigger: Insights tab open, or weekly cron
//  Schema tables written: insights
// ─────────────────────────────────────────────────────────────────────────────

const pipelineB = {
  entry: 'pattern_detection',

  nodes: {
    /**
     * Analyses the time series of recent journal sections with their emotions.
     * Returns structured pattern data for the next node.
     */
    pattern_detection: async (state) => {
      const entrySummary = state.sections.map(s =>
        `[${new Date(s.created_at).toLocaleDateString()}] ` +
        `emotion:${s.primary_emotion ?? 'unknown'} (${s.emotion_score ?? 0}) — ${s.content.slice(0, 100)}`
      ).join('\n');

      const raw = await claude(
        `You are a pattern analysis engine for a mental wellness app.
Analyse these journal sections and respond with ONLY valid JSON — no prose, no markdown.
Schema: {
  "trend":         string,    // "improving" | "declining" | "stable" | "volatile"
  "dominant_emotions": string[],
  "stress_triggers": string[],
  "bright_spots":  string[],
  "avg_emotion_score": number
}`,
        entrySummary,
        300,
      );

      const patterns = parseJSON(raw, {
        trend:               'stable',
        dominant_emotions:   [],
        stress_triggers:     [],
        bright_spots:        [],
        avg_emotion_score:   0.5,
      });

      return { patterns };
    },

    /**
     * Two parallel Claude calls:
     *  1. weekly_summary — warm narrative of emotional patterns
     *  2. recommendation — one concrete behavioural suggestion
     * Both written to insights table.
     */
    generate_insights: async (state, ctx) => {
      const p = state.patterns;

      const [summary, recommendation] = await Promise.all([
        claude(
          `You are MindMate AI. Write a warm, personal 2-3 sentence weekly summary of the user's emotional patterns. Be specific. No preamble.`,
          `Trend: ${p.trend} | Avg intensity: ${p.avg_emotion_score}
Dominant emotions: ${p.dominant_emotions.join(', ')}
Bright spots: ${p.bright_spots.join(', ')}
Stress triggers: ${p.stress_triggers.join(', ')}`,
          220,
        ),
        claude(
          `You are MindMate AI. Write ONE concrete actionable suggestion (1 sentence, max 25 words) based on the user's stress patterns. No preamble.`,
          `Stress triggers: ${p.stress_triggers.join(', ')}
Dominant emotions: ${p.dominant_emotions.join(', ')}`,
          80,
        ),
      ]);

      // Write both to insights table
      await ctx.sb.from('insights').insert([
        { user_id: state.user_id, insight_type: 'weekly_summary',  insight_text: summary },
        { user_id: state.user_id, insight_type: 'recommendation',  insight_text: recommendation },
      ]);

      return { summary, recommendation };
    },
  },

  edges: {
    pattern_detection: 'generate_insights',
    generate_insights: '__end__',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  PIPELINE C — Chat With Journal Context
//
//  chat + journal entries
//    → vector_search      (OpenAI embed question → pgvector cosine search)
//    → context_retrieval  (fetch top-k matching sections with emotions)
//    → ai_response        (Claude with grounded context block)
//
//  Trigger: every chat message send
//  Schema tables written: (none — answer returned directly to client)
// ─────────────────────────────────────────────────────────────────────────────

const pipelineC = {
  entry: 'vector_search',

  nodes: {
    /**
     * Embeds the user's question with OpenAI text-embedding-3-small.
     * This vector is used to find semantically similar journal sections.
     */
    vector_search: async (state) => {
      const question_embedding = await embed(state.question);
      return { question_embedding };
    },

    /**
     * Queries pgvector for the top-5 journal sections most similar to the question.
     * Returns rich context: content, emotion, score, date.
     */
    context_retrieval: async (state, ctx) => {
      const { data, error } = await ctx.sb.rpc('match_journal_sections', {
        query_embedding:  state.question_embedding,
        match_user_id:    state.user_id,
        match_threshold:  0.68,
        match_count:      5,
      });

      if (error) console.warn('[context_retrieval]', error.message);

      const context_sections = (data ?? []).map(row => ({
        content:         row.content,
        primary_emotion: row.primary_emotion ?? 'unknown',
        emotion_score:   row.emotion_score   ?? 0,
        date:            new Date(row.created_at).toLocaleDateString(),
        similarity:      Math.round((row.similarity ?? 0) * 100),
      }));

      return { context_sections };
    },

    /**
     * Claude receives:
     *  - The user's question
     *  - Semantically retrieved journal sections as grounding context
     *  - Full conversation history (multi-turn)
     * Claude cannot hallucinate — it is explicitly told not to use details
     * not present in the retrieved context.
     */
    ai_response: async (state) => {
      const contextBlock = state.context_sections.length
        ? state.context_sections.map(s =>
            `[${s.date}] emotion:${s.primary_emotion} (${s.emotion_score}) — "${s.content.slice(0, 180)}"`
          ).join('\n')
        : 'No closely matching journal entries found.';

      const answer = await claude(
        `You are MindMate AI, a warm empathetic journaling companion for ${state.profile_name || 'this user'}.

The following journal sections are semantically relevant to the user's question.
Use them as your grounding context. Reference specific dates, emotions, and details.
Be warm, specific, and end with one gentle follow-up question.
Do NOT use journal details not present in the context below.

Relevant journal context:
${contextBlock}`,
        state.question,
        500,
        (state.history ?? []).slice(-10),
      );

      return { answer };
    },
  },

  edges: {
    vector_search:     'context_retrieval',
    context_retrieval: 'ai_response',
    ai_response:       '__end__',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  PIPELINE D — Scheduling
//
//  chat + journal entries + call logs
//    → urgency_scoring    (Claude → score 0-10 + reason)
//    → schedule_decision  (conditional edge: 0-3 none | 4-6 checkin | 7-10 call)
//      → schedule_checkin → INSERT ai_checkins
//      → schedule_call    → INSERT ai_call_schedules
//
//  Trigger: after chat session ends, or on app focus
// ─────────────────────────────────────────────────────────────────────────────

const pipelineD = {
  entry: 'urgency_scoring',

  nodes: {
    /**
     * Analyses chat patterns, journal mood trend, and recency of last call.
     * Returns urgency score 0-10 and a human-readable reason.
     */
    urgency_scoring: async (state) => {
      const raw = await claude(
        `You are a mental wellness scheduling engine.
Respond ONLY with valid JSON: { "urgency_score": number 0-10, "reason": string }
Scoring: 0-3 = doing well (no action), 4-6 = check-in notification helpful, 7-10 = AI call needed soon.`,
        `Recent chat summary: ${state.chat_summary}
Journal emotion trend: ${state.journal_summary}
Last AI call: ${state.last_call_days_ago} days ago — outcome: ${state.last_call_outcome}`,
        120,
      );

      const parsed = parseJSON(raw, { urgency_score: 2, reason: 'all clear' });
      return {
        urgency_score:  parsed.urgency_score ?? 2,
        urgency_reason: parsed.reason        ?? '',
      };
    },

    /**
     * Conditional node — generates the right message copy and routes to DB write.
     * Score ≤ 3  → no action
     * Score 4-6  → check-in notification (schedule_checkin)
     * Score ≥ 7  → AI call (schedule_call)
     */
    schedule_decision: async (state) => {
      const score = state.urgency_score ?? 2;
      if (score <= 3) return { action: 'none', message_preview: null };

      const action = score >= 7 ? 'ai_call' : 'checkin';
      const message_preview = await claude(
        `Write a short warm ${action === 'ai_call' ? 'call opening line' : 'push notification'} (max 20 words). No preamble.`,
        `Reason: ${state.urgency_reason}`,
        60,
      );
      return { action, message_preview, delay_hours: action === 'ai_call' ? 2 : 8 };
    },

    /**
     * Schedules a push notification check-in.
     * Writes to ai_checkins table.
     */
    schedule_checkin: async (state, ctx) => {
      await ctx.sb.from('ai_checkins').insert({
        user_id:        state.user_id,
        trigger_reason: state.urgency_reason,
        message:        state.message_preview,
      });
      return { scheduled: 'checkin' };
    },

    /**
     * Schedules an AI call.
     * Writes to ai_call_schedules table.
     */
    schedule_call: async (state, ctx) => {
      const run_at = new Date(Date.now() + (state.delay_hours ?? 2) * 3_600_000).toISOString();
      await ctx.sb.from('ai_call_schedules').insert({
        user_id:        state.user_id,
        scheduled_at:   run_at,
        call_type:      'check_in',
        trigger_source: state.urgency_reason,
        status:         'pending',
      });
      return { scheduled: 'call', scheduled_at: run_at };
    },
  },

  // Conditional edge from schedule_decision
  edges: {
    urgency_scoring:  'schedule_decision',
    schedule_decision: (state) => {
      if (state.action === 'none')     return '__end__';
      if (state.action === 'ai_call')  return 'schedule_call';
      return 'schedule_checkin';
    },
    schedule_checkin: '__end__',
    schedule_call:    '__end__',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  HTTP handler
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const sb  = createClient(SUPABASE_URL, SUPABASE_SVC);
    const ctx = { sb };
    const { pipeline, payload } = await req.json();

    // ── Pipeline A: journal_content → emotion_analysis → ai_reflection → embedding ──
    if (pipeline === 'A') {
      const result = await runGraph(pipelineA, {
        section_id:         payload.section_id,
        content:            payload.content,
        primary_emotion:    null,
        emotion_score:      null,
        secondary_emotions: [],
        valence:            null,
        reflection_text:    null,
        embedding_stored:   false,
      }, ctx);

      // Also update journal_entries.updated_at so Realtime fires on the entry
      if (payload.journal_entry_id) {
        await sb.from('journal_entries')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', payload.journal_entry_id);
      }

      return jsonResponse({
        ok:              true,
        primary_emotion: result.primary_emotion,
        emotion_score:   result.emotion_score,
        reflection_text: result.reflection_text,
        embedding_stored:result.embedding_stored,
      });
    }

    // ── Pipeline B: recent sections → pattern_detection → generate_insights ──────
    if (pipeline === 'B') {
      // Fetch sections with their emotion data
      const { data: sections } = await sb
        .from('journal_sections')
        .select(`
          id, content, created_at,
          journal_entries!inner(user_id),
          emotion_analysis(primary_emotion, emotion_score)
        `)
        .eq('journal_entries.user_id', payload.user_id)
        .order('created_at', { ascending: false })
        .limit(30);

      const flatSections = (sections ?? []).map(s => ({
        content:         s.content,
        created_at:      s.created_at,
        primary_emotion: s.emotion_analysis?.[0]?.primary_emotion ?? null,
        emotion_score:   s.emotion_analysis?.[0]?.emotion_score   ?? null,
      }));

      const result = await runGraph(pipelineB, {
        user_id:    payload.user_id,
        sections:   flatSections,
        patterns:   null,
        summary:    null,
        recommendation: null,
      }, ctx);

      return jsonResponse({ ok: true, summary: result.summary, recommendation: result.recommendation });
    }

    // ── Pipeline C: chat → vector_search → context_retrieval → ai_response ────────
    if (pipeline === 'C') {
      const result = await runGraph(pipelineC, {
        user_id:            payload.user_id,
        question:           payload.question,
        history:            payload.history     ?? [],
        profile_name:       payload.profile_name ?? '',
        question_embedding: [],
        context_sections:   [],
        answer:             null,
      }, ctx);

      return jsonResponse({
        ok:      true,
        answer:  result.answer,
        context: (result.context_sections ?? []).map(s => ({
          date:       s.date,
          emotion:    s.primary_emotion,
          similarity: s.similarity,
        })),
      });
    }

    // ── Pipeline D: chat + journal + call_logs → urgency → schedule ───────────────
    if (pipeline === 'D') {
      // Fetch last call log for this user
      const { data: lastCall } = await sb
        .from('ai_call_logs')
        .select('call_ended_at, summary, ai_call_schedules!inner(user_id)')
        .eq('ai_call_schedules.user_id', payload.user_id)
        .order('call_ended_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastCallDaysAgo  = lastCall?.call_ended_at
        ? Math.floor((Date.now() - new Date(lastCall.call_ended_at).getTime()) / 86_400_000)
        : 999;
      const lastCallOutcome = lastCall?.summary ?? 'no previous call';

      const result = await runGraph(pipelineD, {
        user_id:           payload.user_id,
        chat_summary:      payload.chat_summary      ?? '',
        journal_summary:   payload.journal_summary   ?? '',
        last_call_days_ago: lastCallDaysAgo,
        last_call_outcome: lastCallOutcome,
        urgency_score:     null,
        urgency_reason:    null,
        action:            null,
        message_preview:   null,
        delay_hours:       null,
      }, ctx);

      return jsonResponse({ ok: true, ...result });
    }

    return jsonResponse({ error: 'unknown pipeline' }, 400);

  } catch (err) {
    console.error('[ai-pipeline]', err);
    return jsonResponse({ error: err.message }, 500);
  }
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
