import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProfileSection from './components/ProfileSection';
import SecuritySection from './components/SecuritySection';
import SubscriptionSection from './components/SubscriptionSection';
import NotificationSection from './components/NotificationSection';
import PreferencesSection from './components/PreferencesSection';
import DangerZoneSection from './components/DangerZoneSection';

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      description: 'Personal information and contact details'
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'Shield',
      description: 'Password, 2FA, and session management'
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: 'CreditCard',
      description: 'Plan details and billing information'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      description: 'Email, push, and SMS preferences'
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: 'Settings',
      description: 'Interface and application settings'
    },
    {
      id: 'danger',
      label: 'Account',
      icon: 'AlertTriangle',
      description: 'Data management and account deletion'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSection />;
      case 'security':
        return <SecuritySection />;
      case 'subscription':
        return <SubscriptionSection />;
      case 'notifications':
        return <NotificationSection />;
      case 'preferences':
        return <PreferencesSection />;
      case 'danger':
        return <DangerZoneSection />;
      default:
        return <ProfileSection />;
    }
  };

  const getTabIcon = (tabId) => {
    if (tabId === 'danger') return 'AlertTriangle';
    return tabs?.find(tab => tab?.id === tabId)?.icon || 'Settings';
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Account Settings - KnowledgeChat Pro</title>
        <meta name="description" content="Manage your account settings, subscription, security, and preferences for KnowledgeChat Pro." />
      </Helmet>
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Settings" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account, subscription, and application preferences
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
                <nav className="space-y-2">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-card-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon 
                        name={tab?.icon} 
                        size={20} 
                        className={activeTab === tab?.id ? 'text-primary-foreground' : 'text-muted-foreground'} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          activeTab === tab?.id ? 'text-primary-foreground' : 'text-card-foreground'
                        }`}>
                          {tab?.label}
                        </p>
                        <p className={`text-xs mt-1 ${
                          activeTab === tab?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {tab?.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Mobile Tab Selector */}
            <div className="lg:hidden">
              <div className="bg-card rounded-lg border border-border p-4 mb-6">
                <Button
                  variant="outline"
                  fullWidth
                  iconName={getTabIcon(activeTab)}
                  iconPosition="left"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="justify-between"
                >
                  <span>{tabs?.find(tab => tab?.id === activeTab)?.label}</span>
                  <Icon name={isMobileMenuOpen ? "ChevronUp" : "ChevronDown"} size={16} />
                </Button>

                {isMobileMenuOpen && (
                  <div className="mt-4 space-y-2">
                    {tabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => {
                          setActiveTab(tab?.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                          activeTab === tab?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-card-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon 
                          name={tab?.icon} 
                          size={18} 
                          className={activeTab === tab?.id ? 'text-primary-foreground' : 'text-muted-foreground'} 
                        />
                        <div>
                          <p className={`text-sm font-medium ${
                            activeTab === tab?.id ? 'text-primary-foreground' : 'text-card-foreground'
                          }`}>
                            {tab?.label}
                          </p>
                          <p className={`text-xs ${
                            activeTab === tab?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}>
                            {tab?.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="space-y-6">
                {/* Tab Content Header */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      activeTab === 'danger' ? 'bg-error/10' : 'bg-primary/10'
                    }`}>
                      <Icon 
                        name={getTabIcon(activeTab)} 
                        size={24} 
                        className={activeTab === 'danger' ? 'text-error' : 'text-primary'} 
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-card-foreground">
                        {tabs?.find(tab => tab?.id === activeTab)?.label}
                      </h2>
                      <p className="text-muted-foreground">
                        {tabs?.find(tab => tab?.id === activeTab)?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;