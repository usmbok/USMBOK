import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentConversationsPanel = ({ conversations }) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const conversationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - conversationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getDomainIcon = (domain) => {
    const iconMap = {
      'Technology': 'Cpu',
      'Healthcare': 'Heart',
      'Finance': 'DollarSign',
      'Legal': 'Scale',
      'Marketing': 'TrendingUp',
      'Education': 'GraduationCap',
      'Research': 'Search',
      'Business': 'Briefcase'
    };
    return iconMap?.[domain] || 'Brain';
  };

  const truncateTitle = (title, maxLength = 50) => {
    return title?.length > maxLength ? `${title?.substring(0, maxLength)}...` : title;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Recent Conversations</h3>
          <p className="text-sm text-muted-foreground">Continue where you left off</p>
        </div>
        <Link to="/conversation-history">
          <Button variant="ghost" size="sm" iconName="History" iconPosition="left">
            View All
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {conversations?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageSquare" size={24} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">No conversations yet</p>
            <Link to="/domain-selection">
              <Button variant="outline" iconName="Plus" iconPosition="left">
                Start Your First Chat
              </Button>
            </Link>
          </div>
        ) : (
          conversations?.map((conversation) => (
            <div
              key={conversation?.id}
              className="group flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon 
                    name={getDomainIcon(conversation?.domain)} 
                    size={16} 
                    className="text-primary"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors truncate">
                    {truncateTitle(conversation?.title)}
                  </h4>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {formatTimeAgo(conversation?.lastActivity)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {conversation?.domain}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {conversation?.messageCount} messages
                  </span>
                  {conversation?.creditsUsed > 0 && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center space-x-1">
                        <Icon name="Coins" size={10} className="text-accent" />
                        <span className="text-xs text-muted-foreground">
                          {conversation?.creditsUsed}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/ai-chat-interface?conversation=${conversation?.id}`}>
                  <Button variant="ghost" size="sm" iconName="ArrowRight" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentConversationsPanel;