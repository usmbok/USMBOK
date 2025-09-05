import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const DangerZoneSection = () => {
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showClearData, setShowClearData] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [clearDataConfirmation, setClearDataConfirmation] = useState('');
  const [deleteAcknowledgments, setDeleteAcknowledgments] = useState({
    dataLoss: false,
    subscriptionCancel: false,
    irreversible: false
  });
  const [clearDataAcknowledgments, setClearDataAcknowledgments] = useState({
    conversationLoss: false,
    historyLoss: false,
    irreversible: false
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE ACCOUNT') return;
    if (!Object.values(deleteAcknowledgments)?.every(Boolean)) return;

    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Account deletion requested');
      // In real app, this would redirect to a confirmation page or logout
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllData = async () => {
    if (clearDataConfirmation !== 'CLEAR ALL DATA') return;
    if (!Object.values(clearDataAcknowledgments)?.every(Boolean)) return;

    setIsClearing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('All data cleared');
      setClearDataConfirmation('');
      setClearDataAcknowledgments({
        conversationLoss: false,
        historyLoss: false,
        irreversible: false
      });
      setShowClearData(false);
    } catch (error) {
      console.error('Failed to clear data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAcknowledgment = (key, value) => {
    setDeleteAcknowledgments(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearDataAcknowledgment = (key, value) => {
    setClearDataAcknowledgments(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isDeleteReady = deleteConfirmation === 'DELETE ACCOUNT' && 
                       Object.values(deleteAcknowledgments)?.every(Boolean);

  const isClearDataReady = clearDataConfirmation === 'CLEAR ALL DATA' && 
                          Object.values(clearDataAcknowledgments)?.every(Boolean);

  return (
    <div className="space-y-6">
      {/* Data Management */}
      <div className="bg-card rounded-lg border border-warning/20 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
            <h3 className="text-lg font-semibold text-card-foreground">Data Management</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your data with caution. These actions cannot be undone.
          </p>
        </div>

        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-card-foreground">Export All Data</h4>
              <p className="text-xs text-muted-foreground">
                Download a copy of all your conversations, settings, and usage data
              </p>
            </div>
            <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
              Export Data
            </Button>
          </div>

          {/* Clear All Data */}
          <div className="flex items-center justify-between p-4 border border-warning/20 rounded-lg bg-warning/5">
            <div>
              <h4 className="text-sm font-medium text-card-foreground">Clear All Data</h4>
              <p className="text-xs text-muted-foreground">
                Permanently delete all conversations, history, and preferences
              </p>
            </div>
            <Button
              variant="warning"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              onClick={() => setShowClearData(true)}
            >
              Clear Data
            </Button>
          </div>
        </div>
      </div>
      {/* Clear Data Modal */}
      {showClearData && (
        <div className="bg-card rounded-lg border border-error/20 p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertTriangle" size={20} className="text-error" />
              <h3 className="text-lg font-semibold text-error">Clear All Data</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This will permanently delete all your data. This action cannot be undone.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <h4 className="text-sm font-medium text-error mb-2">What will be deleted:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• All conversation history</li>
                <li>• Saved prompts and templates</li>
                <li>• Usage analytics and statistics</li>
                <li>• Custom preferences and settings</li>
                <li>• Export history and downloads</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Checkbox
                label="I understand that all conversation history will be permanently deleted"
                checked={clearDataAcknowledgments?.conversationLoss}
                onChange={(e) => handleClearDataAcknowledgment('conversationLoss', e?.target?.checked)}
              />
              
              <Checkbox
                label="I understand that all usage history and analytics will be lost"
                checked={clearDataAcknowledgments?.historyLoss}
                onChange={(e) => handleClearDataAcknowledgment('historyLoss', e?.target?.checked)}
              />
              
              <Checkbox
                label="I understand this action is irreversible"
                checked={clearDataAcknowledgments?.irreversible}
                onChange={(e) => handleClearDataAcknowledgment('irreversible', e?.target?.checked)}
              />
            </div>

            <Input
              label="Type 'CLEAR ALL DATA' to confirm"
              type="text"
              value={clearDataConfirmation}
              onChange={(e) => setClearDataConfirmation(e?.target?.value)}
              placeholder="CLEAR ALL DATA"
              error={clearDataConfirmation && clearDataConfirmation !== 'CLEAR ALL DATA' ? 'Please type exactly: CLEAR ALL DATA' : ''}
            />

            <div className="flex items-center space-x-3 pt-4">
              <Button
                variant="destructive"
                loading={isClearing}
                disabled={!isClearDataReady}
                iconName="Trash2"
                iconPosition="left"
                onClick={handleClearAllData}
              >
                Clear All Data
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowClearData(false);
                  setClearDataConfirmation('');
                  setClearDataAcknowledgments({
                    conversationLoss: false,
                    historyLoss: false,
                    irreversible: false
                  });
                }}
                disabled={isClearing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Account Deletion */}
      <div className="bg-card rounded-lg border border-error/20 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertTriangle" size={20} className="text-error" />
            <h3 className="text-lg font-semibold text-error">Delete Account</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>

        {!showDeleteAccount ? (
          <Button
            variant="destructive"
            iconName="UserX"
            iconPosition="left"
            onClick={() => setShowDeleteAccount(true)}
          >
            Delete Account
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <h4 className="text-sm font-medium text-error mb-2">Account deletion will:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Permanently delete your account and profile</li>
                <li>• Cancel your active subscription immediately</li>
                <li>• Delete all conversations and data</li>
                <li>• Remove access to all paid features</li>
                <li>• Process any applicable refunds per our policy</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Checkbox
                label="I understand that all my data will be permanently deleted"
                checked={deleteAcknowledgments?.dataLoss}
                onChange={(e) => handleDeleteAcknowledgment('dataLoss', e?.target?.checked)}
              />
              
              <Checkbox
                label="I understand my subscription will be cancelled immediately"
                checked={deleteAcknowledgments?.subscriptionCancel}
                onChange={(e) => handleDeleteAcknowledgment('subscriptionCancel', e?.target?.checked)}
              />
              
              <Checkbox
                label="I understand this action is irreversible"
                checked={deleteAcknowledgments?.irreversible}
                onChange={(e) => handleDeleteAcknowledgment('irreversible', e?.target?.checked)}
              />
            </div>

            <Input
              label="Type 'DELETE ACCOUNT' to confirm"
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e?.target?.value)}
              placeholder="DELETE ACCOUNT"
              error={deleteConfirmation && deleteConfirmation !== 'DELETE ACCOUNT' ? 'Please type exactly: DELETE ACCOUNT' : ''}
            />

            <div className="flex items-center space-x-3 pt-4">
              <Button
                variant="destructive"
                loading={isDeleting}
                disabled={!isDeleteReady}
                iconName="UserX"
                iconPosition="left"
                onClick={handleDeleteAccount}
              >
                Delete Account Permanently
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeleteConfirmation('');
                  setDeleteAcknowledgments({
                    dataLoss: false,
                    subscriptionCancel: false,
                    irreversible: false
                  });
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Support Contact */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Need Help?</h3>
          <p className="text-sm text-muted-foreground">
            If you're having issues or need assistance, our support team is here to help.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" iconName="MessageCircle" iconPosition="left">
            Contact Support
          </Button>
          <Button variant="outline" size="sm" iconName="HelpCircle" iconPosition="left">
            Help Center
          </Button>
          <Button variant="outline" size="sm" iconName="FileText" iconPosition="left">
            Privacy Policy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DangerZoneSection;