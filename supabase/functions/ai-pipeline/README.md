# MindMate AI Pipeline — Supabase Edge Function (JavaScript)

## Deploy
```bash
supabase functions deploy ai-pipeline
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set OPENAI_API_KEY=sk-...
```

## Pipelines

| ID | Trigger | Input | Nodes | Writes to |
|----|---------|-------|-------|-----------|
| A | Every journal section save | section_id, content | emotion_analysis → ai_reflection → store_embedding | emotion_analysis, ai_reflections, journal_embeddings |
| B | Insights tab open | user_id | pattern_detection → generate_insights (Promise.all) | insights |
| C | Every chat message | user_id, question, history | vector_search → context_retrieval → ai_response | (returned to client) |
| D | After 6+ chat messages | user_id, chat_summary, journal_summary | urgency_scoring → schedule_decision (conditional) | ai_checkins OR ai_call_schedules |

## Schema tables required
Run `supabase/schema.sql` in your Supabase SQL editor first.

## Fill in credentials
In `hooks/use-supabase.js`:
```js
export const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
export const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';
```
