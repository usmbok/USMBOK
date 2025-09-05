import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserCredit } from '../../contexts/UserCreditContext';
import { useUserProfile } from '../../contexts/UserProfileContext';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { balance, loading: creditsLoading } = useUserCredit();
  const { isSubscriber, hasPremiumSubscription, isAdmin } = useUserProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Companion', path: '/ai-chat-interface', icon: 'MessageSquare' },
    { label: 'Knowledge Bank', path: '/assistant-catalog', icon: 'BookOpen' },
    { label: 'FAQs', path: '/faq' },
    // Add Admin menu item - only visible to admin users
    ...(isAdmin ? [{ label: 'Admin', path: '/admin-dashboard', icon: 'Settings' }] : []),
  ];

  const isActivePath = (path) => {
    if (path === '/ai-chat-interface') {
      return location?.pathname === '/ai-chat-interface' || location?.pathname === '/domain-selection';
    }
    return location?.pathname === path;
  };

  const getCreditStatusColor = (credits) => {
    if (credits < 500) return 'text-error';
    if (credits < 1000) return 'text-warning';
    return 'text-success';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Get display credits - use real balance or show loading/placeholder
  const displayCredits = creditsLoading ? '...' : (balance || 0);

  // Determine button text based on user subscription status
  const getUpgradeButtonText = () => {
    if (!user) return null; // Don't show anything when not authenticated
    if (hasPremiumSubscription) return null; // Hide button completely for premium users
    if (isSubscriber || user) return 'Upgrade'; // Show 'Upgrade' for registered/member users
    return null; // Hide for other cases
  };

  const upgradeButtonText = getUpgradeButtonText();

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-100">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/assets/images/USMBOK_2026_logo-registered-1756849025122.png"
            alt="USMBOK®"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation - Only show when authenticated */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                } ${
                  // Add special styling for Admin menu item
                  item?.label === 'Admin' ? 'border border-accent/30' : ''
                }`}
              >
                {item?.icon && <Icon name={item?.icon} size={16} />}
                <span>{item?.label}</span>
              </Link>
            ))}
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Upgrade Button for Registered Users - Only when authenticated and is registered/member */}
              {upgradeButtonText && (
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/credit-management'}
                  className="bg-primary hover:bg-primary/90"
                >
                  {upgradeButtonText}
                </Button>
              )}

              {/* Account Menu - Only when authenticated */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAccountMenu}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user?.user_metadata?.avatar_url} 
                        alt={user?.user_metadata?.full_name || user?.email}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <Icon name="User" size={16} color="white" />
                    )}
                  </div>
                  <Icon name="ChevronDown" size={16} className="hidden sm:block" />
                </Button>

                {/* Account Dropdown */}
                {isAccountMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-100"
                      onClick={() => setIsAccountMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-200">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-popover-foreground truncate">
                          {user?.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>

                      {/* Credit Balance in Account Menu */}
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon name="Coins" size={16} className="text-accent" />
                            <span className="text-sm font-medium">Credits</span>
                          </div>
                          <span className={`text-sm font-mono font-medium ${getCreditStatusColor(balance || 0)}`}>
                            {typeof displayCredits === 'number' ? displayCredits?.toLocaleString() : displayCredits}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/account-settings"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <Icon name="Settings" size={16} />
                          <span>Account Settings</span>
                        </Link>
                        <Link
                          to="/credit-management"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <Icon name="CreditCard" size={16} />
                          <span>Billing</span>
                        </Link>
                        <div className="border-t border-border my-1" />
                        <button
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                          onClick={handleSignOut}
                          disabled={loading}
                        >
                          <Icon name="LogOut" size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Login/Register buttons - Only when NOT authenticated */
            <div className="flex items-center space-x-3">
              <Link
                to="/login-screen"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Log In
              </Link>
              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Link to="/registration-screen">
                  Get Started
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="md:hidden"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-100 md:hidden"
            onClick={closeMobileMenu}
          />
          <div className="fixed top-16 left-0 right-0 bg-surface border-b border-border z-200 md:hidden">
            <nav className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  {/* Upgrade Button for Mobile - Only when authenticated and is registered/member */}
                  {upgradeButtonText && (
                    <Button
                      fullWidth
                      onClick={() => {
                        closeMobileMenu();
                        window.location.href = '/credit-management';
                      }}
                      className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {upgradeButtonText}
                    </Button>
                  )}

                  {/* Navigation Items - Mobile */}
                  {navigationItems?.map((item) => (
                    <Link
                      key={item?.path}
                      to={item?.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActivePath(item?.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      } ${
                        // Add special styling for Admin menu item on mobile
                        item?.label === 'Admin' ? 'border border-accent/30' : ''
                      }`}
                    >
                      {item?.icon && <Icon name={item?.icon} size={18} />}
                      <span>{item?.label}</span>
                      {item?.label === 'Admin' && (
                        <div className="ml-auto text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                          ADMIN
                        </div>
                      )}
                    </Link>
                  ))}

                  {/* Account Actions - Mobile */}
                  <div className="border-t border-border pt-4 space-y-2">
                    {/* Credit Balance - Mobile Account Menu */}
                    <div className="flex items-center justify-between px-4 py-3 bg-muted rounded-md">
                      <div className="flex items-center space-x-2">
                        <Icon name="Coins" size={16} className="text-accent" />
                        <span className="text-sm font-medium">Credits</span>
                      </div>
                      <span className={`text-sm font-mono font-medium ${getCreditStatusColor(balance || 0)}`}>
                        {typeof displayCredits === 'number' ? displayCredits?.toLocaleString() : displayCredits}
                      </span>
                    </div>
                    
                    <Link
                      to="/account-settings"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 px-4 py-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Icon name="Settings" size={18} />
                      <span>Account Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        handleSignOut();
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                      disabled={loading}
                    >
                      <Icon name="LogOut" size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Login/Register - Mobile */
                <div className="space-y-3">
                  <Link
                    to="/login-screen"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium text-primary border border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/registration-screen"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;