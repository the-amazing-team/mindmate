// ============================================================
// AI Journal Analyzer
// Calls Groq (primary) or OpenAI (fallback) to analyze entries
// ============================================================

import { buildJournalAnalysisPrompt } from "@/lib/prompts";
import type { Mood } from "@/lib/storybook-context";

export interface JournalAnalysis {
  mood: Mood;
  emotional_score: number;
  anxiety_score: number;
  stress_score: number;
  positivity_score: number;
  themes: string[];
  ai_analysis: string;
  ai_invitation: string;
  crisis_flag: boolean;
  highlights: string[];
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

  // Prefer Groq (faster, free tier)
  if (groqKey && groqKey !== "your_groq_api_key") {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Fallback to OpenAI
  if (openaiKey && openaiKey !== "your_openai_api_key") {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Demo mode fallback
  throw new Error("No AI API key configured");
}

/**
 * Analyzes a journal entry and returns emotional scores + AI insights
 * Falls back to local heuristic analysis if no API key is configured
 */
export async function analyzeJournalEntry(
  content: string,
  userName: string = "Dear One",
): Promise<JournalAnalysis> {
  try {
    const systemPrompt = `You are an emotionally intelligent journal analyst. Always respond with valid JSON only.`;
    const userMessage = buildJournalAnalysisPrompt(content, userName);

    const raw = await callAI(systemPrompt, userMessage);
    const parsed = JSON.parse(raw) as JournalAnalysis;

    // Validate and clamp scores
    return {
      mood: parsed.mood ?? "calm",
      emotional_score: Math.min(100, Math.max(0, parsed.emotional_score ?? 50)),
      anxiety_score: Math.min(100, Math.max(0, parsed.anxiety_score ?? 20)),
      stress_score: Math.min(100, Math.max(0, parsed.stress_score ?? 20)),
      positivity_score: Math.min(100, Math.max(0, parsed.positivity_score ?? 50)),
      themes: parsed.themes ?? [],
      ai_analysis: parsed.ai_analysis ?? "Your words carry weight and meaning.",
      ai_invitation: parsed.ai_invitation ?? "Tomorrow, try writing one thing you're grateful for.",
      crisis_flag: parsed.crisis_flag ?? false,
      highlights: parsed.highlights ?? [],
    };
  } catch (error) {
    console.warn("AI analysis unavailable, using local heuristics:", error);
    return localFallbackAnalysis(content);
  }
}

/**
 * Local heuristic analysis when no AI API is available
 */
function localFallbackAnalysis(content: string): JournalAnalysis {
  const lower = content.toLowerCase();

  const mood: Mood = /(panic|anxious|worry|scared|afraid|overwhelm)/.test(lower)
    ? "anxious"
    : /(sad|cry|lonely|alone|grief|tired|hurt|empty|numb)/.test(lower)
      ? "melancholy"
      : /(happy|joy|grateful|love|delight|excited|wonderful)/.test(lower)
        ? "joy"
        : /(hope|better|trying|forward|new|growing|believe)/.test(lower)
          ? "hopeful"
          : "calm";

  const anxietyWords = (
    lower.match(/\b(anxious|panic|worry|scared|afraid|overwhelm|stress)\b/g) ?? []
  ).length;
  const positiveWords = (
    lower.match(/\b(happy|joy|grateful|love|good|better|hope|glad|proud)\b/g) ?? []
  ).length;
  const wordCount = content.split(/\s+/).length;

  return {
    mood,
    emotional_score: 50 + (positiveWords - anxietyWords) * 5,
    anxiety_score: Math.min(100, anxietyWords * 15),
    stress_score: 30,
    positivity_score: Math.min(100, positiveWords * 15),
    themes: [],
    ai_analysis:
      wordCount < 15
        ? "A small entry — even small pages count. There's courage in showing up."
        : "There's a lot woven into these words. I noticed care, effort, and something tender underneath.",
    ai_invitation: "Tomorrow, try writing one sentence that begins with: 'I am proud that I…'",
    crisis_flag: false,
    highlights: [],
  };
}
