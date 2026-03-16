import { apiClient } from './api-client';

export interface JournalSection {
  id: string;
  content: string;
  section_order: number;
  created_at: string;
  // Optional AI fields for later
  primary_emotion?: string | null;
  emotion_score?: number | null;
  reflection_text?: string | null;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  overall_mood: string;
  created_at: string;
  updated_at: string;
  sections?: JournalSection[];
}

export interface CreateJournalData {
  userId: string;
  title?: string | null;
  overall_mood: string;
  sections: {
    content: string;
    section_order: number;
  }[];
}

class JournalService {
  async getEntries(userId: string): Promise<JournalEntry[]> {
    const response = await apiClient.get(`/journal/user/${userId}`);
    return response.data;
  }

  async getEntry(id: string): Promise<JournalEntry> {
    const response = await apiClient.get(`/journal/${id}`);
    return response.data;
  }

  async createEntry(data: CreateJournalData): Promise<JournalEntry> {
    const response = await apiClient.post('/journal', data);
    return response.data;
  }

  async deleteEntry(id: string): Promise<void> {
    await apiClient.delete(`/journal/${id}`);
  }

  async processSection(content: string): Promise<{
    primary_emotion: string;
    emotion_score: number;
    secondary_emotions: string[];
    valence: string;
    reflection_text: string;
  }> {
    const response = await apiClient.post('/journal/process-journal', { content });
    return response.data;
  }
}

export const journalService = new JournalService();
