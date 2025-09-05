import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ChatHeader from './components/ChatHeader';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import CreditUsageTracker from './components/CreditUsageTracker';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AIChatInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get selected domain from navigation state or default
  const selectedDomainFromState = location?.state?.selectedDomain;
  
  // Mock data for selected domain
  const mockDomains = [
    {
      id: 'medical',
      name: 'Medical & Healthcare',
      category: 'Healthcare',
      description: 'Medical diagnosis, treatment options, and healthcare guidance',
      icon: 'Heart',
      color: 'text-red-500'
    },
    {
      id: 'legal',
      name: 'Legal Advisory',
      category: 'Legal',
      description: 'Legal consultation, contract analysis, and regulatory guidance',
      icon: 'Scale',
      color: 'text-blue-500'
    },
    {
      id: 'finance',
      name: 'Financial Planning',
      category: 'Finance',
      description: 'Investment advice, financial planning, and market analysis',
      icon: 'TrendingUp',
      color: 'text-green-500'
    }
  ];

  // State management
  const [selectedDomain, setSelectedDomain] = useState(
    selectedDomainFromState || mockDomains?.[0]
  );
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(2450);
  const [sessionUsage, setSessionUsage] = useState(0);
  const [lastTransactionTokens, setLastTransactionTokens] = useState(0);
  const [conversationTitle, setConversationTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [showCreditTracker, setShowCreditTracker] = useState(false);

  // Mock conversation data
  const mockInitialMessages = [
    {
      id: 1,
      content: `Hello! I'm your ${selectedDomain?.name} assistant. I'm here to provide expert guidance and detailed information in this domain. How can I help you today?`,
      isUser: false,
      timestamp: new Date(Date.now() - 300000),
      tokensUsed: 45
    }
  ];

  // Initialize conversation
  useEffect(() => {
    if (messages?.length === 0) {
      setMessages(mockInitialMessages);
      setConversationTitle(`${selectedDomain?.name} Consultation`);
    }
  }, [selectedDomain]);

  // Mock AI response generator
  const generateMockResponse = useCallback((userMessage) => {
    const responses = [
      `Based on your question about "${userMessage?.substring(0, 50)}...", I can provide detailed insights from the ${selectedDomain?.name} domain.\n\nHere are the key points to consider:\n\n1. **Primary Analysis**: This requires careful examination of multiple factors specific to ${selectedDomain?.category?.toLowerCase()}.\n\n2. **Best Practices**: Industry standards suggest following established protocols.\n\n3. **Recommendations**: I recommend taking a systematic approach to address your specific needs.\n\nWould you like me to elaborate on any of these points or explore a specific aspect in more detail?`,
      
      `Thank you for that question. In the context of ${selectedDomain?.name}, this is a complex topic that requires nuanced understanding.\n\n**Key Considerations:**\n- Regulatory compliance and standards\n- Risk assessment and mitigation strategies\n- Implementation timeline and resource allocation\n\n**Next Steps:**\nI suggest we break this down into manageable components. Which aspect would you like to explore first?\n\n*Note: This guidance is based on current industry standards and best practices.*`,
      
      `Excellent question! Let me provide a comprehensive analysis from the ${selectedDomain?.name} perspective:\n\n\`\`\`\nAnalysis Framework:\n1. Current situation assessment\n2. Available options evaluation\n3. Risk-benefit analysis\n4. Implementation strategy\n\`\`\`\n\n**Detailed Breakdown:**\nThe approach I recommend involves systematic evaluation of your specific circumstances. This ensures optimal outcomes while maintaining compliance with relevant standards.\n\nShall we dive deeper into any particular aspect of this analysis?`
    ];
    
    return responses?.[Math.floor(Math.random() * responses?.length)];
  }, [selectedDomain]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (messageContent) => {
    if (!messageContent?.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
      tokensUsed: 0
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const tokensUsed = Math.floor(Math.random() * 150) + 50; // 50-200 tokens
      const aiResponse = {
        id: Date.now() + 1,
        content: generateMockResponse(messageContent),
        isUser: false,
        timestamp: new Date(),
        tokensUsed: tokensUsed
      };

      setMessages(prev => [...prev, aiResponse]);
      setSessionUsage(prev => prev + tokensUsed);
      setLastTransactionTokens(tokensUsed);
      setCredits(prev => prev - tokensUsed);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000);
  }, [isLoading, generateMockResponse]);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setSessionUsage(0);
    setLastTransactionTokens(0);
    setConversationTitle('');
    // Re-initialize with welcome message
    setTimeout(() => {
      setMessages(mockInitialMessages);
      setConversationTitle(`${selectedDomain?.name} Consultation`);
    }, 100);
  }, [selectedDomain, mockInitialMessages]);

  // Handle save conversation
  const handleSaveConversation = useCallback(async () => {
    if (messages?.length <= 1) return;
    
    setIsSaving(true);
    // Simulate save operation
    setTimeout(() => {
      setIsSaving(false);
      // Show success feedback (could be a toast notification)
    }, 1000);
  }, [messages]);

  // Handle export conversation
  const handleExportConversation = useCallback(() => {
    if (messages?.length <= 1) return;

    const exportData = {
      title: conversationTitle || 'AI Conversation',
      domain: selectedDomain?.name,
      timestamp: new Date()?.toISOString(),
      messages: messages?.map(msg => ({
        role: msg?.isUser ? 'user' : 'assistant',
        content: msg?.content,
        timestamp: msg?.timestamp,
        tokensUsed: msg?.tokensUsed
      })),
      totalTokensUsed: sessionUsage
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversationTitle || 'conversation'}-${Date.now()}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages, conversationTitle, selectedDomain, sessionUsage]);

  // Handle scroll to top for loading more messages
  const handleScrollToTop = useCallback(() => {
    setLoadingMoreMessages(true);
    // Simulate loading more messages
    setTimeout(() => {
      setLoadingMoreMessages(false);
      setHasMoreMessages(false); // No more messages to load in this demo
    }, 1000);
  }, []);

  // Handle low credits
  useEffect(() => {
    if (credits < 100) {
      // Could show a modal or notification about low credits
    }
  }, [credits]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 h-screen flex flex-col">
        {/* Chat Header */}
        <ChatHeader
          selectedDomain={selectedDomain}
          credits={credits}
          conversationTitle={conversationTitle}
          onNewChat={handleNewChat}
          onSaveConversation={handleSaveConversation}
          onExportConversation={handleExportConversation}
          isSaving={isSaving}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Messages Area */}
          <div className="flex-1 flex flex-col">
            <ChatArea
              messages={messages}
              isLoading={isLoading}
              onScrollToTop={handleScrollToTop}
              hasMoreMessages={hasMoreMessages}
              loadingMoreMessages={loadingMoreMessages}
            />
            
            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading || credits < 10}
              placeholder={
                credits < 10 
                  ? "Insufficient credits to continue..." 
                  : `Ask your ${selectedDomain?.name} question...`
              }
            />
          </div>

          {/* Side Panel - Credit Tracker (Desktop) */}
          <div className="hidden xl:block w-80 border-l border-border bg-surface">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Session Info</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreditTracker(!showCreditTracker)}
                  iconName={showCreditTracker ? "ChevronUp" : "ChevronDown"}
                />
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <CreditUsageTracker
                sessionUsage={sessionUsage}
                totalCredits={2450}
                lastTransactionTokens={lastTransactionTokens}
                showDetails={true}
              />

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Quick Actions</h4>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/credit-management')}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Buy Credits
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/conversation-history')}
                    iconName="History"
                    iconPosition="left"
                  >
                    View History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/domain-selection')}
                    iconName="Brain"
                    iconPosition="left"
                  >
                    Switch Domain
                  </Button>
                </div>
              </div>

              {/* Domain Info */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name={selectedDomain?.icon} size={16} className={selectedDomain?.color} />
                  <span className="text-sm font-medium text-foreground">
                    {selectedDomain?.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedDomain?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Credit Tracker */}
        <div className="xl:hidden border-t border-border bg-surface p-3">
          <CreditUsageTracker
            sessionUsage={sessionUsage}
            totalCredits={2450}
            lastTransactionTokens={lastTransactionTokens}
            showDetails={false}
          />
        </div>

        {/* Low Credits Warning */}
        {credits < 100 && (
          <div className="border-t border-border bg-warning/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="AlertTriangle" size={16} className="text-warning" />
                <span className="text-sm text-warning font-medium">
                  Low credits remaining ({credits})
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/credit-management')}
                iconName="Plus"
                iconPosition="left"
              >
                Buy Credits
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatInterface;