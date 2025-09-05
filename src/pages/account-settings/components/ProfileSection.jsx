import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useUserProfile } from '../../../contexts/UserProfileContext';

const ProfileSection = () => {
  const { isAdmin } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    jobTitle: 'Senior Data Analyst'
  });

  const [formData, setFormData] = useState(profileData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData?.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProfileData(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Profile Information</h3>
          <p className="text-sm text-muted-foreground">
            Update your personal information and contact details
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
              <Icon name="Crown" size={14} className="text-success" />
              <span className="text-xs font-medium text-success">Admin</span>
            </div>
          )}
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              iconName="Edit"
              iconPosition="left"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      
      {/* Credit Limit Display */}
      {isAdmin && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Coins" size={20} className="text-success" />
            <div>
              <h4 className="text-sm font-semibold text-success">Credit Limit</h4>
              <p className="text-2xl font-bold text-success">Unlimited</p>
              <p className="text-xs text-success/80">Administrator privileges</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
            <Icon name="User" size={32} className="text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">Profile Picture</p>
            <p className="text-xs text-muted-foreground mb-2">
              JPG, PNG or GIF. Max size 2MB
            </p>
            <Button variant="outline" size="sm" iconName="Upload">
              Upload Photo
            </Button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            value={formData?.firstName}
            onChange={(e) => handleInputChange('firstName', e?.target?.value)}
            error={errors?.firstName}
            disabled={!isEditing}
            required
          />
          
          <Input
            label="Last Name"
            type="text"
            value={formData?.lastName}
            onChange={(e) => handleInputChange('lastName', e?.target?.value)}
            error={errors?.lastName}
            disabled={!isEditing}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          disabled={!isEditing}
          description="This email will be used for account notifications and billing"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData?.phone}
          onChange={(e) => handleInputChange('phone', e?.target?.value)}
          disabled={!isEditing}
          description="Optional - for account recovery purposes"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company"
            type="text"
            value={formData?.company}
            onChange={(e) => handleInputChange('company', e?.target?.value)}
            disabled={!isEditing}
          />
          
          <Input
            label="Job Title"
            type="text"
            value={formData?.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e?.target?.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center space-x-3 pt-4 border-t border-border">
            <Button
              variant="default"
              loading={isSaving}
              iconName="Save"
              iconPosition="left"
              onClick={handleSave}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;