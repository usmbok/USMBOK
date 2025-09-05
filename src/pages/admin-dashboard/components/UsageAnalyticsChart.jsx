import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const UsageAnalyticsChart = ({ data = [] }) => {
  const mockData = data?.length > 0 ? data : [
    { date: '2025-01-01', usage: 1200, users: 45 },
    { date: '2025-01-02', usage: 1400, users: 52 },
    { date: '2025-01-03', usage: 1100, users: 38 },
    { date: '2025-01-04', usage: 1600, users: 61 },
    { date: '2025-01-05', usage: 1800, users: 68 },
    { date: '2025-01-06', usage: 1300, users: 47 },
    { date: '2025-01-07', usage: 1750, users: 63 }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Usage Analytics</h2>
          <p className="text-sm text-muted-foreground">System usage trends over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={16} className="text-success" />
          <span className="text-sm font-medium text-success">+12.5%</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'usage' ? `${value?.toLocaleString()} credits` : `${value} users`,
                name === 'usage' ? 'Credit Usage' : 'Active Users'
              ]}
              labelFormatter={(value) => new Date(value)?.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            />
            <Line 
              type="monotone" 
              dataKey="usage" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--accent))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-sm text-muted-foreground">Credit Usage</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span className="text-sm text-muted-foreground">Active Users</span>
        </div>
      </div>
    </div>
  );
};

export default UsageAnalyticsChart;