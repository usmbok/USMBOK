import { supabase } from '../lib/supabase';

/**
 * Activity Log Service
 * Handles all activity logging functionality for the admin dashboard
 */
class ActivityLogService {
  
  /**
   * Fetch unified activity feed
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of activities to fetch
   * @param {string} options.entityType - Filter by entity type (user, assistant, credit)
   * @param {string} options.activityType - Filter by activity type
   * @returns {Promise<Object>} Activity data
   */
  async getUnifiedActivityFeed(options = {}) {
    try {
      const { 
        limit = 50, 
        entityType = null, 
        activityType = null,
        startDate = null,
        endDate = null 
      } = options;

      let query = supabase
        ?.from('unified_activity_feed')
        ?.select('*')
        ?.order('created_at', { ascending: false });

      if (limit) {
        query = query?.limit(limit);
      }

      if (entityType) {
        query = query?.eq('entity_type', entityType);
      }

      if (activityType) {
        query = query?.eq('type', activityType);
      }

      if (startDate) {
        query = query?.gte('created_at', startDate);
      }

      if (endDate) {
        query = query?.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with user profiles
      const enrichedData = await this.enrichWithUserProfiles(data || []);

      return { data: enrichedData, error: null };
    } catch (error) {
      console.error('Error fetching unified activity feed:', error);
      return { data: [], error };
    }
  }

  /**
   * Enrich activity data with user profile information
   * @param {Array} activities - Array of activity records
   * @returns {Promise<Array>} Enriched activity data
   */
  async enrichWithUserProfiles(activities) {
    if (!activities?.length) return [];

    try {
      // Get unique user IDs
      const userIds = [...new Set(
        activities
          ?.filter(activity => activity?.user_id)
          ?.map(activity => activity?.user_id)
      )];

      if (!userIds?.length) return activities;

      // Fetch user profiles
      const { data: userProfiles, error } = await supabase
        ?.from('user_profiles')
        ?.select('id, full_name, email, role')
        ?.in('id', userIds);

      if (error) {
        console.error('Error fetching user profiles:', error);
        return activities;
      }

      // Create user profile lookup
      const userLookup = {};
      userProfiles?.forEach(profile => {
        userLookup[profile?.id] = profile;
      });

      // Enrich activities with user data
      return activities?.map(activity => ({
        ...activity,
        user_profiles: activity?.user_id ? userLookup?.[activity?.user_id] : null
      }));
    } catch (error) {
      console.error('Error enriching activity data:', error);
      return activities;
    }
  }

  /**
   * Log custom admin activity
   * @param {Object} activityData - Activity data
   * @param {string} activityData.activityType - Type of activity
   * @param {string} activityData.entityType - Entity type (user, assistant, credit)
   * @param {string} activityData.entityId - Entity ID
   * @param {string} activityData.userId - User ID involved
   * @param {string} activityData.description - Activity description
   * @param {Object} activityData.metadata - Additional metadata
   * @param {number} activityData.amount - Amount (for credit activities)
   * @returns {Promise<Object>} Log result
   */
  async logActivity(activityData) {
    try {
      const { data, error } = await supabase
        ?.rpc('log_admin_activity', {
          p_activity_type: activityData?.activityType,
          p_entity_type: activityData?.entityType,
          p_entity_id: activityData?.entityId || null,
          p_user_id: activityData?.userId || null,
          p_description: activityData?.description,
          p_metadata: activityData?.metadata || {},
          p_amount: activityData?.amount || null
        });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { data: null, error };
    }
  }

  /**
   * Get activity statistics
   * @param {Object} options - Query options
   * @param {number} options.days - Number of days to look back
   * @returns {Promise<Object>} Activity statistics
   */
  async getActivityStats(options = {}) {
    try {
      const { days = 7 } = options;
      const startDate = new Date();
      startDate?.setDate(startDate?.getDate() - days);

      const { data, error } = await supabase
        ?.from('admin_activity_log')
        ?.select('activity_type, entity_type, created_at')
        ?.gte('created_at', startDate?.toISOString());

      if (error) throw error;

      // Process statistics
      const stats = {
        totalActivities: data?.length || 0,
        userActivities: data?.filter(a => a?.entity_type === 'user')?.length || 0,
        assistantActivities: data?.filter(a => a?.entity_type === 'assistant')?.length || 0,
        creditActivities: data?.filter(a => a?.entity_type === 'credit')?.length || 0,
        byType: {},
        byDate: {}
      };

      // Group by activity type
      data?.forEach(activity => {
        const type = activity?.activity_type;
        stats.byType[type] = (stats?.byType?.[type] || 0) + 1;

        // Group by date
        const date = new Date(activity?.created_at)?.toDateString();
        stats.byDate[date] = (stats?.byDate?.[date] || 0) + 1;
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return { data: null, error };
    }
  }

  /**
   * Search activities
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.query - Search query
   * @param {string} searchParams.entityType - Entity type filter
   * @param {number} searchParams.limit - Result limit
   * @returns {Promise<Object>} Search results
   */
  async searchActivities(searchParams) {
    try {
      const { query, entityType = null, limit = 25 } = searchParams;

      let dbQuery = supabase
        ?.from('admin_activity_log')
        ?.select(`
          *,
          user_profiles!admin_activity_log_user_id_fkey(full_name, email)
        `)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (entityType) {
        dbQuery = dbQuery?.eq('entity_type', entityType);
      }

      if (query) {
        dbQuery = dbQuery?.ilike('description', `%${query}%`);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error searching activities:', error);
      return { data: [], error };
    }
  }

  /**
   * Export activity data
   * @param {Object} exportOptions - Export options
   * @param {string} exportOptions.format - Export format (csv, json)
   * @param {number} exportOptions.days - Number of days to export
   * @param {string} exportOptions.entityType - Entity type filter
   * @returns {Promise<Object>} Export data
   */
  async exportActivities(exportOptions = {}) {
    try {
      const { format = 'csv', days = 30, entityType = null } = exportOptions;
      
      const startDate = new Date();
      startDate?.setDate(startDate?.getDate() - days);

      let query = supabase
        ?.from('unified_activity_feed')
        ?.select('*')
        ?.gte('created_at', startDate?.toISOString())
        ?.order('created_at', { ascending: false });

      if (entityType) {
        query = query?.eq('entity_type', entityType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Format data based on export format
      if (format === 'csv') {
        return { data: this.formatAsCSV(data), error: null };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error exporting activities:', error);
      return { data: null, error };
    }
  }

  /**
   * Format data as CSV string
   * @param {Array} data - Activity data
   * @returns {string} CSV formatted string
   */
  formatAsCSV(data) {
    if (!data?.length) return '';

    const headers = ['Date', 'Type', 'Entity Type', 'Description', 'Amount', 'User ID'];
    const rows = data?.map(activity => [
      new Date(activity?.created_at)?.toLocaleString(),
      activity?.type || '',
      activity?.entity_type || '',
      activity?.description || '',
      activity?.amount || '',
      activity?.user_id || ''
    ]);

    const csvContent = [headers, ...rows]
      ?.map(row => row?.map(field => `"${String(field)?.replace(/"/g, '""')}"`)?.join(','))
      ?.join('\n');

    return csvContent;
  }
}

export default new ActivityLogService();