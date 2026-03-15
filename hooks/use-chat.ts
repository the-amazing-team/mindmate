import { useState, useCallback, useRef, useEffect } from 'react';
import { callPipeline } from './use-supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'assistant';
  text: string;
  context: any[];
}

export function useChat(userId: string | undefined, profileName: string | undefined) {
  const greeting = `Hey ${profileName || 'there'} 👋 I've read your journal and I'm here to help you reflect. What's on your mind?`;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Multi-turn history — sent to the Edge Function on every message
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  const STORAGE_KEY = `mindmate_chat_${userId}`;

  // Load messages from storage
  useEffect(() => {
    if (!userId) return;

    const loadMessages = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
          
          // Sync historyRef
          historyRef.current = parsed
            .filter((m: ChatMessage) => m.id !== '0')
            .map((m: ChatMessage) => ({
              role: m.role === 'ai' ? 'assistant' : m.role,
              content: m.text
            }));
        } else {
          setMessages([{ id: '0', role: 'ai', text: greeting, context: [] }] as ChatMessage[]);
        }
      } catch (e) {
        console.warn('Failed to load chat history', e);
        setMessages([{ id: '0', role: 'ai', text: greeting, context: [] }] as ChatMessage[]);
      }
    };

    loadMessages();
  }, [userId, greeting]);

  // Save messages to storage
  useEffect(() => {
    if (!userId || messages.length === 0) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      .catch(e => console.warn('Failed to save chat history', e));
  }, [messages, userId]);

  const send = useCallback(async (question: string) => {
    if (!question.trim() || !userId || loading) return;

    const userMsg: ChatMessage = { id: String(Date.now()), role: 'user', text: question, context: [] };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError('');

    // Append user turn to history before sending
    historyRef.current.push({ role: 'user', content: question });

    try {
      // Pipeline C: vector_search → context_retrieval → ai_response
      let result;
      try {
        result = await callPipeline('C', {
          user_id:      userId,
          question,
          history:      historyRef.current.slice(-12),  // last 12 turns (6 exchanges)
          profile_name: profileName,
        });
      } catch (pipelineErr) {
        console.warn('Pipeline C failed, using mock response:', pipelineErr);
        // Mock Response Fallback
        result = {
          answer: `I hear you. Based on what you've shared about your experiences, it sounds like you're navigating some complex feelings. (Note: This is a fallback response as the AI pipeline is still being configured).`,
          context: [
            { date: 'Today', emotion: 'Mental Health', similarity: 85 },
            { date: 'Yesterday', emotion: 'Reflection', similarity: 72 }
          ]
        };
      }

      const aiMsg: ChatMessage = {
        id:      String(Date.now() + 1),
        role:    'ai',
        text:    result.answer ?? 'Something went wrong. Please try again.',
        context: result.context ?? [],  // [{date, emotion, similarity}] — shown as badge
      };

      setMessages(prev => [...prev, aiMsg]);

      // Append AI turn to history
      historyRef.current.push({ role: 'assistant', content: aiMsg.text });

    } catch (err: any) {
      setError(err?.message ?? 'Could not reach AI. Check your Supabase config.');
    }

    setLoading(false);
  }, [userId, profileName, loading]);

  const reset = useCallback(() => {
    historyRef.current = [];
    const initial: ChatMessage[] = [{ id: '0', role: 'ai', text: greeting, context: [] }];
    setMessages(initial);
    if (userId) AsyncStorage.removeItem(STORAGE_KEY);
  }, [greeting, userId]);

  return { messages, loading, error, send, reset };
}
