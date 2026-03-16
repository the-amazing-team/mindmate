import { useState, useCallback, useEffect } from 'react';
import { chatService, ChatMessage } from '@/services/chat.service';
import { insightService } from '@/services/insight.service';
import { authService } from '@/services/auth.service';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    async function init() {
      const history = await chatService.loadHistory();
      setMessages(history);
    }
    init();
  }, []);

  const send = useCallback(async (text: string) => {
    const user = await authService.getCurrentUser();
    if (!user) {
      setError('User not authenticated');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    setError(null);

    try {
      // Fetch insights for context
      const insights = await insightService.getUserInsights(user.id);
      const context = insights
        .map(i => `Insight (${new Date(i.created_at).toLocaleDateString()}): ${i.summary}. Recommendation: ${i.recommendation}`)
        .join('\n\n');

      const historyForAI = messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

      const response = await chatService.chat(text, context, historyForAI);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.answer,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      await chatService.saveHistory(finalMessages);
    } catch (err: any) {
      setError(err.message || 'Failed to get response from AI');
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const reset = useCallback(async () => {
    await chatService.clearHistory();
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    send,
    reset,
  };
}
