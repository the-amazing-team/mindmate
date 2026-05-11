-- ============================================================
-- MindMate — Initial Database Schema
-- Run this in your Supabase SQL editor or via migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  emotional_profile JSONB NOT NULL DEFAULT '{}',
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  theme_preference TEXT NOT NULL DEFAULT 'parchment',
  emotional_state TEXT NOT NULL DEFAULT 'calm',
  signature_mood TEXT NOT NULL DEFAULT 'calm',
  intention TEXT,
  ai_companion_name TEXT DEFAULT 'Mate',
  total_journal_entries INTEGER DEFAULT 0,
  total_chat_messages INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT 'calm',
  ai_analysis TEXT,
  emotional_score NUMERIC(5,2),
  anxiety_score NUMERIC(5,2),
  stress_score NUMERIC(5,2),
  positivity_score NUMERIC(5,2),
  themes TEXT[],
  ai_invitation TEXT,
  crisis_flag BOOLEAN NOT NULL DEFAULT FALSE,
  word_count INTEGER,
  embedding vector(1536),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_created_at_idx ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS journal_entries_mood_idx ON public.journal_entries(mood);

-- ============================================================
-- EMOTIONAL MEMORY (vector store for RAG)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emotional_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('journal', 'companion', 'onboarding', 'system')),
  text TEXT NOT NULL,
  mood TEXT,
  triggers TEXT[],
  importance_score NUMERIC(3,2) DEFAULT 0.5,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS emotional_memory_user_id_idx ON public.emotional_memory(user_id);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_emotional_memories(
  query_embedding vector(1536),
  match_user_id UUID,
  match_count INT DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.75
)
RETURNS TABLE (
  id UUID,
  text TEXT,
  mood TEXT,
  triggers TEXT[],
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL STABLE AS $$
  SELECT
    em.id,
    em.text,
    em.mood,
    em.triggers,
    1 - (em.embedding <=> query_embedding) AS similarity,
    em.created_at
  FROM public.emotional_memory em
  WHERE em.user_id = match_user_id
    AND em.embedding IS NOT NULL
    AND 1 - (em.embedding <=> query_embedding) > match_threshold
  ORDER BY em.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================================
-- AI INSIGHTS (daily summaries)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary TEXT,
  recommendations JSONB DEFAULT '[]',
  emotional_patterns JSONB DEFAULT '{}',
  mood_trend TEXT,
  wellness_score NUMERIC(5,2),
  highlights TEXT[],
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_insights_user_id_idx ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS ai_insights_generated_at_idx ON public.ai_insights(generated_at DESC);

-- ============================================================
-- CHAT HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  emotion_detected TEXT,
  mode TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_history_user_id_idx ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS chat_history_created_at_idx ON public.chat_history(created_at DESC);

-- ============================================================
-- MOOD TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mood_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  energy_level NUMERIC(3,1) CHECK (energy_level >= 0 AND energy_level <= 10),
  anxiety_level NUMERIC(3,1) CHECK (anxiety_level >= 0 AND anxiety_level <= 10),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mood_tracking_user_id_idx ON public.mood_tracking(user_id);
CREATE INDEX IF NOT EXISTS mood_tracking_created_at_idx ON public.mood_tracking(created_at DESC);

-- ============================================================
-- BREATHING SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.breathing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_type TEXT DEFAULT '4-7-8',
  duration_seconds INTEGER,
  completed_cycles INTEGER DEFAULT 0,
  calming_score NUMERIC(3,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS breathing_sessions_user_id_idx ON public.breathing_sessions(user_id);

-- ============================================================
-- PLUGIN DATA (flexible JSONB store per plugin per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plugin_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plugin_name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, plugin_name)
);

CREATE INDEX IF NOT EXISTS plugin_data_user_id_idx ON public.plugin_data(user_id);

-- ============================================================
-- Update streak function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  last_active TIMESTAMPTZ;
  current_streak INT;
BEGIN
  SELECT last_active_at, current_streak_days
  INTO last_active, current_streak
  FROM public.profiles
  WHERE id = p_user_id;

  IF last_active IS NULL OR last_active < NOW() - INTERVAL '2 days' THEN
    UPDATE public.profiles
    SET current_streak_days = 1, last_active_at = NOW()
    WHERE id = p_user_id;
  ELSIF last_active < NOW() - INTERVAL '1 day' THEN
    UPDATE public.profiles
    SET
      current_streak_days = current_streak + 1,
      longest_streak_days = GREATEST(longest_streak_days, current_streak + 1),
      last_active_at = NOW()
    WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles SET last_active_at = NOW() WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
