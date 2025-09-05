import React, { useState } from 'react';
import { CreditCard, Crown, Check, ArrowRight, Calculator, TrendingUp } from 'lucide-react';
import Button from '../../../components/ui/Button';

const ConversionWorkflow = ({ 
  currentUsage = 0, 
  creditsRemaining = 0, 
  daysRemaining = 0, 
  onUpgrade 
}) => {
  const [selectedPlan, setSelectedPlan] = useState('subscriber');
  const [showCalculator, setShowCalculator] = useState(false);

  const plans = [
    {
      id: 'subscriber',
      name: 'Subscriber',
      credits: 1000000,
      price: 29.99,
      icon: <CreditCard className="w-6 h-6" />,
      popular: true,
      features: [
        '1M credits per month',
        'All AI assistants',
        'Priority support',
        'Advanced analytics',
        'API access'
      ]
    },
    {
      id: 'founder',
      name: 'Founder',
      credits: 5000000,
      price: 99.99,
      icon: <Crown className="w-6 h-6" />,
      premium: true,
      features: [
        '5M credits per month',
        'All AI assistants',
        'Premium support',
        'Advanced analytics',
        'API access',
        'Custom integrations',
        'Early access features'
      ]
    }
  ];

  const calculateSavings = (planCredits, planPrice) => {
    if (currentUsage === 0) return null;
    
    const monthlyUsage = currentUsage * 30; // Estimate monthly usage
    const creditsPerDollar = planCredits / planPrice;
    const costPerCredit = planPrice / planCredits;
    
    return {
      monthlyUsage,
      creditsPerDollar: Math?.round(creditsPerDollar),
      costPerCredit: (costPerCredit * 1000)?.toFixed(3), // Cost per 1000 credits
      willCover: monthlyUsage <= planCredits
    };
  };

  const getRecommendation = () => {
    if (currentUsage === 0) return 'subscriber';
    
    const monthlyUsage = currentUsage * 30;
    
    if (monthlyUsage <= 1000000) return 'subscriber';
    if (monthlyUsage <= 5000000) return 'founder';
    
    return 'founder'; // For very heavy usage
  };

  const recommendedPlan = getRecommendation();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Upgrade Your Plan
        </h3>
        <p className="text-gray-600">
          Choose the perfect plan based on your usage patterns
        </p>
      </div>

      {/* Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-600">Current Daily Usage</div>
          <div className="text-lg font-semibold text-blue-600">
            {currentUsage?.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Estimated Monthly</div>
          <div className="text-lg font-semibold text-purple-600">
            {(currentUsage * 30)?.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Days Remaining</div>
          <div className="text-lg font-semibold text-red-600">
            {daysRemaining}
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {plans?.map((plan) => {
          const savings = calculateSavings(plan?.credits, plan?.price);
          const isRecommended = plan?.id === recommendedPlan;
          const isSelected = selectedPlan === plan?.id;

          return (
            <div
              key={plan?.id}
              className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isRecommended
                  ? 'border-green-500 bg-green-50' :'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan(plan?.id)}
            >
              {/* Badges */}
              <div className="absolute -top-3 left-4 flex gap-2">
                {isRecommended && (
                  <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Recommended
                  </span>
                )}
                {plan?.popular && (
                  <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                {plan?.premium && (
                  <span className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Premium
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  plan?.premium ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {plan?.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{plan?.name}</h4>
                  <p className="text-gray-600">
                    {(plan?.credits / 1000000)?.toFixed(0)}M credits/month
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  ${plan?.price}
                  <span className="text-lg text-gray-500 font-normal">/month</span>
                </div>
                {savings && (
                  <div className="text-sm text-gray-600 mt-1">
                    ${savings?.costPerCredit}/1K credits
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {plan?.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {savings && (
                <div className={`p-3 rounded-lg text-sm ${
                  savings?.willCover 
                    ? 'bg-green-100 text-green-800' :'bg-yellow-100 text-yellow-800'
                }`}>
                  {savings?.willCover ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Covers your usage with room to grow</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>May need higher plan for peak usage</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage Calculator Toggle */}
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCalculator(!showCalculator)}
          className="flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          {showCalculator ? 'Hide' : 'Show'} Usage Calculator
        </Button>
      </div>

      {/* Usage Calculator */}
      {showCalculator && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-3">Usage Calculator</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-2">Current Pattern:</div>
              <div className="space-y-1">
                <div>Daily: {currentUsage?.toLocaleString()} credits</div>
                <div>Weekly: {(currentUsage * 7)?.toLocaleString()} credits</div>
                <div>Monthly: {(currentUsage * 30)?.toLocaleString()} credits</div>
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Plan Comparison:</div>
              <div className="space-y-1">
                {plans?.map((plan) => {
                  const monthlyUsage = currentUsage * 30;
                  const utilization = monthlyUsage > 0 ? (monthlyUsage / plan?.credits * 100) : 0;
                  
                  return (
                    <div key={plan?.id} className="flex justify-between">
                      <span>{plan?.name}:</span>
                      <span className={
                        utilization > 100 ? 'text-red-600' :
                        utilization > 80 ? 'text-yellow-600' : 'text-green-600'
                      }>
                        {Math?.round(utilization)}% used
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p>30-day money-back guarantee</p>
          <p>Cancel anytime, no hidden fees</p>
        </div>
        
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => onUpgrade?.(selectedPlan)}
        >
          Upgrade to {plans?.find(p => p?.id === selectedPlan)?.name}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Benefits Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">What you get immediately:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>Instant access to full credit allocation</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>No more trial limitations or expiration warnings</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>Priority customer support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>Advanced features and integrations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionWorkflow;