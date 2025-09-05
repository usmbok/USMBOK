import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const UserAccountMenu = ({ 
  user = { name: 'John Doe', email: 'john@example.com', avatar: null },
  onSignOut 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef?.current && !menuRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSignOut = () => {
    closeMenu();
    if (onSignOut) {
      onSignOut();
    }
  };

  const getInitials = (name) => {
    return name?.split(' ')?.map(word => word?.charAt(0))?.join('')?.toUpperCase()?.slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Account Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="flex items-center space-x-2 p-2"
      >
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
          {user?.avatar ? (
            <img 
              src={user?.avatar} 
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-secondary-foreground">
              {getInitials(user?.name)}
            </span>
          )}
        </div>
        <Icon name="ChevronDown" size={16} className="hidden sm:block text-muted-foreground" />
      </Button>
      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-100" onClick={closeMenu} />
          
          {/* Menu Content */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-200">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user?.avatar} 
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-secondary-foreground">
                      {getInitials(user?.name)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-popover-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                to="/account-settings"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                <Icon name="Settings" size={16} />
                <span>Account Settings</span>
              </Link>
              
              <Link
                to="/credit-management"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                <Icon name="CreditCard" size={16} />
                <span>Billing & Credits</span>
              </Link>
              
              <Link
                to="/conversation-history"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                <Icon name="History" size={16} />
                <span>Conversation History</span>
              </Link>

              <div className="border-t border-border my-1" />
              
              <button
                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                onClick={handleSignOut}
              >
                <Icon name="LogOut" size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserAccountMenu;