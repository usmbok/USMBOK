import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const SearchFilters = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFiltersChange, 
  onClearFilters,
  isCollapsed = false,
  onToggleCollapse 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const domainOptions = [
    { value: '', label: 'All Domains' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Legal', label: 'Legal' },
    { value: 'Education', label: 'Education' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Science', label: 'Science' },
    { value: 'General', label: 'General' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'mostUsed', label: 'Most Credits Used' },
    { value: 'leastUsed', label: 'Least Credits Used' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'mostMessages', label: 'Most Messages' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      domain: '',
      dateFrom: '',
      dateTo: '',
      minCredits: '',
      maxCredits: '',
      sortBy: 'newest'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(localFilters)?.some(value => 
    value !== '' && value !== 'newest'
  ) || searchQuery;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="search"
              placeholder="Search conversations, keywords, or content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Mobile Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="md:hidden"
        >
          <Icon name={isCollapsed ? "ChevronDown" : "ChevronUp"} size={16} />
        </Button>
      </div>
      {/* Filters */}
      <div className={`space-y-4 ${isCollapsed ? 'hidden md:block' : 'block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Domain"
            options={domainOptions}
            value={localFilters?.domain}
            onChange={(value) => handleFilterChange('domain', value)}
          />

          <Input
            label="From Date"
            type="date"
            value={localFilters?.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
          />

          <Input
            label="To Date"
            type="date"
            value={localFilters?.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
          />

          <Select
            label="Sort By"
            options={sortOptions}
            value={localFilters?.sortBy}
            onChange={(value) => handleFilterChange('sortBy', value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Min Credits Used"
            type="number"
            placeholder="0"
            value={localFilters?.minCredits}
            onChange={(e) => handleFilterChange('minCredits', e?.target?.value)}
          />

          <Input
            label="Max Credits Used"
            type="number"
            placeholder="1000"
            value={localFilters?.maxCredits}
            onChange={(e) => handleFilterChange('maxCredits', e?.target?.value)}
          />
        </div>

        {/* Filter Actions */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Active filters applied
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
            >
              <Icon name="X" size={16} className="mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;