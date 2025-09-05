import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ConversationCard from './components/ConversationCard';
import SearchFilters from './components/SearchFilters';
import BulkActions from './components/BulkActions';
import ConversationStats from './components/ConversationStats';
import ViewModeToggle from './components/ViewModeToggle';
import EmptyState from './components/EmptyState';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ConversationHistory = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState(new Set());
  const [showStats, setShowStats] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  
  const [filters, setFilters] = useState({
    domain: '',
    dateFrom: '',
    dateTo: '',
    minCredits: '',
    maxCredits: '',
    sortBy: 'newest'
  });

  // Mock conversation data
  const mockConversations = [
    {
      id: 'conv_001',
      title: 'React Performance Optimization Strategies',
      domain: 'Technology',
      preview: 'Discussed various techniques for optimizing React applications including memoization, code splitting, and virtual DOM optimization...',
      createdAt: '2025-01-28T14:30:00Z',
      messageCount: 24,
      creditsUsed: 145,
      tags: ['react', 'performance', 'optimization']
    },
    {
      id: 'conv_002',
      title: 'Investment Portfolio Risk Assessment',
      domain: 'Finance',
      preview: 'Analyzed portfolio diversification strategies and risk management techniques for long-term investment planning...',
      createdAt: '2025-01-27T09:15:00Z',
      messageCount: 18,
      creditsUsed: 89,
      tags: ['investment', 'risk', 'portfolio']
    },
    {
      id: 'conv_003',
      title: 'Machine Learning Model Deployment',
      domain: 'Technology',
      preview: 'Explored best practices for deploying ML models to production environments using Docker and Kubernetes...',
      createdAt: '2025-01-26T16:45:00Z',
      messageCount: 31,
      creditsUsed: 203,
      tags: ['ml', 'deployment', 'kubernetes']
    },
    {
      id: 'conv_004',
      title: 'Healthcare Data Privacy Compliance',
      domain: 'Healthcare',
      preview: 'Discussed HIPAA compliance requirements and data protection strategies for healthcare applications...',
      createdAt: '2025-01-25T11:20:00Z',
      messageCount: 15,
      creditsUsed: 67,
      tags: ['hipaa', 'privacy', 'compliance']
    },
    {
      id: 'conv_005',
      title: 'Contract Law Fundamentals',
      domain: 'Legal',
      preview: 'Covered essential contract law principles including offer, acceptance, consideration, and breach remedies...',
      createdAt: '2025-01-24T13:10:00Z',
      messageCount: 22,
      creditsUsed: 134,
      tags: ['contract', 'law', 'legal']
    },
    {
      id: 'conv_006',
      title: 'Digital Marketing Analytics Setup',
      domain: 'Marketing',
      preview: 'Implemented comprehensive analytics tracking for digital marketing campaigns using Google Analytics 4...',
      createdAt: '2025-01-23T10:30:00Z',
      messageCount: 19,
      creditsUsed: 98,
      tags: ['analytics', 'marketing', 'ga4']
    },
    {
      id: 'conv_007',
      title: 'Quantum Computing Basics',
      domain: 'Science',
      preview: 'Introduction to quantum computing principles, qubits, and potential applications in cryptography...',
      createdAt: '2025-01-22T15:45:00Z',
      messageCount: 27,
      creditsUsed: 167,
      tags: ['quantum', 'computing', 'physics']
    },
    {
      id: 'conv_008',
      title: 'Educational Technology Integration',
      domain: 'Education',
      preview: 'Strategies for integrating technology in classroom settings to enhance student engagement and learning outcomes...',
      createdAt: '2025-01-21T08:20:00Z',
      messageCount: 16,
      creditsUsed: 78,
      tags: ['edtech', 'classroom', 'integration']
    }
  ];

  const mockFolders = [
    { id: 'folder_1', name: 'Work Projects', count: 12 },
    { id: 'folder_2', name: 'Research', count: 8 },
    { id: 'folder_3', name: 'Learning', count: 15 }
  ];

  const mockStats = {
    totalConversations: 128,
    totalCreditsUsed: 12450,
    thisMonthConversations: 24,
    averageCreditsPerSession: 97.3,
    last7Days: 8,
    last30Days: 24,
    peakDay: 'Monday'
  };

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = mockConversations?.filter(conversation => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery?.toLowerCase();
        const matchesTitle = conversation?.title?.toLowerCase()?.includes(query);
        const matchesPreview = conversation?.preview?.toLowerCase()?.includes(query);
        const matchesTags = conversation?.tags?.some(tag => tag?.toLowerCase()?.includes(query));
        if (!matchesTitle && !matchesPreview && !matchesTags) return false;
      }

      // Domain filter
      if (filters?.domain && conversation?.domain !== filters?.domain) return false;

      // Date filters
      if (filters?.dateFrom) {
        const conversationDate = new Date(conversation.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (conversationDate < fromDate) return false;
      }

      if (filters?.dateTo) {
        const conversationDate = new Date(conversation.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate?.setHours(23, 59, 59, 999);
        if (conversationDate > toDate) return false;
      }

      // Credits filters
      if (filters?.minCredits && conversation?.creditsUsed < parseInt(filters?.minCredits)) return false;
      if (filters?.maxCredits && conversation?.creditsUsed > parseInt(filters?.maxCredits)) return false;

      return true;
    });

    // Sort conversations
    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'mostUsed':
          return b?.creditsUsed - a?.creditsUsed;
        case 'leastUsed':
          return a?.creditsUsed - b?.creditsUsed;
        case 'alphabetical':
          return a?.title?.localeCompare(b?.title);
        case 'mostMessages':
          return b?.messageCount - a?.messageCount;
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [searchQuery, filters]);

  const handleSelectConversation = (conversationId, isSelected) => {
    const newSelected = new Set(selectedConversations);
    if (isSelected) {
      newSelected?.add(conversationId);
    } else {
      newSelected?.delete(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedConversations?.size === filteredConversations?.length) {
      setSelectedConversations(new Set());
    } else {
      setSelectedConversations(new Set(filteredConversations.map(c => c.id)));
    }
  };

  const handleResumeConversation = (conversationId) => {
    navigate('/ai-chat-interface', { state: { resumeConversation: conversationId } });
  };

  const handleExportConversation = (conversationId, format = 'pdf') => {
    console.log(`Exporting conversation ${conversationId} as ${format}`);
    // Mock export functionality
  };

  const handleDuplicateConversation = (conversationId) => {
    console.log(`Duplicating conversation ${conversationId}`);
    // Mock duplicate functionality
  };

  const handleDeleteConversation = (conversationId) => {
    console.log(`Deleting conversation ${conversationId}`);
    // Mock delete functionality
  };

  const handleBulkExport = (format) => {
    console.log(`Bulk exporting ${selectedConversations?.size} conversations as ${format}`);
    setSelectedConversations(new Set());
  };

  const handleBulkDelete = () => {
    console.log(`Bulk deleting ${selectedConversations?.size} conversations`);
    setSelectedConversations(new Set());
  };

  const handleCreateFolder = (folderName) => {
    console.log(`Creating folder: ${folderName}`);
  };

  const handleAddToFolder = (folderId) => {
    console.log(`Adding ${selectedConversations?.size} conversations to folder ${folderId}`);
    setSelectedConversations(new Set());
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      domain: '',
      dateFrom: '',
      dateTo: '',
      minCredits: '',
      maxCredits: '',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = searchQuery || Object.values(filters)?.some(value => 
    value !== '' && value !== 'newest'
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/user-dashboard')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant={showStats ? "default" : "outline"}
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <Icon name="BarChart3" size={16} className="mr-2" />
                Statistics
              </Button>
              
              <Button
                variant="default"
                onClick={() => navigate('/domain-selection')}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                New Consultation
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className={`${showStats ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              {/* Search and Filters */}
              <SearchFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
                isCollapsed={filtersCollapsed}
                onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
              />

              {/* Bulk Actions */}
              <BulkActions
                selectedCount={selectedConversations?.size}
                onExportSelected={handleBulkExport}
                onDeleteSelected={handleBulkDelete}
                onCreateFolder={handleCreateFolder}
                onAddToFolder={handleAddToFolder}
                onClearSelection={() => setSelectedConversations(new Set())}
                folders={mockFolders}
              />

              {/* View Mode Toggle */}
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalCount={mockConversations?.length}
                filteredCount={filteredConversations?.length}
              />

              {/* Select All */}
              {filteredConversations?.length > 0 && (
                <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedConversations?.size === filteredConversations?.length && filteredConversations?.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Select All ({filteredConversations?.length})
                    </span>
                  </label>
                  
                  {selectedConversations?.size > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {selectedConversations?.size} selected
                    </span>
                  )}
                </div>
              )}

              {/* Conversations List */}
              {filteredConversations?.length === 0 ? (
                <EmptyState 
                  hasFilters={hasActiveFilters}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <div className={`space-y-4 ${
                  viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : ''
                }`}>
                  {filteredConversations?.map((conversation) => (
                    <ConversationCard
                      key={conversation?.id}
                      conversation={conversation}
                      isSelected={selectedConversations?.has(conversation?.id)}
                      onSelect={handleSelectConversation}
                      onResume={handleResumeConversation}
                      onExport={handleExportConversation}
                      onDuplicate={handleDuplicateConversation}
                      onDelete={handleDeleteConversation}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Statistics Sidebar */}
            {showStats && (
              <div className="lg:col-span-1">
                <ConversationStats stats={mockStats} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;