import React from 'react';
import Button from '../../../components/ui/Button';
import { Clock, AlertTriangle, Gift } from 'lucide-react';

const TrialStatusCard = ({ trialDaysRemaining = 0, onUpgrade }) => {
  const getTrialStatus = () => {
    if (trialDaysRemaining <= 0) {
      return {
        status: 'expired',
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        title: 'Trial Expired',
        message: 'Your 7-day trial has ended. Upgrade to continue with enhanced features.',
        urgent: true
      };
    } else if (trialDaysRemaining <= 2) {
      return {
        status: 'expiring',
        color: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-800',
        icon: <Clock className="w-5 h-5 text-yellow-500" />,
        title: 'Trial Ending Soon',
        message: `Your trial expires in ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'day' : 'days'}. Upgrade now to avoid interruption.`,
        urgent: true
      };
    } else {
      return {
        status: 'active',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800',
        icon: <Gift className="w-5 h-5 text-blue-500" />,
        title: 'Trial Active',
        message: `You have ${trialDaysRemaining} days remaining in your free trial.`,
        urgent: false
      };
    }
  };

  const trialStatus = getTrialStatus();

  return (
    <div className={`border rounded-lg p-6 mb-8 ${trialStatus?.color}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">
            {trialStatus?.icon}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${trialStatus?.textColor}`}>
              {trialStatus?.title}
            </h3>
            <p className={`mt-1 text-sm ${trialStatus?.textColor}`}>
              {trialStatus?.message}
            </p>
            
            {trialStatus?.status !== 'expired' && (
              <div className="mt-3">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-700">Trial Progress:</div>
                  <div className="ml-3 flex-1 max-w-xs">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          trialDaysRemaining <= 2 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: `${Math.max(0, (7 - trialDaysRemaining) / 7 * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-3 text-sm text-gray-600">
                    Day {Math.max(0, 7 - trialDaysRemaining)} of 7
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="text-sm text-gray-600">
                <strong>Current trial benefits:</strong>
              </div>
              <ul className="mt-1 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>100,000 monthly credits</li>
                <li>Access to all AI assistants</li>
                <li>Community support</li>
                <li>Basic conversation history</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="ml-6 flex-shrink-0">
          <Button
            onClick={onUpgrade}
            className={`${
              trialStatus?.urgent
                ? 'bg-red-600 hover:bg-red-700' :'bg-blue-600 hover:bg-blue-700'
            } text-white px-6 py-2 text-sm font-medium`}
          >
            {trialStatus?.status === 'expired' ? 'Upgrade Now' : 'Upgrade Early'}
          </Button>
        </div>
      </div>
      {/* Upgrade Preview */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900">Upgrade to Subscriber:</div>
            <ul className="mt-1 text-gray-600 space-y-1">
              <li>• 1,000,000 monthly credits (10x more)</li>
              <li>• Priority support</li>
              <li>• Advanced features</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-900">Upgrade to Founder:</div>
            <ul className="mt-1 text-gray-600 space-y-1">
              <li>• 5,000,000 monthly credits (50x more)</li>
              <li>• Premium support</li>
              <li>• Custom integrations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialStatusCard;