import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const PreferencesSection = () => {
  const [preferences, setPreferences] = useState({
    defaultDomain: 'general',
    autoSaveConversations: true,
    autoSaveInterval: '30',
    showTokenCount: true,
    enableKeyboardShortcuts: true,
    compactMode: false,
    darkMode: false,
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    exportFormat: 'json',
    maxConversationHistory: '100',
    enableAnalytics: true,
    shareUsageData: false
  });

  const [isSaving, setIsSaving] = useState(false);

  const domainOptions = [
    { value: 'general', label: 'General Knowledge' },
    { value: 'technology', label: 'Technology & Programming' },
    { value: 'business', label: 'Business & Finance' },
    { value: 'science', label: 'Science & Research' },
    { value: 'healthcare', label: 'Healthcare & Medicine' },
    { value: 'legal', label: 'Legal & Compliance' },
    { value: 'education', label: 'Education & Training' },
    { value: 'creative', label: 'Creative & Design' }
  ];

  const autoSaveIntervalOptions = [
    { value: '15', label: 'Every 15 seconds' },
    { value: '30', label: 'Every 30 seconds' },
    { value: '60', label: 'Every minute' },
    { value: '300', label: 'Every 5 minutes' },
    { value: 'manual', label: 'Manual save only' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY' }
  ];

  const timeFormatOptions = [
    { value: '12', label: '12-hour (AM/PM)' },
    { value: '24', label: '24-hour' }
  ];

  const exportFormatOptions = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
    { value: 'txt', label: 'Plain Text' },
    { value: 'pdf', label: 'PDF' },
    { value: 'markdown', label: 'Markdown' }
  ];

  const historyLimitOptions = [
    { value: '50', label: '50 conversations' },
    { value: '100', label: '100 conversations' },
    { value: '250', label: '250 conversations' },
    { value: '500', label: '500 conversations' },
    { value: 'unlimited', label: 'Unlimited' }
  ];

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Preferences saved:', preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPreferences({
      defaultDomain: 'general',
      autoSaveConversations: true,
      autoSaveInterval: '30',
      showTokenCount: true,
      enableKeyboardShortcuts: true,
      compactMode: false,
      darkMode: false,
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      exportFormat: 'json',
      maxConversationHistory: '100',
      enableAnalytics: true,
      shareUsageData: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Interface Preferences */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Interface Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Customize your application interface and behavior
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Default AI Domain"
              options={domainOptions}
              value={preferences?.defaultDomain}
              onChange={(value) => handlePreferenceChange('defaultDomain', value)}
              description="The domain that opens by default when starting a new conversation"
            />
            
            <Select
              label="Language"
              options={languageOptions}
              value={preferences?.language}
              onChange={(value) => handlePreferenceChange('language', value)}
              description="Interface language preference"
            />
          </div>

          <div className="space-y-4">
            <Checkbox
              label="Show token count in real-time"
              description="Display the number of tokens used during conversations"
              checked={preferences?.showTokenCount}
              onChange={(e) => handlePreferenceChange('showTokenCount', e?.target?.checked)}
            />
            
            <Checkbox
              label="Enable keyboard shortcuts"
              description="Use keyboard shortcuts for common actions (Ctrl+Enter to send, etc.)"
              checked={preferences?.enableKeyboardShortcuts}
              onChange={(e) => handlePreferenceChange('enableKeyboardShortcuts', e?.target?.checked)}
            />
            
            <Checkbox
              label="Compact mode"
              description="Reduce spacing and use a more condensed layout"
              checked={preferences?.compactMode}
              onChange={(e) => handlePreferenceChange('compactMode', e?.target?.checked)}
            />
            
            <Checkbox
              label="Dark mode"
              description="Use dark theme for the interface"
              checked={preferences?.darkMode}
              onChange={(e) => handlePreferenceChange('darkMode', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Conversation Settings */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Conversation Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure how conversations are saved and managed
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Checkbox
              label="Auto-save conversations"
              description="Automatically save conversations as you chat"
              checked={preferences?.autoSaveConversations}
              onChange={(e) => handlePreferenceChange('autoSaveConversations', e?.target?.checked)}
            />
            
            {preferences?.autoSaveConversations && (
              <div className="ml-6">
                <Select
                  label="Auto-save interval"
                  options={autoSaveIntervalOptions}
                  value={preferences?.autoSaveInterval}
                  onChange={(value) => handlePreferenceChange('autoSaveInterval', value)}
                  description="How frequently to auto-save conversations"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Export format"
              options={exportFormatOptions}
              value={preferences?.exportFormat}
              onChange={(value) => handlePreferenceChange('exportFormat', value)}
              description="Default format for exporting conversations"
            />
            
            <Select
              label="Conversation history limit"
              options={historyLimitOptions}
              value={preferences?.maxConversationHistory}
              onChange={(value) => handlePreferenceChange('maxConversationHistory', value)}
              description="Maximum number of conversations to keep"
            />
          </div>
        </div>
      </div>
      {/* Date & Time Format */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Date & Time Format</h3>
          <p className="text-sm text-muted-foreground">
            Customize how dates and times are displayed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Date format"
            options={dateFormatOptions}
            value={preferences?.dateFormat}
            onChange={(value) => handlePreferenceChange('dateFormat', value)}
            description="How dates are displayed throughout the app"
          />
          
          <Select
            label="Time format"
            options={timeFormatOptions}
            value={preferences?.timeFormat}
            onChange={(value) => handlePreferenceChange('timeFormat', value)}
            description="12-hour or 24-hour time format"
          />
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium text-card-foreground mb-1">Preview</p>
          <p className="text-sm text-muted-foreground">
            {new Date()?.toLocaleDateString('en-US', {
              year: 'numeric',
              month: preferences?.dateFormat?.includes('MMM') ? 'short' : '2-digit',
              day: '2-digit'
            })} at {new Date()?.toLocaleTimeString('en-US', {
              hour12: preferences?.timeFormat === '12',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      {/* Privacy & Analytics */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Privacy & Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Control data collection and analytics preferences
          </p>
        </div>

        <div className="space-y-4">
          <Checkbox
            label="Enable usage analytics"
            description="Help improve the service by sharing anonymous usage data"
            checked={preferences?.enableAnalytics}
            onChange={(e) => handlePreferenceChange('enableAnalytics', e?.target?.checked)}
          />
          
          <Checkbox
            label="Share usage data for research"
            description="Allow anonymized conversation data to be used for AI research (optional)"
            checked={preferences?.shareUsageData}
            onChange={(e) => handlePreferenceChange('shareUsageData', e?.target?.checked)}
          />
        </div>

        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Shield" size={16} className="text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Privacy Notice</p>
              <p className="text-xs text-muted-foreground mt-1">
                All data sharing is completely anonymous and can be disabled at any time. 
                Your personal information and conversation content are never shared.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={resetToDefaults}
        >
          Reset to Defaults
        </Button>
        
        <Button
          variant="default"
          loading={isSaving}
          iconName="Save"
          iconPosition="left"
          onClick={handleSavePreferences}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default PreferencesSection;