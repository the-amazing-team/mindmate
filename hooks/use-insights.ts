import { useState, useEffect, useCallback } from 'react';
import { insightService, Insight } from '@/services/insight.service';
import { authService } from '@/services/auth.service';

export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    const user = await authService.getCurrentUser();
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await insightService.getUserInsights(user.id);
      setInsights(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getEntryInsight = async (entryId: string) => {
    try {
      return await insightService.getEntryInsight(entryId);
    } catch (err) {
      return null;
    }
  };

  return {
    insights,
    loading,
    error,
    refresh: fetchInsights,
    getEntryInsight,
  };
}
