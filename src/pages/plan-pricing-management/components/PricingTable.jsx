import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Edit2, Save, X, DollarSign, Users, Crown, Shield } from 'lucide-react';

const PricingTable = ({ subscriptionPlans = [], onEdit, onSave, editingPlan, onCancelEdit, loading }) => {
  const [editForm, setEditForm] = useState({});

  React.useEffect(() => {
    if (editingPlan) {
      setEditForm({
        ...editingPlan,
        features: Array.isArray(editingPlan?.features) 
          ? editingPlan?.features 
          : JSON.parse(editingPlan?.features || '[]')
      });
    }
  }, [editingPlan]);

  const getPlanIcon = (tier) => {
    switch (tier) {
      case 'registered':
        return <Users className="w-5 h-5 text-gray-500" />;
      case 'subscriber':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'founder':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-red-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatCredits = (credits) => {
    if (credits >= 1000000000) return 'Unlimited';
    if (credits >= 1000000) return `${(credits / 1000000)?.toFixed(0)}M`;
    if (credits >= 1000) return `${(credits / 1000)?.toFixed(0)}K`;
    return credits?.toString() || '0';
  };

  const handleSave = () => {
    const updatedPlan = {
      ...editForm,
      features: JSON.stringify(editForm?.features || [])
    };
    onSave?.(updatedPlan);
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...(editForm?.features || [])];
    newFeatures[index] = value;
    setEditForm({ ...editForm, features: newFeatures });
  };

  const addFeature = () => {
    const newFeatures = [...(editForm?.features || []), ''];
    setEditForm({ ...editForm, features: newFeatures });
  };

  const removeFeature = (index) => {
    const newFeatures = editForm?.features?.filter((_, i) => i !== index) || [];
    setEditForm({ ...editForm, features: newFeatures });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Subscription Plan Configuration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure pricing, credits, and features for each subscription tier
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (USD)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits/Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Billing Cycle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Features
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptionPlans?.map((plan) => (
              <tr key={plan?.id} className="hover:bg-gray-50">
                {editingPlan?.id === plan?.id ? (
                  // Editing Mode
                  (<>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPlanIcon(plan?.tier)}
                        <div className="ml-3">
                          <Input
                            value={editForm?.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e?.target?.value })}
                            className="text-sm font-medium"
                            placeholder="Plan name"
                          />
                          <div className="mt-1">
                            <textarea
                              value={editForm?.description || ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e?.target?.value })}
                              className="text-xs text-gray-500 w-full border border-gray-300 rounded px-2 py-1"
                              rows="2"
                              placeholder="Plan description"
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {plan?.tier === 'admin' ? (
                        <span className="text-sm text-gray-500">N/A</span>
                      ) : (
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm?.price_usd || 0}
                          onChange={(e) => setEditForm({ ...editForm, price_usd: parseFloat(e?.target?.value) })}
                          className="text-sm"
                          placeholder="0.00"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={editForm?.credits_per_month || 0}
                        onChange={(e) => setEditForm({ ...editForm, credits_per_month: parseInt(e?.target?.value) })}
                        className="text-sm"
                        placeholder="Credits"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={editForm?.billing_cycle || 'monthly'}
                        onChange={(e) => setEditForm({ ...editForm, billing_cycle: e?.target?.value })}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="one_time">One Time</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 max-w-xs">
                        {editForm?.features?.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={feature}
                              onChange={(e) => updateFeature(index, e?.target?.value)}
                              className="text-xs flex-1"
                              placeholder="Feature description"
                            />
                            <button
                              onClick={() => removeFeature(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <Button
                          onClick={addFeature}
                          className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1"
                        >
                          Add Feature
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                          className="bg-green-600 text-white hover:bg-green-700 px-3 py-1 text-xs"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={onCancelEdit}
                          disabled={loading}
                          className="bg-gray-300 text-gray-700 hover:bg-gray-400 px-3 py-1 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </>)
                ) : (
                  // View Mode
                  (<>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPlanIcon(plan?.tier)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{plan?.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs">
                            {plan?.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {plan?.price_usd > 0 ? `$${plan?.price_usd}` : 'Free'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCredits(plan?.credits_per_month)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {plan?.billing_cycle?.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {(Array.isArray(plan?.features) ? plan?.features : JSON.parse(plan?.features || '[]'))?.map((feature, index) => (
                          <div key={index} className="text-xs text-gray-600 mb-1">
                            • {feature}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        onClick={() => onEdit?.(plan)}
                        disabled={loading || plan?.tier === 'admin'}
                        className={`${
                          plan?.tier === 'admin' ?'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-blue-600 text-white hover:bg-blue-700'
                        } px-3 py-1 text-xs`}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        {plan?.tier === 'admin' ? 'Locked' : 'Edit'}
                      </Button>
                    </td>
                  </>)
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <strong>Note:</strong> Admin tier pricing cannot be modified for security reasons.
            </div>
            <div className="text-xs text-gray-500">
              Changes take effect immediately after saving
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingTable;