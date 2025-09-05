import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConversationCard = ({ 
  conversation, 
  isSelected, 
  onSelect, 
  onResume, 
  onExport, 
  onDuplicate, 
  onDelete,
  viewMode = 'list' 
}) => {
  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDomainIcon = (domain) => {
    const iconMap = {
      'Technology': 'Cpu',
      'Healthcare': 'Heart',
      'Finance': 'DollarSign',
      'Legal': 'Scale',
      'Education': 'GraduationCap',
      'Marketing': 'TrendingUp',
      'Science': 'Atom',
      'General': 'MessageSquare'
    };
    return iconMap?.[domain] || 'MessageSquare';
  };

  const getDomainColor = (domain) => {
    const colorMap = {
      'Technology': 'text-blue-600 bg-blue-50',
      'Healthcare': 'text-red-600 bg-red-50',
      'Finance': 'text-green-600 bg-green-50',
      'Legal': 'text-purple-600 bg-purple-50',
      'Education': 'text-indigo-600 bg-indigo-50',
      'Marketing': 'text-orange-600 bg-orange-50',
      'Science': 'text-teal-600 bg-teal-50',
      'General': 'text-gray-600 bg-gray-50'
    };
    return colorMap?.[domain] || 'text-gray-600 bg-gray-50';
  };

  if (viewMode === 'card') {
    return (
      <div className={`bg-card border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(conversation?.id, e?.target?.checked)}
              className="rounded border-border"
            />
            <div className={`p-1.5 rounded-md ${getDomainColor(conversation?.domain)}`}>
              <Icon name={getDomainIcon(conversation?.domain)} size={16} />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="xs" onClick={() => onResume(conversation?.id)}>
              <Icon name="Play" size={14} />
            </Button>
            <Button variant="ghost" size="xs" onClick={() => onExport(conversation?.id)}>
              <Icon name="Download" size={14} />
            </Button>
            <Button variant="ghost" size="xs" onClick={() => onDelete(conversation?.id)}>
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        </div>
        <h3 className="font-medium text-foreground mb-2 line-clamp-2">
          {conversation?.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {conversation?.preview}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(conversation?.createdAt)}</span>
          <div className="flex items-center space-x-3">
            <span>{conversation?.messageCount} messages</span>
            <span className="font-mono">{conversation?.creditsUsed} credits</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-sm ${
      isSelected ? 'ring-2 ring-primary border-primary' : ''
    }`}>
      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(conversation?.id, e?.target?.checked)}
          className="rounded border-border"
        />

        <div className={`p-2 rounded-md ${getDomainColor(conversation?.domain)}`}>
          <Icon name={getDomainIcon(conversation?.domain)} size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground mb-1 truncate">
                {conversation?.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {conversation?.preview}
              </p>
            </div>

            <div className="flex items-center space-x-4 ml-4">
              <div className="text-right">
                <div className="text-sm text-foreground">{formatDate(conversation?.createdAt)}</div>
                <div className="text-xs text-muted-foreground">
                  {conversation?.messageCount} messages • {conversation?.creditsUsed} credits
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" onClick={() => onResume(conversation?.id)}>
                  <Icon name="Play" size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onExport(conversation?.id)}>
                  <Icon name="Download" size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDuplicate(conversation?.id)}>
                  <Icon name="Copy" size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(conversation?.id)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;