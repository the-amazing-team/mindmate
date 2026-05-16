import { useCallback, useRef, useState } from "react";
import { streamCompanionResponse, type ChatMessage } from "@/services/ai/companion-engine";
import { useStorybook } from "@/lib/storybook-context";
import { supabase, isDemoMode } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { Mood } from "@/lib/storybook-context";

export interface AIChatMessage {
  id: string;
  from: "you" | "mate";
  text: string;
  streaming?: boolean;
  emotion?: string;
}

const INITIAL_MESSAGE: AIChatMessage = {
  id: "init",
  from: "mate",
  text: "Hello, dear one. The page is yours. What would you like to leave here today?",
};

export function useAIChat() {
  const { mood, addMemory, triggerCounts, profile } = useStorybook();
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>([INITIAL_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState("default");
  const abortRef = useRef<boolean>(false);

  const conversationHistory = useRef<ChatMessage[]>([]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: AIChatMessage = {
        id: crypto.randomUUID(),
        from: "you",
        text,
      };

      setMessages((prev) => [...prev, userMsg]);
      conversationHistory.current.push({ role: "user", content: text });

      // Add memory
      addMemory({ text, source: "companion" });

      // Persist to DB
      if (!isDemoMode && supabase && user) {
        supabase
          .from("chat_history")
          .insert({
            user_id: user.id,
            role: "user",
            message: text,
            emotion_detected: mood,
            mode,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .then();
      }

      // Create streaming placeholder
      const mateId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: mateId, from: "mate", text: "", streaming: true }]);
      setIsStreaming(true);
      abortRef.current = false;

      const recurringTriggers = triggerCounts.slice(0, 3).map((t) => t.trigger);

      await streamCompanionResponse({
        userMessage: text,
        conversationHistory: conversationHistory.current,
        userName: profile.name || "Dear One",
        currentMood: mood as Mood,
        companionName: "Mate",
        recentMemories: [],
        recurringTriggers,
        emotionalProfile: {},
        mode,
        callbacks: {
          onToken: (partial) => {
            if (abortRef.current) return;
            setMessages((prev) => prev.map((m) => (m.id === mateId ? { ...m, text: partial } : m)));
          },
          onComplete: (fullText) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === mateId ? { ...m, text: fullText, streaming: false } : m)),
            );
            setIsStreaming(false);
            conversationHistory.current.push({
              role: "assistant",
              content: fullText,
            });

            // Persist AI response
            if (!isDemoMode && supabase && user) {
              supabase
                .from("chat_history")
                .insert({
                  user_id: user.id,
                  role: "assistant",
                  message: fullText,
                  emotion_detected: mood,
                  mode,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any)
                .then();
            }
          },
          onError: (error) => {
            console.error("AI chat error:", error);
            setIsStreaming(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === mateId
                  ? {
                      ...m,
                      text: "I'm here. Something interrupted our connection — but you can always write what's in your heart.",
                      streaming: false,
                    }
                  : m,
              ),
            );
          },
        },
      });
    },
    [isStreaming, mood, profile, triggerCounts, addMemory, mode, user],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
  }, []);

  const clearHistory = useCallback(() => {
    conversationHistory.current = [];
    setMessages([INITIAL_MESSAGE]);
  }, []);

  return {
    messages,
    isStreaming,
    mode,
    setMode,
    sendMessage,
    stopStreaming,
    clearHistory,
  };
}
