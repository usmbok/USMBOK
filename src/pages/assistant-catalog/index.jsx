import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Header from '../../components/ui/Header';
import { supabase } from '../../lib/supabase';

const AssistantCatalog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [assistantCompanions, setAssistantCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Updated category options aligned with knowledge banks
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'service-management', label: 'Service Management' },
    { value: 'strategy-governance', label: 'Strategy & Governance' },
    { value: 'operations-delivery', label: 'Operations & Delivery' },
    { value: 'technology-automation', label: 'Technology & Automation' },
    { value: 'frameworks', label: 'Frameworks & Standards' }
  ];

  // Updated specialty options based on the 12 knowledge banks
  const specialtyOptions = [
    { value: 'all', label: 'All Specialties' },
    { value: 'usmbok', label: 'USMBOK' },
    { value: 'service_consumer_management', label: 'Service Consumer Management' },
    { value: 'service_strategy_management', label: 'Service Strategy Management' },
    { value: 'service_performance_management', label: 'Service Performance Management' },
    { value: 'service_value_management', label: 'Service Value Management' },
    { value: 'intelligent_automation', label: 'Intelligent Automation' },
    { value: 'service_experience_management', label: 'Service Experience Management' },
    { value: 'service_delivery_management', label: 'Service Delivery Management' },
    { value: 'service_operations_management', label: 'Service Operations Management' },
    { value: 'service_infrastructure_management', label: 'Service Infrastructure Management' },
    { value: 'itil', label: 'ITIL' },
    { value: 'it4it', label: 'IT4IT' }
  ];

  // Domain to title mapping based on user requirements - removing specialist/advisor/consultant/expert titles
  const domainTitleMapping = {
    'usmbok': { 
      name: 'USMBOK®', 
      subtitle: 'Universal Service Management',
      category: 'Service Management',
      icon: 'BookOpen',
      color: 'bg-blue-500'
    },
    'service_consumer_management': { 
      name: 'Service Consumer Management', 
      subtitle: 'USM1XX',
      category: 'Service Management',
      icon: 'Users',
      color: 'bg-green-500'
    },
    'service_strategy_management': { 
      name: 'Service Strategy Management', 
      subtitle: 'USM2XX',
      category: 'Strategy & Governance',
      icon: 'Target',
      color: 'bg-purple-500'
    },
    'service_performance_management': { 
      name: 'Service Performance Management', 
      subtitle: 'USM3XX',
      category: 'Operations & Delivery',
      icon: 'BarChart3',
      color: 'bg-indigo-500'
    },
    'service_value_management': { 
      name: 'Service Value Management', 
      subtitle: 'USM7XX',
      category: 'Strategy & Governance',
      icon: 'DollarSign',
      color: 'bg-yellow-500'
    },
    'intelligent_automation': { 
      name: 'Intelligent Automation', 
      subtitle: 'USM8XX',
      category: 'Technology & Automation',
      icon: 'Bot',
      color: 'bg-red-500'
    },
    'service_experience_management': { 
      name: 'Service Experience Management', 
      subtitle: 'USM4XX',
      category: 'Service Management',
      icon: 'Heart',
      color: 'bg-pink-500'
    },
    'service_delivery_management': { 
      name: 'Service Delivery Management', 
      subtitle: 'USM5XX',
      category: 'Operations & Delivery',
      icon: 'Truck',
      color: 'bg-teal-500'
    },
    'service_operations_management': { 
      name: 'Service Operations Management', 
      subtitle: 'USM6XX',
      category: 'Operations & Delivery',
      icon: 'Settings',
      color: 'bg-gray-500'
    },
    'service_infrastructure_management': { 
      name: 'Service Infrastructure Management', 
      subtitle: 'USMXXX',
      category: 'Technology & Automation',
      icon: 'Server',
      color: 'bg-cyan-500'
    },
    'itil': { 
      name: 'ITIL', 
      subtitle: 'ITIL Framework',
      category: 'Frameworks & Standards',
      icon: 'Award',
      color: 'bg-orange-500'
    },
    'it4it': { 
      name: 'IT4IT', 
      subtitle: 'IT4IT Architecture',
      category: 'Frameworks & Standards',
      icon: 'Layers',
      color: 'bg-violet-500'
    }
  };

  // Fetch assistants from Supabase
  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase?.from('assistants')?.select('*')?.eq('is_active', true)?.order('created_at', { ascending: true });

        if (supabaseError) {
          throw supabaseError;
        }

        // Transform Supabase data to match UI expectations
        const transformedAssistants = data?.map((assistant) => {
          const mapping = domainTitleMapping?.[assistant?.domain] || {
            name: assistant?.name,
            subtitle: '',
            category: 'Other',
            icon: 'Bot',
            color: 'bg-gray-500'
          };

          return {
            id: assistant?.id,
            name: mapping?.name,
            subtitle: mapping?.subtitle,
            description: assistant?.description || '',
            category: mapping?.category,
            specialty: assistant?.domain,
            icon: mapping?.icon,
            color: mapping?.color,
            expertise: [], // Will be populated from description or other fields if available
            rating: 4.8, // Default rating - could be stored in DB
            conversations: 0, // Could be calculated from actual conversation counts
            credits_per_message: assistant?.credits_per_message || 10
          };
        }) || [];

        setAssistantCompanions(transformedAssistants);
      } catch (err) {
        console.error('Error fetching assistants:', err);
        setError('Failed to load assistants. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  // Filter assistants based on search and filters
  const filteredAssistants = assistantCompanions?.filter(assistant => {
    const matchesSearch = !searchQuery || 
      assistant?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      assistant?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      assistant?.subtitle?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || assistant?.category?.toLowerCase()?.replace(/\s+/g,'-')?.includes(selectedCategory?.replace(/-/g, '_'));
    
    const matchesSpecialty = !selectedSpecialty || selectedSpecialty === 'all' || 
      assistant?.specialty === selectedSpecialty;
    
    return matchesSearch && matchesCategory && matchesSpecialty;
  });

  const handleStartConversation = (assistantId) => {
    navigate(`/ai-chat-interface?assistant=${assistantId}`);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh] pt-28">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assistants...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh] pt-28">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Assistants</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location?.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8 pt-28">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI Companion Catalog
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose from our specialized AI companions, each trained in specific domains to provide expert guidance and support.
          </p>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 p-4 bg-card rounded-lg shadow-md border border-border">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search companions by name, expertise, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="w-full"
                />
              </div>
              
              <div className="lg:w-48">
                <Select
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Category"
                  className="w-full"
                />
              </div>
              
              <div className="lg:w-48">
                <Select
                  options={specialtyOptions}
                  value={selectedSpecialty}
                  onChange={setSelectedSpecialty}
                  placeholder="Specialty"
                  className="w-full"
                />
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Assistants Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Available Companions ({filteredAssistants?.length})
            </h2>
          </div>

          {filteredAssistants?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No companions found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssistants?.map((assistant) => (
                <div key={assistant?.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${assistant?.color} rounded-full flex items-center justify-center mr-4`}>
                      <Icon name={assistant?.icon} size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{assistant?.name}</h3>
                      <p className="text-sm text-muted-foreground">{assistant?.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4">
                    {assistant?.description || `Specialized ${assistant?.name?.toLowerCase()} guidance and support for your service management needs.`}
                  </p>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      {assistant?.category}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-yellow-500 fill-current" />
                      <span>{assistant?.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Zap" size={14} />
                      <span>{assistant?.credits_per_message} credits/msg</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleStartConversation(assistant?.id)}
                    className="w-full"
                  >
                    Start Conversation
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AssistantCatalog;