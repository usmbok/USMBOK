import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CreditBalanceIndicator from '../../../components/ui/CreditBalanceIndicator';

const ChatHeader = ({ 
  selectedDomain, 
  credits, 
  conversationTitle,
  onNewChat,
  onSaveConversation,
  onExportConversation,
  isSaving = false
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-surface border-b border-border">
      {/* Left Section - Domain Info */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/domain-selection"
          className="flex items-center space-x-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
        >
          <Icon name="Brain" size={18} className="text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{selectedDomain?.name}</span>
            <span className="text-xs text-muted-foreground">{selectedDomain?.category}</span>
          </div>
          <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
        </Link>
        
        {conversationTitle && (
          <div className="hidden md:flex items-center space-x-2">
            <Icon name="MessageSquare" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground max-w-48 truncate">
              {conversationTitle}
            </span>
          </div>
        )}
      </div>
      {/* Right Section - Controls */}
      <div className="flex items-center space-x-3">
        {/* Credit Balance */}
        <CreditBalanceIndicator credits={credits} />

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="hidden sm:flex"
            iconName="Plus"
            iconPosition="left"
          >
            New Chat
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveConversation}
            loading={isSaving}
            iconName="Save"
            className="hidden sm:flex"
          >
            Save
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportConversation}
            iconName="Download"
            className="hidden sm:flex"
          >
            Export
          </Button>

          {/* Mobile Menu */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              iconName="MoreVertical"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;