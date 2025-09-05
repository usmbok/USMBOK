import React, { useState, useEffect } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { userManagementService } from '../../../services/userManagementService';

const UserDetailModal = ({ user, onClose, onUserAction }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    role: user?.role || 'member'
  });
  const [creditAdjustment, setCreditAdjustment] = useState({
    operation: 'add',
    amount: '',
    description: ''
  });

  useEffect(() => {
    fetchUserDetails();
  }, [user?.id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // Fetch credit transactions
      const transactions = await userManagementService?.getUserCreditTransactions(user?.id, 10);

      // Fetch conversations  
      const userConversations = await userManagementService?.getUserConversations(user?.id, 10);

      setCreditTransactions(transactions);
      setConversations(userConversations);
    } catch (error) {
      setError('Failed to fetch user details: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await onUserAction('update-profile', user?.id, editData);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCreditAdjustment = async () => {
    if (!creditAdjustment?.amount || isNaN(creditAdjustment?.amount)) return;
    
    try {
      await onUserAction('adjust-credits', user?.id, {
        operation: creditAdjustment?.operation,
        amount: parseInt(creditAdjustment?.amount),
        description: creditAdjustment?.description || 'Admin adjustment'
      });
      setCreditAdjustment({ operation: 'add', amount: '', description: '' });
      await fetchUserDetails(); // Refresh transactions
    } catch (error) {
      console.error('Error adjusting credits:', error);
    }
  };

  const getCreditBalance = () => {
    return user?.user_credits?.[0]?.balance || 0;
  };

  const getSubscriptionInfo = () => {
    const subscription = user?.user_subscriptions?.[0];
    return {
      plan: subscription?.plan || 'free',
      isActive: subscription?.is_active || false,
      creditsPerMonth: subscription?.credits_per_month || 0
    };
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'credits', label: 'Credits', icon: 'Coins' },
    { id: 'activity', label: 'Activity', icon: 'Activity' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.full_name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} iconName="X" />
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-0">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                        <Input
                          value={editData?.full_name}
                          onChange={(e) => setEditData({ ...editData, full_name: e?.target?.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                        <Input
                          value={editData?.email}
                          onChange={(e) => setEditData({ ...editData, email: e?.target?.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                        <Select
                          value={editData?.role}
                          onValueChange={(value) => setEditData({ ...editData, role: value })}
                          options={[
                            { value: 'member', label: 'Member' },
                            { value: 'premium', label: 'Premium' },
                            { value: 'admin', label: 'Admin' }
                          ]}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveProfile} iconName="Check">Save</Button>
                        <Button variant="outline" onClick={() => setEditMode(false)} iconName="X">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
                        <span className="text-foreground">{user?.full_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Email:</span>
                        <span className="text-foreground">{user?.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Role:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user?.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Registered:</span>
                        <span className="text-foreground">
                          {user?.created_at ? new Date(user.created_at)?.toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      <Button variant="outline" onClick={() => setEditMode(true)} iconName="Edit">
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Account Summary</h3>
                  <div className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-foreground">{getCreditBalance()?.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Credit Balance</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-lg font-semibold text-foreground capitalize">{getSubscriptionInfo()?.plan}</div>
                      <div className="text-sm text-muted-foreground">Subscription Plan</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-lg font-semibold text-foreground">{conversations?.length}</div>
                      <div className="text-sm text-muted-foreground">Total Conversations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="space-y-6">
              {/* Credit Adjustment */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Credit Adjustment</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Operation</label>
                    <Select
                      value={creditAdjustment?.operation}
                      onValueChange={(value) => setCreditAdjustment({ ...creditAdjustment, operation: value })}
                      options={[
                        { value: 'add', label: 'Add Credits' },
                        { value: 'deduct', label: 'Deduct Credits' }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={creditAdjustment?.amount}
                      onChange={(e) => setCreditAdjustment({ ...creditAdjustment, amount: e?.target?.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <Input
                      placeholder="Reason for adjustment"
                      value={creditAdjustment?.description}
                      onChange={(e) => setCreditAdjustment({ ...creditAdjustment, description: e?.target?.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCreditAdjustment} iconName="Plus">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
                <div className="space-y-2">
                  {creditTransactions?.map((transaction) => (
                    <div key={transaction?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction?.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          <Icon name={transaction?.amount > 0 ? 'Plus' : 'Minus'} size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{transaction?.description || 'Credit Transaction'}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction?.created_at)?.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction?.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction?.amount > 0 ? '+' : ''}{transaction?.amount?.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Balance: {transaction?.balance_after?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {creditTransactions?.length === 0 && (
                    <div className="text-center py-8">
                      <Icon name="Coins" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No credit transactions found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Recent Conversations */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Conversations</h3>
                <div className="space-y-2">
                  {conversations?.map((conversation) => (
                    <div key={conversation?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">{conversation?.title || 'Untitled Conversation'}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(conversation?.created_at)?.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          conversation?.status === 'active' ?'bg-green-100 text-green-800' :'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation?.status || 'active'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {conversations?.length === 0 && (
                    <div className="text-center py-8">
                      <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No conversations found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              iconName={user?.is_active ? "UserX" : "UserCheck"}
              onClick={() => onUserAction('toggle-status', user?.id)}
            >
              {user?.is_active ? 'Deactivate' : 'Activate'} Account
            </Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;