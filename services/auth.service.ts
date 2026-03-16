import { apiClient } from './api-client';
import { supabase } from './supabase'; // Keep for other features if needed (storage, etc)

export const authService = {
  _email: null as string | null,
  _user: null as any | null,

  async getCurrentUser() {
    if (this._user) return this._user;
    if (!this._email) return null;

    try {
      const response = await apiClient.get(`/users/${this._email}`);
      this._user = response.data;
      return this._user;
    } catch (error) {
      console.error('Failed to get current user', error);
      return null;
    }
  },

  async signUp(email: string, password: string, name: string) {
    try {
      const response = await apiClient.post('/users/sync', {
        email,
        name,
        password,
        onboarding_complete: false,
        is_verified: false,
      });

      this._email = email;
      this._user = response.data;
      // Trigger OTP
      await this.sendOtp(email);

      return { backendUser: response.data };
    } catch (error: any) {
      console.error('Sign up error', error);
      throw error.response?.data || error;
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await apiClient.post('/users/login', { email, password });
      this._email = email;
      this._user = response.data;
      return { backendUser: response.data };
    } catch (error: any) {
      console.error('Login error', error);
      throw error.response?.data || error;
    }
  },

  getEmail() {
    return this._email || this._user?.email;
  },

  async signOut() {
    // For custom auth, we might just clear local storage if we were using it
    // If Supabase is still used for other things:
    await supabase.auth.signOut();
  },

  async getSession() {
    // For now, custom auth might rely on backend sessions or just return null if not implemented
    return null;
  },

  async completeOnboarding(email: string, data: { ageGroup: string, personality: string, goals: string[], reminders: string }) {
    try {
      const response = await apiClient.post('/users/update-profile', {
        email,
        age_group: data.ageGroup,
        personality_type: data.personality.toUpperCase(),
        goals: data.goals,
        reminders: data.reminders,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to complete onboarding', error);
      throw error;
    }
  },

  async checkEmailAvailability(email: string) {
    try {
      const response = await apiClient.get(`/users/check-email?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Failed to check email availability', error);
      return { available: true };
    }
  },

  async sendOtp(email: string) {
    try {
      await apiClient.post('/users/send-otp', { email });
    } catch (error) {
      console.error('Failed to send OTP', error);
      throw error;
    }
  },

  async verifyOtp(email: string, otp: string) {
    try {
      await apiClient.post('/users/verify-otp', { email, otp });
    } catch (error) {
      console.error('Failed to verify OTP', error);
      throw error;
    }
  }
};
