import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import DomainCard from './components/DomainCard';
import DomainFilters from './components/DomainFilters';
import CreditBalanceCard from './components/CreditBalanceCard';
import CrossDomainSearch from './components/CrossDomainSearch';
import RecentDomainsSection from './components/RecentDomainsSection';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const DomainSelection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCostRange, setSelectedCostRange] = useState('all');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [userCredits] = useState(2450);

  // Mock domains data
  const domains = [
    {
      id: 'legal',
      title: 'Legal Advisory',
      description: 'Expert legal guidance on contracts, compliance, intellectual property, and regulatory matters.',
      icon: 'Scale',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      category: 'professional',
      estimatedCost: 120,
      useCases: [
        'Contract review and analysis',
        'Intellectual property guidance',
        'Compliance and regulatory advice',
        'Legal document drafting assistance'
      ]
    },
    {
      id: 'medical',
      title: 'Medical & Healthcare',
      description: 'Medical information, healthcare guidance, and clinical decision support for professionals.',
      icon: 'Heart',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      category: 'healthcare',
      estimatedCost: 100,
      useCases: [
        'Clinical decision support',
        'Medical literature review',
        'Drug interaction analysis',
        'Healthcare policy guidance'
      ]
    },
    {
      id: 'finance',
      title: 'Financial Analysis',
      description: 'Investment strategies, financial planning, market analysis, and economic insights.',
      icon: 'TrendingUp',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      category: 'business',
      estimatedCost: 110,
      useCases: [
        'Investment portfolio analysis',
        'Financial risk assessment',
        'Market trend analysis',
        'Budget planning and forecasting'
      ]
    },
    {
      id: 'technology',
      title: 'Technology & Engineering',
      description: 'Software development, system architecture, cybersecurity, and technical problem-solving.',
      icon: 'Code',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      category: 'technology',
      estimatedCost: 90,
      useCases: [
        'Code review and optimization',
        'System architecture design',
        'Cybersecurity best practices',
        'Technical troubleshooting'
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing & Strategy',
      description: 'Brand strategy, digital marketing, customer insights, and campaign optimization.',
      icon: 'Target',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      category: 'business',
      estimatedCost: 85,
      useCases: [
        'Brand positioning strategy',
        'Digital marketing campaigns',
        'Customer segmentation analysis',
        'Content marketing planning'
      ]
    },
    {
      id: 'research',
      title: 'Research & Analytics',
      description: 'Academic research, data analysis, statistical modeling, and scientific methodology.',
      icon: 'BarChart3',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      category: 'academic',
      estimatedCost: 95,
      useCases: [
        'Literature review and synthesis',
        'Statistical analysis guidance',
        'Research methodology design',
        'Data interpretation support'
      ]
    },
    {
      id: 'education',
      title: 'Education & Training',
      description: 'Curriculum development, learning strategies, educational technology, and training programs.',
      icon: 'GraduationCap',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      category: 'academic',
      estimatedCost: 75,
      useCases: [
        'Curriculum design and development',
        'Learning assessment strategies',
        'Educational technology integration',
        'Training program optimization'
      ]
    },
    {
      id: 'hr',
      title: 'Human Resources',
      description: 'Talent management, organizational development, employee relations, and HR policies.',
      icon: 'Users',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      category: 'professional',
      estimatedCost: 80,
      useCases: [
        'Talent acquisition strategies',
        'Performance management systems',
        'Employee engagement programs',
        'HR policy development'
      ]
    }
  ];

  // Mock recent domains
  const recentDomains = [
    { ...domains?.[0], lastUsed: '2 hours ago' },
    { ...domains?.[3], lastUsed: 'Yesterday' },
    { ...domains?.[1], lastUsed: '3 days ago' }
  ];

  // Filter options
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'academic', label: 'Academic' },
    { value: 'professional', label: 'Professional' }
  ];

  const costRanges = [
    { value: 'all', label: 'All Cost Ranges' },
    { value: 'low', label: 'Low (50-80 credits)' },
    { value: 'medium', label: 'Medium (81-100 credits)' },
    { value: 'high', label: 'High (101+ credits)' }
  ];

  // Popular domains (based on usage)
  const popularDomainIds = ['legal', 'technology', 'finance'];

  // Filter domains based on search and filters
  const filteredDomains = domains?.filter(domain => {
    const matchesSearch = domain?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         domain?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         domain?.useCases?.some(useCase => useCase?.toLowerCase()?.includes(searchQuery?.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || domain?.category === selectedCategory;
    
    const matchesCostRange = selectedCostRange === 'all' || 
                            (selectedCostRange === 'low' && domain?.estimatedCost <= 80) ||
                            (selectedCostRange === 'medium' && domain?.estimatedCost > 80 && domain?.estimatedCost <= 100) ||
                            (selectedCostRange === 'high' && domain?.estimatedCost > 100);

    return matchesSearch && matchesCategory && matchesCostRange;
  });

  // Calculate estimated consultations based on average cost
  const averageCost = domains?.reduce((sum, domain) => sum + domain?.estimatedCost, 0) / domains?.length;
  const estimatedConsultations = Math.floor(userCredits / averageCost);

  const handleStartConsultation = (domain) => {
    // Navigate to AI chat interface with selected domain
    navigate('/ai-chat-interface', { 
      state: { 
        selectedDomain: domain,
        domainContext: true 
      } 
    });
  };

  const handleStartCrossDomainChat = (query) => {
    // Navigate to AI chat interface with cross-domain search
    navigate('/ai-chat-interface', { 
      state: { 
        crossDomainQuery: query,
        crossDomainMode: true 
      } 
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCostRange('all');
  };

  const handleToggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Icon name="Brain" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Choose Your AI Assistant</h1>
                <p className="text-muted-foreground">Select a specialized domain for targeted knowledge consultation</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Credit Balance Card */}
              <CreditBalanceCard 
                credits={userCredits}
                estimatedConsultations={estimatedConsultations}
              />

              {/* Cross-Domain Search */}
              <CrossDomainSearch 
                onStartCrossDomainChat={handleStartCrossDomainChat}
                userCredits={userCredits}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Recent Domains */}
              <RecentDomainsSection 
                recentDomains={recentDomains}
                onStartConsultation={handleStartConsultation}
                userCredits={userCredits}
              />

              {/* Filters */}
              <DomainFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedCostRange={selectedCostRange}
                onCostRangeChange={setSelectedCostRange}
                onClearFilters={handleClearFilters}
                categories={categories}
                costRanges={costRanges}
                isMobileFiltersOpen={isMobileFiltersOpen}
                onToggleMobileFilters={handleToggleMobileFilters}
              />

              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Available Domains
                    {searchQuery && (
                      <span className="text-muted-foreground"> for "{searchQuery}"</span>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredDomains?.length} domain{filteredDomains?.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>

              {/* Domain Cards Grid */}
              {filteredDomains?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDomains?.map((domain) => (
                    <DomainCard
                      key={domain?.id}
                      domain={domain}
                      onStartConsultation={handleStartConsultation}
                      isPopular={popularDomainIds?.includes(domain?.id)}
                      userCredits={userCredits}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Search" size={24} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No domains found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DomainSelection;