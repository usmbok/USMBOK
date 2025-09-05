import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../contexts/UserProfileContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscriber, hasPremiumSubscription } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKnowledgeBank, setSelectedKnowledgeBank] = useState('');

  // Updated knowledge bank options for dropdown aligned with 12 knowledge banks
  const knowledgeBankOptions = [
    { value: 'usmbok', label: 'USMBOK' },
    { value: 'service-consumer-management', label: 'Service Consumer Management' },
    { value: 'service-strategy-management', label: 'Service Strategy Management' },
    { value: 'service-performance-management', label: 'Service Performance Management' },
    { value: 'service-value-management', label: 'Service Value Management' },
    { value: 'intelligent-automation', label: 'Intelligent Automation' },
    { value: 'service-experience-management', label: 'Service Experience Management' },
    { value: 'service-delivery-management', label: 'Service Delivery Management' },
    { value: 'service-operations-management', label: 'Service Operations Management' },
    { value: 'service-infrastructure-management', label: 'Service Infrastructure Management' },
    { value: 'itil', label: 'ITIL' },
    { value: 'it4it', label: 'IT4IT' }
  ];

  // How it works steps data
  const howItWorksSteps = [
    {
      icon: 'Search',
      title: 'Search For or Submit Questions',
      description: 'Find answers to service management questions or contribute your own expertise to the community.'
    },
    {
      icon: 'Coins',
      title: 'Earn Points & Credits',
      description: 'Build your reputation and earn credits for quality contributions and active participation.'
    },
    {
      icon: 'GraduationCap',
      title: 'Master Service Management',
      description: 'Expand your knowledge and skills with comprehensive resources and expert insights.'
    },
    {
      icon: 'MessageSquare',
      title: 'Chat with USMBOK Assistant',
      description: 'Get instant help from our AI-powered assistant trained on service management best practices.'
    }
  ];

  // Achievement tiers data
  const achievementTiers = [
    { name: 'Explorer', color: 'bg-gray-200', textColor: 'text-gray-600' },
    { name: 'Builder', color: 'bg-blue-200', textColor: 'text-blue-600' },
    { name: 'Pathfinder', color: 'bg-green-200', textColor: 'text-green-600' },
    { name: 'Trailblazer', color: 'bg-yellow-200', textColor: 'text-yellow-600' },
    { name: 'Innovator', color: 'bg-purple-200', textColor: 'text-purple-600' },
    { name: 'Pioneer', color: 'bg-red-200', textColor: 'text-red-600' },
    { name: 'Navigator', color: 'bg-indigo-200', textColor: 'text-indigo-600' },
    { name: 'Master', color: 'bg-amber-200', textColor: 'text-amber-600' }
  ];

  // Updated featured questions data aligned with knowledge banks
  const featuredQuestions = [
    {
      title: 'What are the core principles of USMBOK for service management?',
      category: 'USMBOK',
      answers: 18,
      votes: 67
    },
    {
      title: 'How to implement service consumer lifecycle management effectively?',
      category: 'Service Consumer Management',
      answers: 12,
      votes: 45
    },
    {
      title: 'Best practices for service value measurement and optimization?',
      category: 'Service Value Management',
      answers: 15,
      votes: 58
    }
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      navigate(`/domain-selection?query=${encodeURIComponent(searchQuery)}&bank=${selectedKnowledgeBank}`);
    }
  };

  const handleSignUp = () => {
    navigate('/registration-screen');
  };

  const handleUpgrade = () => {
    navigate('/credit-management');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Use the main Header component instead of custom header */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <div className="leading-tight">
              Universal Service Management
              <br />
              Body of Knowledge®
              <br />
              for Service Professionals
            </div>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Coming October 5th. Access thousands of questions and answers generated from years of practical experience.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-lg shadow-md border border-border">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search service management questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="w-full"
                />
              </div>
              
              <div className="md:w-48">
                <Select
                  options={knowledgeBankOptions}
                  value={selectedKnowledgeBank}
                  onChange={setSelectedKnowledgeBank}
                  placeholder="Knowledge Banks"
                  className="w-full"
                />
              </div>
              
              {/* Search button adapts to authentication status */}
              <Button 
                type="submit" 
                className="md:w-auto"
                onClick={!user ? handleSignUp : handleSearch}
              >
                {!user ? 'Sign Up' : 'Search'}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps?.map((step, index) => (
              <div key={index} className="text-center p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full">
                  <Icon name={step?.icon} size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step?.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievement Tiers Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Achievement Tiers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Progress through different achievement levels as you contribute to the service management community
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {achievementTiers?.map((tier, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-2 ${tier?.color} rounded-full flex items-center justify-center`}>
                  <Icon name="Award" size={24} className={tier?.textColor} />
                </div>
                <p className={`text-sm font-medium ${tier?.textColor}`}>
                  {tier?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Questions Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured Questions</h2>
            <Button variant="outline" onClick={() => navigate('/domain-selection')}>
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredQuestions?.map((question, index) => (
              <div key={index} className="p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => navigate('/ai-chat-interface')}>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {question?.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2">
                  {question?.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Icon name="MessageSquare" size={14} />
                      <span>{question?.answers} answers</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="ArrowUp" size={14} />
                      <span>{question?.votes} votes</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img
              src="/assets/images/USMBOK_2026_logo-registered-1756849025122.png"
              alt="USMBOK®"
              className="h-8 w-auto"
            />
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 Service Management 101 LLC, All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;