import React from 'react';
import Icon from '../AppIcon';

const ActiveSessionIndicator = ({ 
  isActive = false, 
  domain = '', 
  sessionTime = 0, 
  autoSaveStatus = 'saved',
  onResumeSession,
  onSaveSession 
}) => {
  if (!isActive) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <Icon name="Loader2" size={12} className="animate-spin text-warning" />;
      case 'saved':
        return <Icon name="Check" size={12} className="text-success" />;
      case 'error':
        return <Icon name="AlertCircle" size={12} className="text-error" />;
      default:
        return <Icon name="Clock" size={12} className="text-muted-foreground" />;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="flex items-center space-x-3 px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-md">
      {/* Active Session Indicator */}
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse-subtle" />
        <span className="text-sm font-medium text-secondary">Active Session</span>
      </div>

      {/* Domain */}
      {domain && (
        <div className="flex items-center space-x-1">
          <Icon name="Brain" size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{domain}</span>
        </div>
      )}

      {/* Session Time */}
      <div className="flex items-center space-x-1">
        <Icon name="Clock" size={14} className="text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">
          {formatTime(sessionTime)}
        </span>
      </div>

      {/* Auto-save Status */}
      <div className="flex items-center space-x-1">
        {getAutoSaveIcon()}
        <span className="text-xs text-muted-foreground">
          {getAutoSaveText()}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 ml-2">
        {onResumeSession && (
          <button
            onClick={onResumeSession}
            className="p-1 hover:bg-secondary/20 rounded transition-colors"
            title="Resume Session"
          >
            <Icon name="Play" size={14} className="text-secondary" />
          </button>
        )}
        {onSaveSession && (
          <button
            onClick={onSaveSession}
            className="p-1 hover:bg-secondary/20 rounded transition-colors"
            title="Save Session"
          >
            <Icon name="Save" size={14} className="text-secondary" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveSessionIndicator;