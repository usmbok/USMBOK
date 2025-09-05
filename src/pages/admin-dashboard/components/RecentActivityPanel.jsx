import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentActivityPanel = ({ activities = [] }) => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      
      // Fetch from unified activity feed view
      const { data: unifiedActivities, error: unifiedError } = await supabase
        ?.from('unified_activity_feed')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(20);

      if (unifiedError) {
        // Fallback to credit_transactions if unified view fails
        const { data: creditData, error: creditError } = await supabase
          ?.from('credit_transactions')
          ?.select(`
            *,
            user_profiles!credit_transactions_user_id_fkey(full_name, email)
          `)
          ?.order('created_at', { ascending: false })
          ?.limit(10);

        if (creditError) throw creditError;
        
        // Transform credit transactions to activity format
        const transformedData = creditData?.map(transaction => ({
          id: transaction?.id,
          type: transaction?.transaction_type,
          entity_type: 'credit',
          entity_id: transaction?.id,
          user_id: transaction?.user_id,
          description: transaction?.description || `Credit ${transaction?.transaction_type}`,
          amount: transaction?.amount,
          created_at: transaction?.created_at,
          user_profiles: transaction?.user_profiles,
          metadata: {
            payment_status: transaction?.payment_status,
            balance_after: transaction?.balance_after
          }
        })) || [];
        
        setActivityData(transformedData);
      } else {
        // Process unified activity data
        const processedData = await Promise.all(unifiedActivities?.map(async (activity) => {
          let userInfo = null;
          
          // Get user info if user_id exists
          if (activity?.user_id) {
            const { data: userProfile } = await supabase
              ?.from('user_profiles')
              ?.select('full_name, email')
              ?.eq('id', activity?.user_id)
              ?.single();
            userInfo = userProfile;
          }
          
          return {
            ...activity,
            user_profiles: userInfo
          };
        }) || []);
        
        setActivityData(processedData);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setActivityData([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    // Credit-related activities
    if (type?.includes('credit') || type === 'purchase' || type === 'usage' || type === 'adjustment' || type === 'refund') {
      switch (type) {
        case 'purchase': case'credit_purchase': return 'ShoppingCart';
        case 'usage': case'credit_usage': return 'MessageSquare';
        case 'refund': case'credit_refund': return 'RotateCcw';
        case 'adjustment': case'credit_adjustment': return 'Settings';
        default: return 'Coins';
      }
    }
    
    // User-related activities
    if (type?.includes('user')) {
      switch (type) {
        case 'user_created': return 'UserPlus';
        case 'user_updated': return 'UserCheck';
        case 'user_activated': return 'UserCheck';
        case 'user_deactivated': return 'UserX';
        case 'user_role_changed': return 'Shield';
        default: return 'User';
      }
    }
    
    // Assistant-related activities
    if (type?.includes('assistant')) {
      switch (type) {
        case 'assistant_created': return 'Plus';
        case 'assistant_updated': return 'Edit';
        case 'assistant_activated': return 'Play';
        case 'assistant_deactivated': return 'Pause';
        default: return 'Bot';
      }
    }
    
    return 'Activity';
  };

  const getActivityColor = (type) => {
    // Credit-related activities
    if (type?.includes('credit') || type === 'purchase' || type === 'usage' || type === 'adjustment' || type === 'refund') {
      switch (type) {
        case 'purchase': case'credit_purchase': return 'text-success';
        case 'usage': case'credit_usage': return 'text-primary';
        case 'refund': case'credit_refund': return 'text-warning';
        case 'adjustment': case'credit_adjustment': return 'text-accent';
        default: return 'text-success';
      }
    }
    
    // User-related activities
    if (type?.includes('user')) {
      switch (type) {
        case 'user_created': return 'text-success';
        case 'user_activated': return 'text-success';
        case 'user_updated': return 'text-primary';
        case 'user_deactivated': return 'text-error';
        case 'user_role_changed': return 'text-accent';
        default: return 'text-primary';
      }
    }
    
    // Assistant-related activities
    if (type?.includes('assistant')) {
      switch (type) {
        case 'assistant_created': return 'text-success';
        case 'assistant_activated': return 'text-success';
        case 'assistant_updated': return 'text-primary';
        case 'assistant_deactivated': return 'text-warning';
        default: return 'text-primary';
      }
    }
    
    return 'text-muted-foreground';
  };

  const formatAmount = (amount, type) => {
    if (!amount) return '';
    
    if (type?.includes('usage') || type === 'usage') {
      return `-${Math.abs(amount)?.toLocaleString()}`;
    }
    return `+${Math.abs(amount)?.toLocaleString()}`;
  };

  const getActivityDisplayText = (activity) => {
    const userName = activity?.user_profiles?.full_name || activity?.user_profiles?.email || 'Unknown User';
    
    // If we have a description, use it
    if (activity?.description && activity?.description !== activity?.type) {
      return {
        primary: activity?.description,
        secondary: userName
      };
    }
    
    // Generate display text based on activity type
    switch (activity?.type) {
      case 'user_created':
        return {
          primary: `New user account created`,
          secondary: userName
        };
      case 'user_updated':
        return {
          primary: `User profile updated`,
          secondary: userName
        };
      case 'user_activated':
        return {
          primary: `User account activated`,
          secondary: userName
        };
      case 'user_deactivated':
        return {
          primary: `User account deactivated`,
          secondary: userName
        };
      case 'user_role_changed':
        return {
          primary: `User role changed`,
          secondary: userName
        };
      case 'assistant_created':
        return {
          primary: `New AI assistant created`,
          secondary: activity?.metadata?.domain || 'System'
        };
      case 'assistant_updated':
        return {
          primary: `AI assistant updated`,
          secondary: activity?.metadata?.domain || 'System'
        };
      case 'assistant_activated':
        return {
          primary: `AI assistant activated`,
          secondary: activity?.metadata?.domain || 'System'
        };
      case 'assistant_deactivated':
        return {
          primary: `AI assistant deactivated`,
          secondary: activity?.metadata?.domain || 'System'
        };
      case 'purchase': case'credit_purchase':
        return {
          primary: `Credit purchase completed`,
          secondary: userName
        };
      case 'usage': case'credit_usage':
        return {
          primary: `AI consultation session`,
          secondary: userName
        };
      case 'adjustment': case'credit_adjustment':
        return {
          primary: `Credit adjustment`,
          secondary: userName
        };
      case 'refund': case'credit_refund':
        return {
          primary: `Credit refund processed`,
          secondary: userName
        };
      default:
        return {
          primary: activity?.description || `${activity?.type} activity`,
          secondary: userName
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">Latest system activities and events</p>
          </div>
          <Icon name="Clock" size={16} className="text-muted-foreground" />
        </div>
        
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader2" size={24} className="text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Latest user, assistant, and credit activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            iconName="RefreshCw"
            onClick={fetchActivityData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Icon name="Clock" size={16} className="text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-4">
        {activityData?.length > 0 ? (
          activityData?.slice(0, 12)?.map((activity) => {
            const displayText = getActivityDisplayText(activity);
            
            return (
              <div key={activity?.id} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 bg-muted rounded-full flex items-center justify-center`}>
                  <Icon 
                    name={getActivityIcon(activity?.type)} 
                    size={16} 
                    className={getActivityColor(activity?.type)}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{displayText?.primary}</div>
                      <div className="text-sm text-muted-foreground">
                        {displayText?.secondary}
                      </div>
                    </div>
                    <div className="text-right">
                      {activity?.amount && (
                        <div className={`font-semibold ${getActivityColor(activity?.type)}`}>
                          {formatAmount(activity?.amount, activity?.type)}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {activity?.created_at ? new Date(activity.created_at)?.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No recent activities found</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={fetchActivityData}
            >
              Refresh Activities
            </Button>
          </div>
        )}
      </div>
      {activityData?.length > 12 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View All Activities ({activityData?.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityPanel;