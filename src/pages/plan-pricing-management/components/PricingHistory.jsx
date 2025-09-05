import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, User, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const PricingHistory = ({ pricingHistory = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    })?.format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'upgrade':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'downgrade':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeTypeColor = (changeType) => {
    switch (changeType) {
      case 'upgrade':
        return 'bg-green-100 text-green-800';
      case 'downgrade':
        return 'bg-red-100 text-red-800';
      case 'renewal':
        return 'bg-blue-100 text-blue-800';
      case 'cancellation':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHistory = pricingHistory?.filter(item => {
    if (filterType === 'all') return true;
    return item?.change_type === filterType;
  }) || [];

  const changeTypeCounts = pricingHistory?.reduce((acc, item) => {
    acc[item?.change_type] = (acc?.[item?.change_type] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Pricing History</h2>
            <p className="mt-1 text-sm text-gray-500">
              Track pricing changes, plan modifications, and their impact over time
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <>
                <span className="mr-1">Collapse</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="mr-1">Expand History</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {pricingHistory?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Total Changes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {changeTypeCounts?.upgrade || 0}
            </div>
            <div className="text-xs text-gray-500">Upgrades</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {changeTypeCounts?.downgrade || 0}
            </div>
            <div className="text-xs text-gray-500">Downgrades</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {changeTypeCounts?.renewal || 0}
            </div>
            <div className="text-xs text-gray-500">Renewals</div>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="p-6">
          {/* Filter Controls */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  filterType === 'all' ?'bg-blue-100 text-blue-800' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({pricingHistory?.length || 0})
              </button>
              {Object.entries(changeTypeCounts)?.map(([type, count]) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                    filterType === type
                      ? 'bg-blue-100 text-blue-800' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* History Timeline */}
          {filteredHistory?.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory?.map((item) => (
                <div
                  key={item?.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getChangeIcon(item?.change_type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getChangeTypeColor(
                              item?.change_type
                            )}`}
                          >
                            {item?.change_type?.charAt(0)?.toUpperCase() + item?.change_type?.slice(1)}
                          </span>
                          
                          {item?.user_profiles?.full_name && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {item?.user_profiles?.full_name}
                            </span>
                          )}
                          
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(item?.effective_date)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Plan Change:</span>
                            <div className="text-gray-600">
                              {item?.from_tier ? (
                                <>
                                  <span className="capitalize">{item?.from_tier}</span>
                                  {' → '}
                                  <span className="capitalize">{item?.to_tier}</span>
                                </>
                              ) : (
                                <span className="capitalize">{item?.to_tier}</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium text-gray-900">Price Impact:</span>
                            <div className="text-gray-600 flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {item?.previous_price !== null ? (
                                <>
                                  {formatCurrency(item?.previous_price)}
                                  {' → '}
                                  {formatCurrency(item?.new_price)}
                                </>
                              ) : (
                                formatCurrency(item?.new_price)
                              )}
                            </div>
                          </div>

                          {item?.prorated_amount && item?.prorated_amount !== 0 && (
                            <div>
                              <span className="font-medium text-gray-900">Prorated Amount:</span>
                              <div className="text-gray-600">
                                {formatCurrency(item?.prorated_amount)}
                              </div>
                            </div>
                          )}
                        </div>

                        {item?.reason && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-gray-900">Reason:</span>
                            <div className="text-gray-600 italic">"{item?.reason}"</div>
                          </div>
                        )}

                        {item?.processed_by?.full_name && (
                          <div className="mt-2 text-xs text-gray-500">
                            Processed by: {item?.processed_by?.full_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {filterType === 'all' ? 'No pricing history' : `No ${filterType} changes`}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterType === 'all' ?'Pricing changes and plan modifications will appear here.'
                  : `No ${filterType} changes have been recorded yet.`
                }
              </p>
            </div>
          )}

          {/* Export Options */}
          {filteredHistory?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Export pricing history for analysis and reporting
                </div>
                <div className="flex space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Export CSV
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PricingHistory;