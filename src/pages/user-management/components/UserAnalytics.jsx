import React from 'react';
import Icon from '../../../components/AppIcon';

const UserAnalytics = ({ analytics }) => {
  const cards = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers?.toLocaleString() || '0',
      icon: 'Users',
      color: 'blue',
      description: 'All registered users'
    },
    {
      title: 'Active Users',
      value: analytics?.activeUsers?.toLocaleString() || '0',
      icon: 'UserCheck',
      color: 'green',
      description: 'Currently active users'
    },
    {
      title: 'Trial Users',
      value: analytics?.trialUsers?.toLocaleString() || '0',
      icon: 'Clock',
      color: 'yellow',
      description: 'Users on trial plan'
    },
    {
      title: 'Premium Users',
      value: analytics?.premiumUsers?.toLocaleString() || '0',
      icon: 'Crown',
      color: 'purple',
      description: 'Premium subscribers'
    },
    {
      title: 'Total Credits',
      value: analytics?.totalCredits?.toLocaleString() || '0',
      icon: 'Coins',
      color: 'orange',
      description: 'Credits across all users'
    },
    {
      title: 'Avg Credits',
      value: analytics?.avgCreditsPerUser?.toLocaleString() || '0',
      icon: 'TrendingUp',
      color: 'indigo',
      description: 'Average per user'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards?.map((card, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses?.[card?.color]}`}>
              <Icon name={card?.icon} size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{card?.value}</div>
            <div className="text-sm font-medium text-foreground">{card?.title}</div>
            <div className="text-xs text-muted-foreground">{card?.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserAnalytics;