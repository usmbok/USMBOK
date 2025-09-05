import { supabase } from '../lib/supabase';

export const userManagementService = {
  // Fetch all users with their credits and subscriptions
  async fetchAllUsers() {
    const { data: userProfiles, error } = await supabase
      ?.from('user_profiles')
      ?.select(`
        *,
        user_credits (
          balance,
          updated_at
        ),
        user_subscriptions (
          plan,
          is_active,
          credits_per_month
        )
      `);

    if (error) throw error;
    return userProfiles || [];
  },

  // Update user profile information
  async updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
      ?.from('user_profiles')
      ?.update(profileData)
      ?.eq('id', userId)
      ?.select()
      ?.single();

    if (error) throw error;
    return data;
  },

  // Toggle user active status
  async toggleUserStatus(userId, isActive) {
    const { data, error } = await supabase
      ?.from('user_profiles')
      ?.update({ is_active: isActive })
      ?.eq('id', userId)
      ?.select()
      ?.single();

    if (error) throw error;
    return data;
  },

  // Change user role
  async changeUserRole(userId, role) {
    const { data, error } = await supabase
      ?.from('user_profiles')
      ?.update({ role })
      ?.eq('id', userId)
      ?.select()
      ?.single();

    if (error) throw error;
    return data;
  },

  // Add credits to user account
  async addUserCredits(userId, amount, description = 'Admin credit addition') {
    const { data, error } = await supabase
      ?.rpc('add_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description,
        p_transaction_type: 'adjustment'
      });

    if (error) throw error;
    return data;
  },

  // Deduct credits from user account
  async deductUserCredits(userId, amount, description = 'Admin credit deduction') {
    const { data, error } = await supabase
      ?.rpc('deduct_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description,
        p_transaction_type: 'adjustment'
      });

    if (error) throw error;
    return data;
  },

  // Update user subscription
  async updateUserSubscription(userId, subscriptionData) {
    const { data, error } = await supabase
      ?.from('user_subscriptions')
      ?.upsert({
        user_id: userId,
        ...subscriptionData,
        updated_at: new Date()?.toISOString()
      })
      ?.select()
      ?.single();

    if (error) throw error;
    return data;
  },

  // Get user credit transactions
  async getUserCreditTransactions(userId, limit = 10) {
    const { data, error } = await supabase
      ?.from('credit_transactions')
      ?.select('*')
      ?.eq('user_id', userId)
      ?.order('created_at', { ascending: false })
      ?.limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get user conversations
  async getUserConversations(userId, limit = 10) {
    const { data, error } = await supabase
      ?.from('conversations')
      ?.select('*')
      ?.eq('user_id', userId)
      ?.order('created_at', { ascending: false })
      ?.limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Bulk update users
  async bulkUpdateUsers(userIds, updates) {
    const { data, error } = await supabase
      ?.from('user_profiles')
      ?.update(updates)
      ?.in('id', userIds)
      ?.select();

    if (error) throw error;
    return data;
  },

  // Delete user (soft delete by deactivating)
  async deleteUser(userId) {
    const { data, error } = await supabase
      ?.from('user_profiles')
      ?.update({ 
        is_active: false,
        updated_at: new Date()?.toISOString()
      })
      ?.eq('id', userId)
      ?.select()
      ?.single();

    if (error) throw error;
    return data;
  },

  // Create new user profile
  async createUser(userData) {
    const { data, error } = await supabase
      ?.from('user_profiles')
      ?.insert(userData)
      ?.select()
      ?.single();

    if (error) throw error;
    
    // Create initial credit account
    if (data?.id) {
      await supabase
        ?.from('user_credits')
        ?.insert({
          user_id: data?.id,
          balance: 0
        });
    }

    return data;
  },

  // Get analytics data
  async getAnalytics() {
    const { data: users, error } = await this.fetchAllUsers();
    
    if (error) throw error;

    const totalUsers = users?.length || 0;
    const activeUsers = users?.filter(u => u?.is_active)?.length || 0;
    const trialUsers = users?.filter(u => 
      u?.user_subscriptions?.some(s => s?.plan === 'trial')
    )?.length || 0;
    const premiumUsers = users?.filter(u => 
      u?.user_subscriptions?.some(s => s?.plan === 'premium')
    )?.length || 0;
    const totalCredits = users?.reduce((sum, u) => 
      sum + (u?.user_credits?.[0]?.balance || 0), 0
    ) || 0;

    return {
      totalUsers,
      activeUsers,
      trialUsers,
      premiumUsers,
      totalCredits,
      avgCreditsPerUser: totalUsers > 0 ? Math.round(totalCredits / totalUsers) : 0
    };
  }
};