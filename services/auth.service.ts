import { supabase } from './supabase';
import { apiClient } from './api-client';

export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Sync with backend using axios
    try {
      await apiClient.post('/users/sync', {
        email,
        name,
        password_hash: 'managed-by-supabase',
      });
    } catch (e) {
      console.error('Backend sync error', e);
    }

    return authData;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async updatePersonality(email: string, ageGroup: string, personality: string) {
    try {
      const response = await apiClient.post('/users/update-profile', {
        email,
        age_group: ageGroup,
        personality_type: personality,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update personality', error);
      throw error;
    }
  }
};
