// Auto-generated Supabase type definitions
// Run: npx supabase gen types typescript --local > src/lib/supabase-types.ts
// after setting up your Supabase project

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          avatar_url: string | null;
          emotional_profile: Json;
          onboarding_complete: boolean;
          theme_preference: string;
          emotional_state: string;
          signature_mood: string;
          intention: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          avatar_url?: string | null;
          emotional_profile?: Json;
          onboarding_complete?: boolean;
          theme_preference?: string;
          emotional_state?: string;
          signature_mood?: string;
          intention?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      journal_entries: {
        Row: {
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
          word_count: number | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content: string;
          mood?: string;
          ai_analysis?: string | null;
          ai_invitation?: string | null;
          emotional_score?: number | null;
          anxiety_score?: number | null;
          stress_score?: number | null;
          positivity_score?: number | null;
          themes?: string[] | null;
          crisis_flag?: boolean;
          word_count?: number | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["journal_entries"]["Insert"]>;
      };
      emotional_memory: {
        Row: {
          id: string;
          user_id: string;
          source: string;
          text: string;
          mood: string | null;
          triggers: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source: string;
          text: string;
          mood?: string | null;
          triggers?: string[] | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["emotional_memory"]["Insert"]>;
      };
      ai_insights: {
        Row: {
          id: string;
          user_id: string;
          summary: string | null;
          recommendations: Json | null;
          emotional_patterns: Json | null;
          mood_trend: string | null;
          generated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          summary?: string | null;
          recommendations?: Json | null;
          emotional_patterns?: Json | null;
          mood_trend?: string | null;
          generated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_insights"]["Insert"]>;
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          message: string;
          emotion_detected: string | null;
          mode: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          message: string;
          emotion_detected?: string | null;
          mode?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_history"]["Insert"]>;
      };
      mood_tracking: {
        Row: {
          id: string;
          user_id: string;
          mood: string;
          energy_level: number | null;
          anxiety_level: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: string;
          energy_level?: number | null;
          anxiety_level?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mood_tracking"]["Insert"]>;
      };
      breathing_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: string | null;
          duration_seconds: number | null;
          completed_cycles: number | null;
          calming_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type?: string | null;
          duration_seconds?: number | null;
          completed_cycles?: number | null;
          calming_score?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["breathing_sessions"]["Insert"]>;
      };
      plugin_data: {
        Row: {
          id: string;
          user_id: string;
          plugin_name: string;
          data: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plugin_name: string;
          data: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plugin_data"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
