import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const UserCreditContext = createContext({});

export const useUserCredit = () => {
  const context = useContext(UserCreditContext);
  if (!context) {
    throw new Error('useUserCredit must be used within a UserCreditProvider');
  }
  return context;
};

export const UserCreditProvider = ({ children }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user credit balance
  const fetchCredits = async () => {
    if (!user?.id) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase?.from('user_credits')?.select('*')?.eq('user_id', user?.id)?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          // No credits record exists, create one with 100k trial credits
          const { data: newCredit, error: createError } = await supabase?.from('user_credits')?.insert({ user_id: user?.id, balance: 100000 })?.select()?.single();
          
          if (createError) throw createError;
          setCredits(newCredit);
        } else {
          throw error;
        }
      } else {
        setCredits(data);
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Deduct credits using the database function with daily tracking
  const deductCredits = async (amount, description = 'Credit usage') => {
    if (!user?.id) {
      throw new Error('No user logged in');
    }

    try {
      const { data, error } = await supabase?.rpc('deduct_user_credits', {
        p_user_id: user?.id,
        p_amount: amount,
        p_description: description
      });

      if (error) throw error;
      
      // Track daily usage (non-blocking)
      try {
        await trackDailyUsage(amount);
      } catch (trackingError) {
        console.warn('Failed to track daily usage:', trackingError?.message);
      }

      // Update local state
      setCredits(prev => ({
        ...prev,
        balance: data?.new_balance
      }));

      return data;
    } catch (err) {
      console.error('Error deducting credits:', err);
      throw err;
    }
  };

  // Add credits using the database function
  const addCredits = async (amount, description = 'Credit purchase') => {
    if (!user?.id) {
      throw new Error('No user logged in');
    }

    try {
      const { data, error } = await supabase?.rpc('add_user_credits', {
        p_user_id: user?.id,
        p_amount: amount,
        p_description: description
      });

      if (error) throw error;
      
      // Update local state
      setCredits(prev => ({
        ...prev,
        balance: data?.new_balance
      }));

      return data;
    } catch (err) {
      console.error('Error adding credits:', err);
      throw err;
    }
  };

  // Fetch credit transactions
  const fetchTransactions = async (limit = 10, offset = 0) => {
    if (!user?.id) {
      return [];
    }

    try {
      const { data, error } = await supabase?.from('credit_transactions')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching transactions:', err);
      throw err;
    }
  };

  // Get daily usage statistics with error handling
  const getDailyUsage = async (daysBack = 7) => {
    if (!user?.id) {
      return 0;
    }

    try {
      const { data, error } = await supabase?.rpc('get_daily_credit_usage', {
        user_uuid: user?.id,
        days_back: daysBack
      });

      if (error) {
        // If function doesn't exist, return 0 and log warning
        console.warn('get_daily_credit_usage function not available:', error?.message);
        return 0;
      }
      return data || 0;
    } catch (err) {
      console.error('Error fetching daily usage:', err);
      return 0;
    }
  };

  // Get days remaining based on current usage with error handling
  const getDaysRemaining = async () => {
    if (!user?.id) {
      return 0;
    }

    try {
      const { data, error } = await supabase?.rpc('get_days_remaining', {
        user_uuid: user?.id
      });

      if (error) {
        // If function doesn't exist, calculate basic estimate console.warn('get_days_remaining function not available:', error?.message);
        
        // Fallback calculation based on current balance
        if (credits?.balance) {
          const estimatedDailyUsage = 1000; // Conservative estimate
          return Math.floor(credits?.balance / estimatedDailyUsage);
        }
        return 0;
      }
      return data || 0;
    } catch (err) {
      console.error('Error fetching days remaining:', err);
      return 0;
    }
  };

  // Track daily usage with error handling
  const trackDailyUsage = async (creditsUsed) => {
    if (!user?.id) {
      return;
    }

    try {
      await supabase?.rpc('track_daily_usage', {
        user_uuid: user?.id,
        credits: creditsUsed
      });
    } catch (err) {
      // Log but don't fail if tracking function doesn't exist
      console.warn('track_daily_usage function not available:', err?.message);
    }
  };

  // Set up real-time subscription for credit updates
  useEffect(() => {
    if (!user?.id) return;

    fetchCredits();

    // Subscribe to changes
    const channel = supabase?.channel('user_credits_changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Credit balance updated:', payload);
          if (payload?.eventType === 'UPDATE' && payload?.new) {
            setCredits(payload?.new);
          }
        }
      )?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [user?.id]);

  const value = {
    credits,
    loading,
    error,
    balance: credits?.balance || 0,
    fetchCredits,
    deductCredits,
    addCredits,
    fetchTransactions,
    getDailyUsage,
    getDaysRemaining,
  };

  return (
    <UserCreditContext.Provider value={value}>
      {children}
    </UserCreditContext.Provider>
  );
};

export default UserCreditProvider;