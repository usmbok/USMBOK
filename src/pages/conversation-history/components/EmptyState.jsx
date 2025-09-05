import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ hasFilters, onClearFilters }) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Search" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No conversations found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          No conversations match your current search criteria. Try adjusting your filters or search terms.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          <Icon name="X" size={16} className="mr-2" />
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="MessageSquare" size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        No conversations yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start your first AI consultation to see your conversation history here. All your saved sessions will appear in this organized view.
      </p>
      <div className="flex items-center justify-center space-x-3">
        <Link to="/domain-selection">
          <Button variant="default">
            <Icon name="Plus" size={16} className="mr-2" />
            Start New Consultation
          </Button>
        </Link>
        <Link to="/user-dashboard">
          <Button variant="outline">
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EmptyState;