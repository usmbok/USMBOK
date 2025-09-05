import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const UsageAnalyticsChart = ({ data = [], title = "Credit Usage Analytics", type = "bar" }) => {
  const maxUsage = Math?.max(...data?.map(item => item?.usage || 0));
  const avgUsage = data?.length > 0 ? data?.reduce((sum, item) => sum + (item?.usage || 0), 0) / data?.length : 0;
  const trend = data?.length >= 2 ? 
    (data?.[data?.length - 1]?.usage || 0) - (data?.[data?.length - 2]?.usage || 0) : 0;

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return 'text-red-600';
    if (trend < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
          <p className="text-sm text-blue-600">
            Usage: {payload?.[0]?.value?.toLocaleString()} credits
          </p>
          {payload?.[0]?.payload?.remaining !== undefined && (
            <p className="text-sm text-green-600">
              Remaining: {payload?.[0]?.payload?.remaining?.toLocaleString()} credits
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 300,
      data: data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="usage" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="usage" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Trend:</span>
            {getTrendIcon()}
            <span className={getTrendColor()}>
              {trend > 0 ? '+' : ''}{trend?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">Peak Usage</div>
          <div className="text-lg font-semibold text-blue-600">
            {maxUsage?.toLocaleString()}
          </div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600">Average</div>
          <div className="text-lg font-semibold text-green-600">
            {Math?.round(avgUsage)?.toLocaleString()}
          </div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-600">Total Days</div>
          <div className="text-lg font-semibold text-purple-600">
            {data?.length}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full">
        {data?.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No usage data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Usage Insights */}
      {data?.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Usage Insights</h4>
          <div className="text-xs text-gray-600 space-y-1">
            {avgUsage > 0 && (
              <p>
                • Average daily usage: {Math?.round(avgUsage)?.toLocaleString()} credits
              </p>
            )}
            {maxUsage > avgUsage * 1.5 && (
              <p>
                • Peak usage day exceeded average by {Math?.round(((maxUsage - avgUsage) / avgUsage) * 100)}%
              </p>
            )}
            {trend !== 0 && (
              <p>
                • Usage trend: {trend > 0 ? 'Increasing' : 'Decreasing'} by {Math?.abs(trend)?.toLocaleString()} credits
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageAnalyticsChart;