-- Migration: Add MBTI personality columns to profiles table

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mbti_personality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mbti_scores JSONB;
