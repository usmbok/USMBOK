import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AssistantEditor = ({ 
  assistant, 
  knowledgeBanks, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: assistant?.name || '',
    description: assistant?.description || '',
    domain: assistant?.domain || 'business',
    knowledge_bank: assistant?.knowledge_bank || '',
    openai_assistant_id: assistant?.openai_assistant_id || '',
    is_active: assistant?.is_active ?? true,
    credits_per_message: assistant?.credits_per_message || 10
  });

  const [errors, setErrors] = useState({});

  const domainOptions = [
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const knowledgeBankOptions = knowledgeBanks?.map(bank => ({
    value: bank,
    label: bank
  }));

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData?.knowledge_bank) {
      newErrors.knowledge_bank = 'Knowledge bank is required';
    }

    if (formData?.credits_per_message < 1 || formData?.credits_per_message > 1000) {
      newErrors.credits_per_message = 'Credits per message must be between 1 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving assistant:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <main className="pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <Icon name={assistant ? "Edit" : "Plus"} size={20} color="white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {assistant ? 'Edit Assistant' : 'Create New Assistant'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Configure AI assistant settings, knowledge bank assignments, and OpenAI integration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Assistant Name <span className="text-error">*</span>
                </label>
                <Input
                  type="text"
                  value={formData?.name}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  placeholder="Enter assistant name"
                  error={errors?.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Domain <span className="text-error">*</span>
                </label>
                <Select
                  options={domainOptions}
                  value={formData?.domain}
                  onChange={(value) => handleInputChange('domain', value)}
                  placeholder="Select domain"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description <span className="text-error">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  value={formData?.description}
                  onChange={(e) => handleInputChange('description', e?.target?.value)}
                  placeholder="Describe what this assistant specializes in..."
                />
                {errors?.description && (
                  <p className="mt-1 text-sm text-error">{errors?.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Knowledge Bank Configuration */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Knowledge Bank Assignment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Knowledge Bank <span className="text-error">*</span>
                </label>
                <Select
                  options={knowledgeBankOptions}
                  value={formData?.knowledge_bank}
                  onChange={(value) => handleInputChange('knowledge_bank', value)}
                  placeholder="Select knowledge bank"
                  error={errors?.knowledge_bank}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose the primary knowledge domain for this assistant
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Credits Per Message
                </label>
                <Input
                  type="number"
                  value={formData?.credits_per_message}
                  onChange={(e) => handleInputChange('credits_per_message', parseInt(e?.target?.value) || 0)}
                  placeholder="10"
                  min="1"
                  max="1000"
                  error={errors?.credits_per_message}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Credits consumed per conversation message
                </p>
              </div>
            </div>
          </div>

          {/* OpenAI Integration */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">OpenAI Integration</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  OpenAI Assistant ID
                </label>
                <Input
                  type="text"
                  value={formData?.openai_assistant_id}
                  onChange={(e) => handleInputChange('openai_assistant_id', e?.target?.value)}
                  placeholder="asst_xxxxxxxxxxxxxxxxxxxxxx"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  The OpenAI Assistant ID for API integration (optional but recommended)
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-md">
                <div className="flex items-start space-x-3">
                  <Icon name="Info" size={16} className="text-primary mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">OpenAI Assistant Configuration</h3>
                    <p className="text-xs text-muted-foreground">
                      To connect this assistant to OpenAI, create an assistant in the OpenAI platform 
                      and copy the Assistant ID here. This enables advanced AI capabilities and 
                      direct integration with OpenAI's API.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Configuration */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Status Configuration</h2>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                className="rounded border-border"
                checked={formData?.is_active}
                onChange={(e) => handleInputChange('is_active', e?.target?.checked)}
              />
              <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                Active Assistant
              </label>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Only active assistants are available for conversations. Inactive assistants are hidden from users.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              iconName="Save"
              iconPosition="left"
            >
              {assistant ? 'Update Assistant' : 'Create Assistant'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AssistantEditor;