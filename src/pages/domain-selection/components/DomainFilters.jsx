import React from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DomainFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCostRange,
  onCostRangeChange,
  onClearFilters,
  categories,
  costRanges,
  isMobileFiltersOpen,
  onToggleMobileFilters
}) => {
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedCostRange !== 'all';

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Filter Domains</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <Input
            type="search"
            placeholder="Search domains..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="w-full"
          />

          {/* Category Filter */}
          <Select
            placeholder="All Categories"
            options={categories}
            value={selectedCategory}
            onChange={onCategoryChange}
          />

          {/* Cost Range Filter */}
          <Select
            placeholder="All Cost Ranges"
            options={costRanges}
            value={selectedCostRange}
            onChange={onCostRangeChange}
          />
        </div>
      </div>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          fullWidth
          onClick={onToggleMobileFilters}
          iconName={isMobileFiltersOpen ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
        >
          Filters {hasActiveFilters && `(${[searchQuery, selectedCategory !== 'all', selectedCostRange !== 'all']?.filter(Boolean)?.length})`}
        </Button>
      </div>
      {/* Mobile Filters Dropdown */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-card-foreground">Filter Options</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                iconName="X"
                iconPosition="left"
              >
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Mobile Search */}
            <Input
              type="search"
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e?.target?.value)}
            />

            {/* Mobile Category Filter */}
            <Select
              label="Category"
              placeholder="All Categories"
              options={categories}
              value={selectedCategory}
              onChange={onCategoryChange}
            />

            {/* Mobile Cost Range Filter */}
            <Select
              label="Cost Range"
              placeholder="All Cost Ranges"
              options={costRanges}
              value={selectedCostRange}
              onChange={onCostRangeChange}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DomainFilters;