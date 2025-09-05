import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ExportDialog = ({ users, onClose }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState({
    full_name: true,
    email: true,
    role: true,
    is_active: true,
    created_at: true,
    credit_balance: true,
    subscription_plan: true
  });
  const [exporting, setExporting] = useState(false);

  const availableFields = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'role', label: 'User Role' },
    { key: 'is_active', label: 'Account Status' },
    { key: 'created_at', label: 'Registration Date' },
    { key: 'credit_balance', label: 'Credit Balance' },
    { key: 'subscription_plan', label: 'Subscription Plan' }
  ];

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev?.[fieldKey]
    }));
  };

  const formatUserData = (user) => {
    const data = {};
    
    if (selectedFields?.full_name) data['Full Name'] = user?.full_name || '';
    if (selectedFields?.email) data['Email'] = user?.email || '';
    if (selectedFields?.role) data['Role'] = user?.role || '';
    if (selectedFields?.is_active) data['Status'] = user?.is_active ? 'Active' : 'Inactive';
    if (selectedFields?.created_at) data['Registered'] = user?.created_at ? new Date(user.created_at)?.toLocaleDateString() : '';
    if (selectedFields?.credit_balance) data['Credits'] = user?.user_credits?.[0]?.balance || 0;
    if (selectedFields?.subscription_plan) data['Subscription'] = user?.user_subscriptions?.[0]?.plan || 'free';
    
    return data;
  };

  const generateCSV = (data) => {
    if (data?.length === 0) return '';
    
    const headers = Object.keys(data?.[0]);
    const csvContent = [
      headers?.join(','),
      ...data?.map(row => 
        headers?.map(header => {
          const value = row?.[header]?.toString() || '';
          // Escape commas and quotes
          return value?.includes(',') || value?.includes('"') 
            ? `"${value?.replace(/"/g, '""')}"` 
            : value;
        })?.join(',')
      )
    ]?.join('\n');
    
    return csvContent;
  };

  const generateJSON = (data) => {
    return JSON.stringify(data, null, 2);
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const formattedData = users?.map(formatUserData);
      let content, mimeType, filename;
      
      switch (exportFormat) {
        case 'csv':
          content = generateCSV(formattedData);
          mimeType = 'text/csv';
          filename = `users_export_${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
          break;
        case 'json':
          content = generateJSON(formattedData);
          mimeType = 'application/json';
          filename = `users_export_${new Date()?.toISOString()?.split('T')?.[0]}.json`;
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL?.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
      window.URL?.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const selectedFieldCount = Object.values(selectedFields)?.filter(Boolean)?.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name="Download" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Export Users</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} iconName="X" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Export Format
            </label>
            <Select
              value={exportFormat}
              onValueChange={setExportFormat}
              options={[
                { value: 'csv', label: 'CSV (Excel Compatible)' },
                { value: 'json', label: 'JSON (Developer Friendly)' }
              ]}
            />
          </div>

          {/* Field Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Fields to Include ({selectedFieldCount} selected)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableFields?.map((field) => (
                <div key={field?.key} className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedFields?.[field?.key]}
                    onCheckedChange={() => handleFieldToggle(field?.key)}
                  />
                  <span className="text-sm text-foreground">{field?.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Users to export:</span>
              <span className="font-medium text-foreground">{users?.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fields included:</span>
              <span className="font-medium text-foreground">{selectedFieldCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium text-foreground uppercase">{exportFormat}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={selectedFieldCount === 0 || exporting}
            iconName={exporting ? "Loader2" : "Download"}
          >
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;