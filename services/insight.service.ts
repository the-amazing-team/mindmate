import { apiClient } from './api-client';

export interface Insight {
  id: string;
  user_id: string;
  journal_entry_id?: string | null;
  summary: string;
  recommendation: string;
  patterns: any;
  created_at: string;
}

class InsightService {
  async getUserInsights(userId: string): Promise<Insight[]> {
    const response = await apiClient.get(`/insights/user/${userId}`);
    return response.data;
  }

  async getEntryInsight(entryId: string): Promise<Insight | null> {
    const response = await apiClient.get(`/insights/entry/${entryId}`);
    const data = response.data;
    return Array.isArray(data) ? data[0] || null : data;
  }

  async generateInsight(entryId: string): Promise<Insight> {
    const response = await apiClient.post(`/insights/generate/${entryId}`);
    return response.data;
  }

  async deleteInsight(id: string): Promise<void> {
    await apiClient.delete(`/insights/${id}`);
  }
}

export const insightService = new InsightService();
