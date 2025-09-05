import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CrossDomainSearch = ({ onStartCrossDomainChat, userCredits = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const crossDomainCost = 150; // Higher cost for cross-domain search
  const canAfford = userCredits >= crossDomainCost;

  const handleStartSearch = () => {
    if (searchQuery?.trim() && canAfford) {
      onStartCrossDomainChat(searchQuery?.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && searchQuery?.trim() && canAfford) {
      handleStartSearch();
    }
  };

  return (
    <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
            <Icon name="Search" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Cross-Domain Search</h3>
            <p className="text-sm text-muted-foreground">Search across all knowledge domains</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      {isExpanded && (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Ask a question across all domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              onKeyPress={handleKeyPress}
              disabled={!canAfford}
            />
            <p className="text-xs text-muted-foreground">
              Example: "What are the legal implications of AI in healthcare from both legal and medical perspectives?"
            </p>
          </div>

          {/* Cost Information */}
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-md">
            <div className="flex items-center space-x-2">
              <Icon name="Coins" size={16} className="text-accent" />
              <span className="text-sm font-medium text-card-foreground">Premium Cost</span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-mono font-medium ${canAfford ? 'text-success' : 'text-error'}`}>
                {crossDomainCost} credits
              </span>
              <p className="text-xs text-muted-foreground">per search</p>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm text-card-foreground">Multi-domain analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm text-card-foreground">Comprehensive insights</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm text-card-foreground">Cross-referenced answers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm text-card-foreground">Expert-level responses</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant={canAfford ? "secondary" : "outline"}
            fullWidth
            disabled={!searchQuery?.trim() || !canAfford}
            onClick={handleStartSearch}
            iconName="Search"
            iconPosition="left"
          >
            {canAfford ? 'Start Cross-Domain Search' : 'Insufficient Credits'}
          </Button>

          {/* Insufficient Credits Warning */}
          {!canAfford && (
            <div className="flex items-center space-x-2 p-3 bg-error/10 rounded-md">
              <Icon name="AlertCircle" size={16} className="text-error" />
              <span className="text-sm text-error">
                Need {crossDomainCost - userCredits} more credits for cross-domain search
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CrossDomainSearch;