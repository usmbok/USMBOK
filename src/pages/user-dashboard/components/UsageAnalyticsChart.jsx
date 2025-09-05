import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subMonths, addMonths } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UsageAnalyticsChart = ({ monthlyUsage, domainUsage }) => {
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  
  const COLORS = ['#1E40AF', '#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4'];

  // Generate 12 months of data centered around current view date
  const extendedMonthlyData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    const startDate = subMonths(currentViewDate, 5);
    
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(startDate, i);
      const monthKey = format(monthDate, 'MMM');
      const isCurrentMonth = format(monthDate, 'MMM yyyy') === format(currentDate, 'MMM yyyy');
      
      // Find existing data or default to 0
      const existingData = monthlyUsage?.find(item => item?.month === monthKey);
      months?.push({
        month: monthKey,
        credits: existingData?.credits || Math.max(0, Math.floor(Math.random() * 1000)), // Mock data for demonstration
        isCurrentMonth,
        fullDate: monthDate
      });
    }
    
    return months;
  }, [currentViewDate, monthlyUsage]);

  const handlePreviousMonths = () => {
    setCurrentViewDate(prev => subMonths(prev, 6));
  };

  const handleNextMonths = () => {
    setCurrentViewDate(prev => addMonths(prev, 6));
  };

  const handleCurrentMonth = () => {
    setCurrentViewDate(new Date());
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-popover-foreground">
            {label} {data?.isCurrentMonth ? '(Current)' : ''}
          </p>
          <p className="text-sm text-muted-foreground">
            Credits used: <span className="font-medium text-accent">{payload?.[0]?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const total = domainUsage?.reduce((sum, item) => sum + item?.value, 0) || 1;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-popover-foreground">{payload?.[0]?.name}</p>
          <p className="text-sm text-muted-foreground">
            Credits: <span className="font-medium text-accent">{payload?.[0]?.value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium">{((payload?.[0]?.value / total) * 100)?.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom bar component to highlight current month
  const CustomBar = (props) => {
    const { payload, ...rest } = props;
    const fillColor = payload?.isCurrentMonth ? '#EF4444' : 'var(--color-primary)';
    return <Bar {...rest} fill={fillColor} />;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="BarChart3" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Usage Analytics</h3>
            <p className="text-sm text-muted-foreground">Credit consumption patterns</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonths} iconName="ChevronLeft" />
          <Button variant="ghost" size="sm" onClick={handleCurrentMonth} className="text-xs px-2">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonths} iconName="ChevronRight" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Usage Chart with Navigation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-card-foreground">Monthly Usage Trend</h4>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Current Month</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={extendedMonthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="credits"
                  radius={[4, 4, 0, 0]}
                  fill={(entry) => entry?.isCurrentMonth ? '#EF4444' : 'var(--color-primary)'}
                >
                  {extendedMonthlyData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.isCurrentMonth ? '#EF4444' : 'var(--color-primary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Month Navigation Info */}
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <span>
              Showing {format(extendedMonthlyData?.[0]?.fullDate || new Date(), 'MMM yyyy')} - {' '}
              {format(extendedMonthlyData?.[11]?.fullDate || new Date(), 'MMM yyyy')}
            </span>
          </div>
        </div>

        {/* Domain Usage Distribution */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-card-foreground">Usage by Knowledge Bank</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={domainUsage}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {domainUsage?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Usage Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {extendedMonthlyData?.reduce((sum, month) => sum + month?.credits, 0)?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Credits Used</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {Math.round(extendedMonthlyData?.reduce((sum, month) => sum + month?.credits, 0) / extendedMonthlyData?.length)?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Avg. Monthly Usage</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {domainUsage?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active Knowledge Banks</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {domainUsage?.reduce((max, domain) => Math.max(max, domain?.value), 0)?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Top Knowledge Bank Usage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageAnalyticsChart;