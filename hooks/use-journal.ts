import { useState, useEffect, useCallback } from 'react';
import { 
  journalService, 
  JournalEntry, 
  JournalSection, 
  CreateJournalData 
} from '@/services/journal.service';
import { authService } from '@/services/auth.service';

export { JournalEntry, JournalSection };

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    const user = await authService.getCurrentUser();
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await journalService.getEntries(user.id);
      setEntries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch journal entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (data: Omit<CreateJournalData, 'userId'>) => {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    setSaving(true);
    try {
      const newEntry = await journalService.createEntry({ ...data, userId: user.id });
      setEntries((prev) => [newEntry, ...prev]);
      return { data: newEntry, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to create journal entry' };
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await journalService.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to delete journal entry' };
    }
  };

  const processSection = async (content: string) => {
    try {
      const result = await journalService.processSection(content);
      return { data: result, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to process section' };
    }
  };

  return {
    entries,
    loading,
    error,
    saving,
    createEntry,
    deleteEntry,
    processSection,
    refresh: fetchEntries,
  };
}
