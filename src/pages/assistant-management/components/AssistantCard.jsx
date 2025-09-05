import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AssistantCard = ({ 
  assistant, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'technology': return 'Code';
      case 'business': return 'Briefcase';
      case 'finance': return 'DollarSign';
      case 'marketing': return 'TrendingUp';
      default: return 'Bot';
    }
  };

  const getDomainColor = (domain) => {
    switch (domain) {
      case 'technology': return 'bg-blue-500';
      case 'business': return 'bg-green-500';
      case 'finance': return 'bg-yellow-500';
      case 'marketing': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`bg-card border rounded-lg p-6 hover:shadow-md transition-all ${
      isSelected ? 'ring-2 ring-primary' : 'border-border'
    }`}>
      {/* Header with selection */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="rounded border-border"
            checked={isSelected}
            onChange={onSelect}
          />
          <div className={`w-12 h-12 ${getDomainColor(assistant?.domain)} rounded-full flex items-center justify-center`}>
            <Icon name={getDomainIcon(assistant?.domain)} size={24} className="text-white" />
          </div>
        </div>
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
          assistant?.is_active 
            ? 'bg-success/10 text-success' :'bg-error/10 text-error'
        }`}>
          {assistant?.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Assistant Info */}
      <div className="mb-4">
        <h3 className="font-semibold text-foreground mb-1">{assistant?.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {assistant?.description}
        </p>
        
        {/* Knowledge Bank */}
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="BookOpen" size={14} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {assistant?.knowledge_bank}
          </span>
        </div>

        {/* Domain */}
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Tag" size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground capitalize">
            {assistant?.domain}
          </span>
        </div>

        {/* OpenAI Assistant ID */}
        {assistant?.openai_assistant_id && (
          <div className="flex items-center space-x-2">
            <Icon name="Zap" size={14} className="text-accent" />
            <span className="text-xs font-mono text-muted-foreground">
              {assistant?.openai_assistant_id}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-md">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {assistant?.credits_per_message || 10}
          </div>
          <div className="text-xs text-muted-foreground">Credits/msg</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {Math.floor(Math.random() * 1000) + 100}
          </div>
          <div className="text-xs text-muted-foreground">Total Uses</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Edit"
          onClick={onEdit}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconName="Trash2"
          onClick={onDelete}
          className="text-error hover:text-error"
        />
      </div>
    </div>
  );
};

export default AssistantCard;