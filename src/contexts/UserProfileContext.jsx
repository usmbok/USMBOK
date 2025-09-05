import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const UserProfileContext = createContext({});

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }) => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is a subscriber (registered member)
  const isSubscriber = profile?.role === 'member';
  
  // Check if user has premium subscription
  const hasPremiumSubscription = profile?.role === 'premium';
  
  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  // Fetch user profile data
  const fetchProfile = async () => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', user?.id)
        ?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          // No profile exists, create one
          const { data: newProfile, error: createError } = await supabase
            ?.from('user_profiles')
            ?.insert({
              id: user?.id,
              email: user?.email,
              full_name: user?.user_metadata?.full_name || user?.email?.split('@')?.[0],
              role: 'member'
            })
            ?.select()
            ?.single();
          
          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    if (!user?.id) {
      throw new Error('No user logged in');
    }

    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update(updates)
        ?.eq('id', user?.id)
        ?.select()
        ?.single();

      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  // Set up profile fetch and real-time subscription
  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchProfile();

    // Subscribe to profile changes
    const channel = supabase
      ?.channel('user_profile_changes')
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('User profile updated:', payload);
          if (payload?.eventType === 'UPDATE' && payload?.new) {
            setProfile(payload?.new);
          }
        }
      )
      ?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [user?.id]);

  const value = {
    profile,
    loading,
    error,
    isSubscriber,
    hasPremiumSubscription,
    isAdmin,
    fetchProfile,
    updateProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileProvider;