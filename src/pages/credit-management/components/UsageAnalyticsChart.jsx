import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

import Button from '../../../components/ui/Button';

const UsageAnalyticsChart = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [chartType, setChartType] = useState('bar');

  // Mock data for different time periods
  const dailyData = [
    { date: '12/28', credits: 145, conversations: 8 },
    { date: '12/29', credits: 167, conversations: 12 },
    { date: '12/30', credits: 134, conversations: 7 },
    { date: '12/31', credits: 89, conversations: 5 },
    { date: '01/01', credits: 156, conversations: 9 },
    { date: '01/02', credits: 178, conversations: 11 },
    { date: '01/03', credits: 142, conversations: 8 }
  ];

  const weeklyData = [
    { week: 'Week 1', credits: 980, conversations: 45 },
    { week: 'Week 2', credits: 1120, conversations: 52 },
    { week: 'Week 3', credits: 890, conversations: 38 },
    { week: 'Week 4', credits: 1050, conversations: 48 }
  ];

  const monthlyData = [
    { month: 'Oct', credits: 4200, conversations: 180 },
    { month: 'Nov', credits: 3800, conversations: 165 },
    { month: 'Dec', credits: 4500, conversations: 195 },
    { month: 'Jan', credits: 2100, conversations: 89 }
  ];

  // Domain usage data for pie chart
  const domainData = [
    { name: 'Technology', value: 35, color: '#3B82F6' },
    { name: 'Business', value: 28, color: '#10B981' },
    { name: 'Science', value: 20, color: '#F59E0B' },
    { name: 'Healthcare', value: 12, color: '#EF4444' },
    { name: 'Legal', value: 5, color: '#8B5CF6' }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      default: return dailyData;
    }
  };

  const getXAxisKey = () => {
    switch (activeTab) {
      case 'weekly': return 'week';
      case 'monthly': return 'month';
      default: return 'date';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.dataKey === 'credits' ? 'Credits' : 'Conversations'}: {entry?.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const tabs = [
    { id: 'daily', label: 'Daily', icon: 'Calendar' },
    { id: 'weekly', label: 'Weekly', icon: 'CalendarDays' },
    { id: 'monthly', label: 'Monthly', icon: 'CalendarRange' }
  ];

  const chartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: 'BarChart3' },
    { id: 'line', label: 'Line Chart', icon: 'TrendingUp' },
    { id: 'domain', label: 'Domain Usage', icon: 'PieChart' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">Track your credit consumption patterns</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {chartTypes?.map((type) => (
            <Button
              key={type?.id}
              variant={chartType === type?.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType(type?.id)}
              iconName={type?.icon}
              className="hidden sm:flex"
            />
          ))}
        </div>
      </div>
      {/* Mobile Chart Type Selector */}
      <div className="flex space-x-1 mb-4 sm:hidden">
        {chartTypes?.map((type) => (
          <Button
            key={type?.id}
            variant={chartType === type?.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartType(type?.id)}
            iconName={type?.icon}
            className="flex-1"
          >
            {type?.label}
          </Button>
        ))}
      </div>
      {/* Time Period Tabs (only for bar and line charts) */}
      {chartType !== 'domain' && (
        <div className="flex space-x-1 mb-6">
          {tabs?.map((tab) => (
            <Button
              key={tab?.id}
              variant={activeTab === tab?.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab?.id)}
              iconName={tab?.icon}
              iconPosition="left"
            >
              {tab?.label}
            </Button>
          ))}
        </div>
      )}
      {/* Chart Container */}
      <div className="h-80 w-full">
        {chartType === 'bar' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getCurrentData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey={getXAxisKey()} 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="credits" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'line' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getCurrentData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey={getXAxisKey()} 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="credits" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === 'domain' && (
          <div className="flex flex-col lg:flex-row items-center justify-center h-full">
            <div className="w-full lg:w-1/2 h-64 lg:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={domainData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {domainData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Usage']}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-3 mt-4 lg:mt-0">
              {domainData?.map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: domain?.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{domain?.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{domain?.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Summary Stats */}
      {chartType !== 'domain' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {getCurrentData()?.reduce((sum, item) => sum + item?.credits, 0)?.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Credits</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {getCurrentData()?.reduce((sum, item) => sum + item?.conversations, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Conversations</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {Math.round(getCurrentData()?.reduce((sum, item) => sum + item?.credits, 0) / getCurrentData()?.length)}
            </div>
            <div className="text-xs text-muted-foreground">Avg/Period</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {Math.round(getCurrentData()?.reduce((sum, item) => sum + item?.credits, 0) / getCurrentData()?.reduce((sum, item) => sum + item?.conversations, 0))}
            </div>
            <div className="text-xs text-muted-foreground">Credits/Chat</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageAnalyticsChart;