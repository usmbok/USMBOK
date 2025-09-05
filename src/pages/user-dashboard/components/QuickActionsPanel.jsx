import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const QuickActionsPanel = ({ onNewConversation, onBuyCredits, onViewHistory }) => {
  const quickActions = [
    {
      id: 'new-chat',
      title: 'Start New Chat',
      description: 'Begin a conversation with an AI assistant',
      icon: 'MessageSquarePlus',
      color: 'text-primary bg-primary/10',
      action: onNewConversation,
      link: '/domain-selection'
    },
    {
      id: 'buy-credits',
      title: 'Buy Credits',
      description: 'Purchase additional credits for consultations',
      icon: 'CreditCard',
      color: 'text-success bg-success/10',
      action: onBuyCredits,
      link: '/credit-management'
    },
    {
      id: 'view-history',
      title: 'View History',
      description: 'Browse your past conversations',
      icon: 'History',
      color: 'text-secondary bg-secondary/10',
      action: onViewHistory,
      link: '/conversation-history'
    },
    {
      id: 'account-settings',
      title: 'Account Settings',
      description: 'Manage your profile and preferences',
      icon: 'Settings',
      color: 'text-muted-foreground bg-muted',
      action: null,
      link: '/account-settings'
    }
  ];

  const handleActionClick = (action, link) => {
    if (action) {
      action();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon name="Zap" size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Common tasks and shortcuts</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions?.map((action) => (
          <Link
            key={action?.id}
            to={action?.link}
            onClick={() => handleActionClick(action?.action, action?.link)}
            className="group block"
          >
            <div className="p-4 border border-border rounded-lg hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${action?.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon name={action?.icon} size={20} className={action?.color?.split(' ')?.[0]} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                    {action?.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {action?.description}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {/* Additional Quick Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-card-foreground">24</div>
            <p className="text-xs text-muted-foreground">Total Chats</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-card-foreground">8</div>
            <p className="text-xs text-muted-foreground">Domains Used</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-card-foreground">156</div>
            <p className="text-xs text-muted-foreground">Saved Prompts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;