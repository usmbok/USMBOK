import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { TrendingUp, TrendingDown, BarChart3, Calculator } from 'lucide-react';

const ImpactAnalysis = ({ analyticsData, subscriptionPlans = [], onSimulate }) => {
  const [changes, setChanges] = useState([]);
  const [showSimulator, setShowSimulator] = useState(false);

  const addChange = (tier) => {
    const plan = subscriptionPlans?.find(p => p?.tier === tier);
    if (plan && !changes?.find(c => c?.tier === tier)) {
      setChanges([...changes, {
        tier: tier,
        currentPrice: plan?.price_usd,
        newPrice: plan?.price_usd,
        currentCredits: plan?.credits_per_month,
        newCredits: plan?.credits_per_month
      }]);
    }
  };

  const updateChange = (tier, field, value) => {
    setChanges(changes?.map(change => 
      change?.tier === tier ? { ...change, [field]: parseFloat(value) || 0 } : change
    ));
  };

  const removeChange = (tier) => {
    setChanges(changes?.filter(change => change?.tier !== tier));
  };

  const runSimulation = () => {
    if (changes?.length > 0) {
      onSimulate?.(changes);
    }
  };

  const formatCredits = (credits) => {
    if (credits >= 1000000000) return 'Unlimited';
    if (credits >= 1000000) return `${(credits / 1000000)?.toFixed(1)}M`;
    if (credits >= 1000) return `${(credits / 1000)?.toFixed(0)}K`;
    return credits?.toString() || '0';
  };

  const getPriceChange = (currentPrice, newPrice) => {
    const diff = newPrice - currentPrice;
    const percentage = currentPrice > 0 ? (diff / currentPrice) * 100 : 0;
    return { diff, percentage };
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Impact Analysis & Simulation</h2>
            <p className="mt-1 text-sm text-gray-500">
              Model pricing changes and forecast their impact on revenue and subscribers
            </p>
          </div>
          <Button
            onClick={() => setShowSimulator(!showSimulator)}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {showSimulator ? 'Hide Simulator' : 'Open Simulator'}
          </Button>
        </div>
      </div>
      {showSimulator && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Add Plans to Simulate</h3>
            <div className="flex flex-wrap gap-2">
              {subscriptionPlans?.filter(plan => plan?.tier !== 'admin')?.map(plan => (
                <Button
                  key={plan?.tier}
                  onClick={() => addChange(plan?.tier)}
                  disabled={changes?.find(c => c?.tier === plan?.tier)}
                  className={`text-xs px-3 py-1 ${
                    changes?.find(c => c?.tier === plan?.tier)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {plan?.name}
                </Button>
              ))}
            </div>
          </div>

          {changes?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Pricing Changes</h3>
              {changes?.map((change) => {
                const priceChange = getPriceChange(change?.currentPrice, change?.newPrice);
                const plan = subscriptionPlans?.find(p => p?.tier === change?.tier);
                
                return (
                  <div key={change?.tier} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900 capitalize">
                          {plan?.name}
                        </h4>
                        {Math.abs(priceChange?.diff) > 0 && (
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            priceChange?.diff > 0 
                              ? 'bg-red-100 text-red-800' :'bg-green-100 text-green-800'
                          }`}>
                            {priceChange?.diff > 0 ? '+' : ''}${priceChange?.diff?.toFixed(2)} 
                            ({priceChange?.percentage > 0 ? '+' : ''}{priceChange?.percentage?.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => removeChange(change?.tier)}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Current Price
                        </label>
                        <div className="text-sm text-gray-600">${change?.currentPrice}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          New Price
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={change?.newPrice}
                          onChange={(e) => updateChange(change?.tier, 'newPrice', e?.target?.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Current Credits
                        </label>
                        <div className="text-sm text-gray-600">
                          {formatCredits(change?.currentCredits)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          New Credits
                        </label>
                        <Input
                          type="number"
                          value={change?.newCredits}
                          onChange={(e) => updateChange(change?.tier, 'newCredits', e?.target?.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-center pt-4">
                <Button
                  onClick={runSimulation}
                  className="bg-green-600 text-white hover:bg-green-700 px-6 py-2"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Run Impact Simulation
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Current Analytics Display */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Current Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData?.totalSubscribers?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-500">Active Subscribers</div>
            <div className="mt-2 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+12% this month</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ${analyticsData?.monthlyRevenue?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-500">Monthly Revenue</div>
            <div className="mt-2 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+8% this month</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData?.conversionRate || '0'}%
            </div>
            <div className="text-sm text-gray-500">Conversion Rate</div>
            <div className="mt-2 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-xs text-red-600">-2% this month</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ${((analyticsData?.monthlyRevenue || 0) / (analyticsData?.totalSubscribers || 1))?.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">ARPU</div>
            <div className="mt-2 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+5% this month</span>
            </div>
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Subscription Tier Distribution</h4>
          <div className="space-y-3">
            {Object.entries(analyticsData?.tierDistribution || {})?.map(([tier, percentage]) => (
              <div key={tier} className="flex items-center">
                <div className="w-20 text-xs text-gray-600 capitalize">{tier}:</div>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        tier === 'registered' ? 'bg-gray-500' :
                        tier === 'subscriber' ? 'bg-blue-500' :
                        tier === 'founder'? 'bg-purple-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-600 w-12">{percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalysis;