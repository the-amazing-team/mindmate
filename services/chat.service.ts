import { apiClient } from './api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  context?: any[];
}

const CHAT_HISTORY_KEY = 'mindmate_chat_history';

class ChatService {
  async chat(question: string, context: string, history: any[]): Promise<{ answer: string }> {
    const response = await apiClient.post('/ai/chat', {
      question,
      context,
      history,
    });
    return response.data;
  }

  async saveHistory(history: ChatMessage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  async loadHistory(): Promise<ChatMessage[]> {
    try {
      const data = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  }
}

export const chatService = new ChatService();
