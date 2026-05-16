-- ============================================================
-- MindMate — Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_data ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES policies
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- JOURNAL ENTRIES policies
-- ============================================================
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- EMOTIONAL MEMORY policies
-- ============================================================
CREATE POLICY "Users can view own memories"
  ON public.emotional_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON public.emotional_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON public.emotional_memory FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- AI INSIGHTS policies
-- ============================================================
CREATE POLICY "Users can view own insights"
  ON public.ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON public.ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CHAT HISTORY policies
-- ============================================================
CREATE POLICY "Users can view own chat history"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON public.chat_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- MOOD TRACKING policies
-- ============================================================
CREATE POLICY "Users can view own mood tracking"
  ON public.mood_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood tracking"
  ON public.mood_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- BREATHING SESSIONS policies
-- ============================================================
CREATE POLICY "Users can view own breathing sessions"
  ON public.breathing_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own breathing sessions"
  ON public.breathing_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PLUGIN DATA policies
-- ============================================================
CREATE POLICY "Users can view own plugin data"
  ON public.plugin_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plugin data"
  ON public.plugin_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plugin data"
  ON public.plugin_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plugin data"
  ON public.plugin_data FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Storage bucket for user assets
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('mindmate-assets', 'mindmate-assets', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'mindmate-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mindmate-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'mindmate-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
