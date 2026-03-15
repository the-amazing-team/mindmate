import React, { useState, useEffect, useRef, createContext, useContext, ReactNode, useCallback } from 'react';
import { getSupabase } from './use-supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, metadata?: Record<string, any>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const sbRef = useRef<any>(null);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const { data, error } = await getSupabase().from('users').select('*').eq('id', uid).single();
      if (error && error.code !== 'PGRST116') {
        console.warn('[useAuth] Error fetching profile:', error.message);
      }
      setProfile(data ?? null);
    } catch (e) {
      console.error('[useAuth] profile fetch exception:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    try {
      sbRef.current = getSupabase();
    } catch (e: any) {
      console.warn('[useAuth] Supabase not configured:', e.message);
      setLoading(false);
      return;
    }
    const sb = sbRef.current;

    sb.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  async function signUp(email: string, password: string, name: string, metadata: Record<string, any> = {}) {
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: { 
          data: { 
            name, 
            ...metadata 
          } 
        },
      });

      if (error) return { data, error };

      // If email confirmation is off, we get a session immediately
      if (data?.session) {
        setUser(data.user);
        if (data.user) fetchProfile(data.user.id);
      }
      
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        setUser(data.user);
        fetchProfile(data.user.id);
      }
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async function signOut() {
    try {
      setUser(null);
      setProfile(null);
      await getSupabase().auth.signOut();
    } catch (_) {}
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) return { error: 'Not signed in' };
    const { data, error } = await getSupabase()
      .from('users').update(updates).eq('id', user.id).select().single();
    if (!error && data) setProfile(data);
    return { data, error };
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  const defaultValues: AuthContextType = {
    user: null,
    profile: null,
    loading: false,
    signUp: async () => ({}),
    signIn: async () => ({}),
    signOut: async () => {},
    updateProfile: async () => ({}),
  };

  const current = context || defaultValues;
  
  return {
    ...current,
    profile: current.profile || (current.user ? { id: current.user.id, name: 'MindMate User', avatar_url: null } : null)
  };
}
