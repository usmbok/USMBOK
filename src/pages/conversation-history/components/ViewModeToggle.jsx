import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ViewModeToggle = ({ viewMode, onViewModeChange, totalCount, filteredCount }) => {
  const viewModes = [
    { value: 'list', icon: 'List', label: 'List View' },
    { value: 'card', icon: 'Grid3X3', label: 'Card View' }
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-foreground">
          Conversation History
        </h2>
        <div className="text-sm text-muted-foreground">
          {filteredCount !== totalCount ? (
            <span>
              Showing {filteredCount} of {totalCount} conversations
            </span>
          ) : (
            <span>{totalCount} conversations</span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-muted rounded-md p-1">
          {viewModes?.map((mode) => (
            <Button
              key={mode?.value}
              variant={viewMode === mode?.value ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange(mode?.value)}
              className="px-3 py-1.5"
            >
              <Icon name={mode?.icon} size={16} className="mr-1" />
              <span className="hidden sm:inline">{mode?.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewModeToggle;