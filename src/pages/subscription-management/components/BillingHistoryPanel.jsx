import React, { useState } from 'react';
import { ChevronDown, ChevronUp, DollarSign, FileText } from 'lucide-react';

const BillingHistoryPanel = ({ planChanges = [], billingSimulations = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('changes');

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

  const getChangeTypeColor = (changeType) => {
    switch (changeType) {
      case 'upgrade':
        return 'text-green-600 bg-green-100';
      case 'downgrade':
        return 'text-orange-600 bg-orange-100';
      case 'renewal':
        return 'text-blue-600 bg-blue-100';
      case 'cancellation':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSimulationStatus = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600 bg-green-100', text: 'Completed' };
      case 'pending':
        return { color: 'text-yellow-600 bg-yellow-100', text: 'Pending' };
      case 'failed':
        return { color: 'text-red-600 bg-red-100', text: 'Failed' };
      default:
        return { color: 'text-gray-600 bg-gray-100', text: 'Unknown' };
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Billing History</h2>
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
                <span className="mr-1">Expand</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'changes' ?'bg-blue-100 text-blue-700' :'text-gray-500 hover:text-gray-700'
              }`}
            >
              Plan Changes ({planChanges?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('simulations')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'simulations' ?'bg-blue-100 text-blue-700' :'text-gray-500 hover:text-gray-700'
              }`}
            >
              Billing Simulations ({billingSimulations?.length || 0})
            </button>
          </div>

          {/* Plan Changes Tab */}
          {activeTab === 'changes' && (
            <div>
              {planChanges?.length > 0 ? (
                <div className="space-y-4">
                  {planChanges?.map((change) => (
                    <div
                      key={change?.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeTypeColor(
                                change?.change_type
                              )}`}
                            >
                              {change?.change_type?.charAt(0)?.toUpperCase() + change?.change_type?.slice(1)}
                            </span>
                            {change?.processed_by?.full_name && (
                              <span className="ml-2 text-sm text-gray-500">
                                by {change?.processed_by?.full_name}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">From:</span>
                              <div className="text-gray-600 capitalize">
                                {change?.from_tier || 'None'}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">To:</span>
                              <div className="text-gray-600 capitalize">
                                {change?.to_tier}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Price Change:</span>
                              <div className="text-gray-600">
                                {formatCurrency(change?.previous_price)} → {formatCurrency(change?.new_price)}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Effective Date:</span>
                              <div className="text-gray-600">
                                {formatDate(change?.effective_date)}
                              </div>
                            </div>
                          </div>

                          {change?.reason && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Reason:</span> {change?.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No plan changes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your subscription plan changes will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Billing Simulations Tab */}
          {activeTab === 'simulations' && (
            <div>
              {billingSimulations?.length > 0 ? (
                <div className="space-y-4">
                  {billingSimulations?.map((simulation) => {
                    const statusInfo = getSimulationStatus(simulation?.payment_status);
                    return (
                      <div
                        key={simulation?.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}
                              >
                                {statusInfo?.text}
                              </span>
                              <span className="ml-2 text-sm text-gray-500 capitalize">
                                {simulation?.simulation_type?.replace('_', ' ')}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-900">Plan:</span>
                                <div className="text-gray-600 capitalize">
                                  {simulation?.subscription_tier}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Amount:</span>
                                <div className="text-gray-600">
                                  {formatCurrency(simulation?.amount_usd)}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Payment Method:</span>
                                <div className="text-gray-600 capitalize">
                                  {simulation?.payment_method_type}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">
                                  {simulation?.processed_at ? 'Processed:' : 'Expires:'}
                                </span>
                                <div className="text-gray-600">
                                  {formatDate(simulation?.processed_at || simulation?.expires_at)}
                                </div>
                              </div>
                            </div>

                            {simulation?.simulation_data && (
                              <div className="mt-2 text-xs text-gray-500">
                                Simulation ID: {simulation?.id}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No billing simulations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your payment simulations will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Export Options */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Export options for accounting and record keeping
              </div>
              <div className="flex space-x-2">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Export CSV
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingHistoryPanel;