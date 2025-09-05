import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AssistantOverviewCard = ({ assistants = {} }) => {
  const navigate = useNavigate();
  const { total = 0, active = 0, inactive = 0, totalUsage = 0 } = assistants;

  const handleManageAssistants = () => {
    navigate('/assistant-management');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">AI Assistants</h2>
          <p className="text-sm text-muted-foreground">Assistant status and performance overview</p>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          iconName="Bot"
          onClick={handleManageAssistants}
        >
          Manage Assistants
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Bot" size={16} className="text-primary" />
          </div>
          <div className="text-lg font-semibold text-foreground">{total}</div>
          <div className="text-xs text-muted-foreground">Total Assistants</div>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Play" size={16} className="text-success" />
          </div>
          <div className="text-lg font-semibold text-foreground">{active}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Pause" size={16} className="text-warning" />
          </div>
          <div className="text-lg font-semibold text-foreground">{inactive}</div>
          <div className="text-xs text-muted-foreground">Inactive</div>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="MessageSquare" size={16} className="text-accent" />
          </div>
          <div className="text-lg font-semibold text-foreground">{totalUsage?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Interactions</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-success/10 rounded-md flex items-center justify-center">
              <Icon name="CheckCircle" size={16} className="text-success" />
            </div>
            <div>
              <div className="font-medium text-foreground">Knowledge Base Status</div>
              <div className="text-sm text-muted-foreground">All 12 knowledge banks active</div>
            </div>
          </div>
          <div className="text-sm font-medium text-success">100%</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Icon name="Zap" size={16} className="text-primary" />
            </div>
            <div>
              <div className="font-medium text-foreground">OpenAI Integration</div>
              <div className="text-sm text-muted-foreground">Assistant IDs configured</div>
            </div>
          </div>
          <div className="text-sm font-medium text-success">Ready</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent/10 rounded-md flex items-center justify-center">
              <Icon name="Activity" size={16} className="text-accent" />
            </div>
            <div>
              <div className="font-medium text-foreground">Performance</div>
              <div className="text-sm text-muted-foreground">Average response time</div>
            </div>
          </div>
          <div className="text-sm font-medium text-success">1.2s</div>
        </div>
      </div>
    </div>
  );
};

export default AssistantOverviewCard;