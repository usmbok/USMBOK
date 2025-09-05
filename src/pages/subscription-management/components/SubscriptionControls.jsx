import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { X, AlertTriangle, CreditCard, Shield } from 'lucide-react';

const SubscriptionControls = ({ 
  currentSubscription, 
  selectedPlan, 
  onPlanChange, 
  onCancel, 
  onClose, 
  loading 
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);

  if (!selectedPlan && !showConfirmation) {
    return null;
  }

  const handlePlanChangeConfirm = () => {
    setConfirmationAction('change');
    setShowConfirmation(true);
  };

  const handleCancelConfirm = () => {
    setConfirmationAction('cancel');
    setShowConfirmation(true);
  };

  const executeAction = () => {
    if (confirmationAction === 'change') {
      onPlanChange?.(selectedPlan);
    } else if (confirmationAction === 'cancel') {
      onCancel?.();
    }
    setShowConfirmation(false);
    setConfirmationAction(null);
    onClose?.();
  };

  const getPlanDetails = (tier) => {
    const plans = {
      registered: { name: 'Registered', price: 0, credits: '100K' },
      subscriber: { name: 'Subscriber', price: 29.99, credits: '1M' },
      founder: { name: 'Founder', price: 99.99, credits: '5M' },
      admin: { name: 'Admin', price: 0, credits: 'Unlimited' }
    };
    return plans?.[tier] || { name: 'Unknown', price: 0, credits: '0' };
  };

  const currentPlan = getPlanDetails(currentSubscription?.tier);
  const newPlan = getPlanDetails(selectedPlan);

  // Plan Change Modal
  if (selectedPlan && !showConfirmation) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Confirm Plan Change</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">Current Plan:</div>
                  <div className="text-gray-600">{currentPlan?.name}</div>
                  <div className="text-gray-600">${currentPlan?.price}/month</div>
                  <div className="text-gray-600">{currentPlan?.credits} credits</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">New Plan:</div>
                  <div className="text-gray-600">{newPlan?.name}</div>
                  <div className="text-gray-600">${newPlan?.price}/month</div>
                  <div className="text-gray-600">{newPlan?.credits} credits</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Simulation Mode</div>
                  <div className="mt-1">
                    This is a payment simulation. No actual charges will be processed. 
                    In production mode, this would handle real payments via Stripe.
                  </div>
                </div>
              </div>
            </div>

            {newPlan?.price !== currentPlan?.price && (
              <div className="mt-4 text-sm text-gray-600">
                <div className="font-medium">Billing Changes:</div>
                <ul className="mt-1 space-y-1">
                  <li>• Immediate effective date</li>
                  <li>• Prorated billing for current cycle</li>
                  <li>• Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toLocaleDateString()}</li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlanChangeConfirm}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {loading ? 'Processing...' : 'Confirm Change'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation Modal
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {confirmationAction === 'change' ? 'Confirm Plan Change' : 'Confirm Cancellation'}
            </h3>
            <button
              onClick={() => {
                setShowConfirmation(false);
                setConfirmationAction(null);
                onClose?.();
              }}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="text-gray-900 font-medium">
                {confirmationAction === 'change' ? 'Final Confirmation' : 'Are you sure?'}
              </span>
            </div>

            <div className="text-sm text-gray-600">
              {confirmationAction === 'change' ? (
                <div>
                  <p className="mb-2">
                    You are about to change your subscription from <strong>{currentPlan?.name}</strong> to <strong>{newPlan?.name}</strong>.
                  </p>
                  <p className="mb-2">
                    This action will be processed immediately in simulation mode.
                  </p>
                  <p>
                    Changes take effect immediately and your next billing cycle will be adjusted accordingly.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-2">
                    You are about to cancel your <strong>{currentPlan?.name}</strong> subscription.
                  </p>
                  <p className="mb-2">
                    You will retain access to your current plan until your next billing date.
                  </p>
                  <p>
                    After cancellation, you will be moved to the Registered (free) tier.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setShowConfirmation(false);
                setConfirmationAction(null);
                onClose?.();
              }}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Go Back
            </Button>
            <Button
              onClick={executeAction}
              disabled={loading}
              className={`flex-1 text-white ${
                confirmationAction === 'change' ?'bg-blue-600 hover:bg-blue-700' :'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Processing...' : confirmationAction === 'change' ? 'Confirm Change' : 'Cancel Subscription'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionControls;