import React from 'react';
import Icon from '../../../components/AppIcon';

const ConversationStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Conversations',
      value: stats?.totalConversations,
      icon: 'MessageSquare',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Credits Used',
      value: stats?.totalCreditsUsed?.toLocaleString(),
      icon: 'Coins',
      color: 'text-amber-600 bg-amber-50'
    },
    {
      title: 'This Month',
      value: stats?.thisMonthConversations,
      icon: 'Calendar',
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Avg. Credits/Session',
      value: Math.round(stats?.averageCreditsPerSession),
      icon: 'TrendingUp',
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  const topDomains = [
    { name: 'Technology', count: 45, percentage: 35 },
    { name: 'Finance', count: 32, percentage: 25 },
    { name: 'Healthcare', count: 28, percentage: 22 },
    { name: 'Legal', count: 15, percentage: 12 },
    { name: 'Other', count: 8, percentage: 6 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards?.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat?.title}</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {stat?.value}
                </p>
              </div>
              <div className={`p-2 rounded-md ${stat?.color}`}>
                <Icon name={stat?.icon} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Domain Usage */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Most Used Domains
        </h3>
        <div className="space-y-3">
          {topDomains?.map((domain, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <span className="font-medium text-foreground">{domain?.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${domain?.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {domain?.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Usage Trends
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last 7 days</span>
            <span className="text-sm font-medium text-foreground">
              {stats?.last7Days} conversations
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last 30 days</span>
            <span className="text-sm font-medium text-foreground">
              {stats?.last30Days} conversations
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Peak usage day</span>
            <span className="text-sm font-medium text-foreground">
              {stats?.peakDay}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationStats;