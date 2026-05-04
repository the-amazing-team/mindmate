import { apiClient } from './api-client';
import { supabase } from './supabase'; // Keep for other features if needed (storage, etc)
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  _email: null as string | null,
  _user: null as any | null,
  _token: null as string | null,

  async _saveSession(email: string, user: any, token: string | null) {
    this._email = email;
    this._user = user;
    this._token = token;
    
    try {
      if (email) await AsyncStorage.setItem('auth_email', email);
      if (user) await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      if (token) await AsyncStorage.setItem('auth_token', token);
    } catch (e) {
      console.error('Failed to save session to storage', e);
    }
  },

  async _clearSession() {
    this._email = null;
    this._user = null;
    this._token = null;
    try {
      await AsyncStorage.multiRemove(['auth_email', 'auth_user', 'auth_token']);
    } catch (e) {
      console.error('Failed to clear session from storage', e);
    }
  },

  async _loadSession() {
    if (this._token) return; // Already loaded in memory
    try {
      const email = await AsyncStorage.getItem('auth_email');
      const userStr = await AsyncStorage.getItem('auth_user');
      const token = await AsyncStorage.getItem('auth_token');
      
      if (email) this._email = email;
      if (userStr) this._user = JSON.parse(userStr);
      if (token) this._token = token;
    } catch (e) {
      console.error('Failed to load session from storage', e);
    }
  },

  async getCurrentUser(forceRefresh = false) {
    await this._loadSession();
    if (this._user && !forceRefresh) return this._user;
    if (!this._email) return null;

    try {
      const response = await apiClient.get(`/users/${this._email}`);
      this._user = response.data;
      await AsyncStorage.setItem('auth_user', JSON.stringify(this._user));
      return this._user;
    } catch (error) {
      console.error('Failed to get current user', error);
      return this._user || null; // Return cached if available, else null
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

      await this._saveSession(email, response.data.user, response.data.token);
      // Trigger OTP
      await this.sendOtp(email);

      return { backendUser: response.data.user || response.data, token: response.data.token };
    } catch (error: any) {
      console.error('Sign up error', error);
      throw error.response?.data || error;
    }
  },

   async login(email: string, password: string) {
     try {
       const response = await apiClient.post('/users/login', { email, password });
       const user = response.data.user || response.data;
       const token = response.data.token || null;
       
       await this._saveSession(email, user, token);
       
       return { backendUser: user, token };
     } catch (error: any) {
       console.error('Login error', error);
       throw error.response?.data || error;
     }
   },

   getEmail() {
     return this._email || this._user?.email;
   },

   getToken() {
     return this._token;
   },

   async signOut() {
    await this._clearSession();
    await supabase.auth.signOut();
  },

  async getSession() {
    await this._loadSession();
    if (!this._token) return null;
    return { user: this._user, token: this._token };
  },

  async completeOnboarding(email: string, data: { 
    ageGroup: string, 
    personality: string, 
    goals: string[], 
    reminders: string, 
    name?: string,
    notifications_enabled?: boolean,
    reminders_enabled?: boolean,
    weekly_insights_enabled?: boolean,
    marketing_emails_enabled?: boolean
  }) {
    try {
      const payload = {
        email,
        age_group: data.ageGroup,
        personality_type: data.personality.toUpperCase(),
        goals: data.goals,
        reminders: data.reminders,
        name: data.name,
        notifications_enabled: data.notifications_enabled,
        reminders_enabled: data.reminders_enabled,
        weekly_insights_enabled: data.weekly_insights_enabled,
        marketing_emails_enabled: data.marketing_emails_enabled
      };
      console.log('Sending update-profile payload:', payload);
      const response = await apiClient.post('/users/update-profile', payload);
      console.log('Update-profile response:', response.data);
      if (response.data) {
        this._user = response.data;
        await AsyncStorage.setItem('auth_user', JSON.stringify(this._user));
      }
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
   },

  async loginWithGoogle(idToken: string) {
    try {
      const response = await apiClient.post('/users/auth/google', { idToken });
      const user = response.data.user;
      const token = response.data.token;
      
      await this._saveSession(user.email, user, token);
      
      return { backendUser: user, token };
    } catch (error: any) {
      console.error('Google login error', error);
      throw error.response?.data || error;
    }
  }
};
