// ============================================================
// AI Companion Engine — Real streaming AI chat
// Supports Groq and OpenAI with emotional memory RAG
// ============================================================

import { buildCompanionSystemPrompt, getModeInstruction } from "@/lib/prompts";
import type { Mood } from "@/lib/storybook-context";
import { detectCrisis } from "@/lib/crisis-detector";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CompanionResponse {
  text: string;
  crisisDetected: boolean;
  emotionDetected: string;
  mode: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

function getApiConfig() {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

  if (groqKey && groqKey !== "your_groq_api_key") {
    return { url: GROQ_API_URL, key: groqKey, model: "llama-3.3-70b-versatile" };
  }
  if (openaiKey && openaiKey !== "your_openai_api_key") {
    return { url: OPENAI_API_URL, key: openaiKey, model: "gpt-4o-mini" };
  }
  return null;
}

/**
 * Stream a companion response with real-time token delivery
 */
export async function streamCompanionResponse(params: {
  userMessage: string;
  conversationHistory: ChatMessage[];
  userName: string;
  currentMood: Mood;
  companionName: string;
  recentMemories: Array<{ text: string; mood: string; created_at: string }>;
  recurringTriggers: string[];
  emotionalProfile: Record<string, unknown>;
  mode?: string;
  callbacks: StreamCallbacks;
}): Promise<CompanionResponse> {
  const {
    userMessage,
    conversationHistory,
    userName,
    currentMood,
    companionName,
    recentMemories,
    recurringTriggers,
    emotionalProfile,
    mode = "default",
    callbacks,
  } = params;

  // Client-side crisis detection first
  const crisisCheck = detectCrisis(userMessage);

  const systemPrompt =
    buildCompanionSystemPrompt({
      userName,
      currentMood,
      companionName,
      recentMemories,
      recurringTriggers,
      emotionalProfile,
    }) + (getModeInstruction(mode) ? `\n\nMODE OVERRIDE: ${getModeInstruction(mode)}` : "");

  const apiConfig = getApiConfig();

  // Demo mode fallback
  if (!apiConfig) {
    const demoResponse = getDemoResponse(userMessage, currentMood, recurringTriggers);
    let accumulated = "";
    // Simulate streaming with word-by-word reveal
    const words = demoResponse.split(" ");
    for (const word of words) {
      await new Promise((r) => setTimeout(r, 60 + Math.random() * 40));
      accumulated += (accumulated ? " " : "") + word;
      callbacks.onToken(accumulated);
    }
    callbacks.onComplete(demoResponse);
    return {
      text: demoResponse,
      crisisDetected: crisisCheck.level === "crisis",
      emotionDetected: currentMood,
      mode,
    };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch(apiConfig.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiConfig.key}`,
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages,
        temperature: 0.85,
        max_tokens: 350,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content ?? "";
          if (token) {
            fullText += token;
            callbacks.onToken(fullText);
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }

    callbacks.onComplete(fullText);
    return {
      text: fullText,
      crisisDetected: crisisCheck.level === "crisis",
      emotionDetected: currentMood,
      mode,
    };
  } catch (error) {
    callbacks.onError(error as Error);
    const fallback = getDemoResponse(userMessage, currentMood, recurringTriggers);
    callbacks.onComplete(fallback);
    return {
      text: fallback,
      crisisDetected: crisisCheck.level === "crisis",
      emotionDetected: currentMood,
      mode,
    };
  }
}

/**
 * Demo responses when no AI API key is configured
 */
function getDemoResponse(text: string, mood: Mood, recurring: string[]): string {
  const lower = text.toLowerCase();

  if (recurring.length > 0 && Math.random() < 0.4) {
    return `I notice ${recurring[0]} keeps finding its way into your pages. We've sat with this before — what do you think it needs from you today?`;
  }

  if (/anx|panic|scared|afraid/.test(lower)) {
    return "Anxiety is a wave — it crests, and it falls. You are the shoreline, not the storm. Can you take one slow breath with me right now?";
  }
  if (/sad|tired|alone|lonely/.test(lower)) {
    return "I hear you. Loneliness can ache in such a quiet way. I'm sitting here with you — you don't have to carry this silently.";
  }
  if (/happy|good|grateful|love/.test(lower)) {
    return "I love that for you. Let's press this moment into the page so we can return to it when the skies are grey again.";
  }
  if (/angry|frustrated|rage/.test(lower)) {
    return "Anger is information — it's telling you something important. What does it feel like it's protecting?";
  }

  const moodResponses: Record<Mood, string> = {
    calm: "I'm here. The page is open. Tell me what's sitting in your chest today.",
    melancholy:
      "Whatever you're carrying right now — it makes sense. You don't have to rush through it.",
    anxious:
      "Breathe with me first. In for four... hold for four... out for six. I'm not going anywhere.",
    joy: "Your softness and your joy can coexist. What's sparkling for you today?",
    hopeful: "Hope is a quiet kind of courage. What does it feel like today?",
  };

  return moodResponses[mood] || "I'm here. Tell me what's sitting on your chest right now.";
}
