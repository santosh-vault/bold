import { useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthUser extends User {
  profile?: Profile;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const profileCache = useRef<Map<string, Profile>>(new Map());

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        } else if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with debouncing
    let authTimeout: NodeJS.Timeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Clear any pending auth updates
        if (authTimeout) clearTimeout(authTimeout);
        
        // Debounce auth state changes to prevent rapid updates
        authTimeout = setTimeout(async () => {
          if (!mounted) return;
          
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
            setUser(null);
            setLoading(false);
          }
        }, 100);
      }
    );

    const fetchUserProfile = async (authUser: User) => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        
        // Check cache first
        const cachedProfile = profileCache.current.get(authUser.id);
        if (cachedProfile) {
          const userWithProfile = { ...authUser, profile: cachedProfile };
          setUser(userWithProfile);
          setLoading(false);
          return;
        }
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        if (mounted) {
          const userWithProfile = { ...authUser, profile: profile || undefined };
          
          // Cache the profile
          if (profile) {
            profileCache.current.set(authUser.id, profile);
          }
          
          setUser(userWithProfile);
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        if (mounted) {
          setUser(authUser);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    return () => {
      mounted = false;
      if (authTimeout) clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear profile cache
      profileCache.current.clear();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Update cache
    profileCache.current.set(user.id, data);
    
    setUser({ ...user, profile: data });
    return data;
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};