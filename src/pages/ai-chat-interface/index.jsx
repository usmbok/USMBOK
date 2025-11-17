import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ChatHeader from './components/ChatHeader';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import CreditUsageTracker from './components/CreditUsageTracker';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { assistantService } from '../../services/assistantService';

const AIChatInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get selected assistant from various sources
  const selectedAssistantFromState = location?.state?.selectedAssistant;
  const assistantIdFromParams = searchParams?.get('assistantId');
  const domainFromParams = searchParams?.get('domain');

  // State management
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAssistant, setIsLoadingAssistant] = useState(true);
  const [assistantError, setAssistantError] = useState('');
  const [credits, setCredits] = useState(2450);
  const [sessionUsage, setSessionUsage] = useState(0);
  const [lastTransactionTokens, setLastTransactionTokens] = useState(0);
  const [conversationTitle, setConversationTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [showCreditTracker, setShowCreditTracker] = useState(false);

  // Load assistant data on component mount
  const loadAssistant = useCallback(async () => {
    try {
      setIsLoadingAssistant(true);
      setAssistantError('');
      let assistant = null;

      // Priority order: state > assistantId > domain > default USMBOK
      if (selectedAssistantFromState) {
        assistant = selectedAssistantFromState;
      } else if (assistantIdFromParams) {
        assistant = await assistantService?.getById(assistantIdFromParams);
      } else if (domainFromParams) {
        assistant = await assistantService?.getByDomain(domainFromParams);
      } else {
        // Default to USMBOK assistant
        assistant = await assistantService?.getUSMBOKAssistant();
      }

      if (assistant) {
        setSelectedAssistant(assistant);
        setConversationTitle(`${assistant?.name} Consultation`);
      } else {
        setAssistantError('Assistant not found. Please select a valid assistant.');
      }
    } catch (err) {
      console.error('Error loading assistant:', err);
      setAssistantError(err?.message);
    } finally {
      setIsLoadingAssistant(false);
    }
  }, [selectedAssistantFromState, assistantIdFromParams, domainFromParams]);

  // Load assistant on mount
  useEffect(() => {
    loadAssistant();
  }, [loadAssistant]);

  // Generate welcome message based on selected assistant
  const generateWelcomeMessage = useCallback((assistant) => {
    if (!assistant) return null;

    let welcomeContent = '';
    
    // Customize welcome message based on assistant type
    if (assistant?.domain === 'USMXXX') {
      // Use the assistant's actual description or create a proper USMBOK welcome
      welcomeContent = `Hello! I'm your USMBOK (Universal Service Management Body of Knowledge) assistant. I'm here to provide expert guidance on service management frameworks, best practices, and methodologies. Whether you need help with ITIL, service strategy, or operational excellence, I'm ready to assist you with detailed insights and actionable recommendations.`;
    } else if (assistant?.domain?.startsWith('USM')) {
      welcomeContent = `Hello! I'm your ${assistant?.name} assistant, specializing in ${assistant?.knowledgeBank}. I'm here to provide expert guidance and detailed information in this specialized domain of service management. I can help you with strategic planning, implementation best practices, and operational excellence.`;
    } else if (assistant?.domain === 'itil') {
      welcomeContent = `Hello! I'm your ITIL assistant. I'm here to help you with Information Technology Infrastructure Library best practices, service lifecycle management, and IT service management frameworks. Let me know how I can assist you with your ITIL journey.`;
    } else if (assistant?.domain === 'it4it') {
      welcomeContent = `Hello! I'm your IT4IT assistant. I'm here to provide guidance on the IT4IT reference architecture, value streams, and IT management practices. I can help you understand and implement IT4IT framework for improved business outcomes.`;
    } else {
      // Generic welcome for other assistants - use actual assistant description
      const assistantDescription = assistant?.description || 'I can help you with questions and provide insights based on my specialized knowledge.';
      welcomeContent = `Hello! I'm your ${assistant?.name} assistant. I'm here to provide expert guidance and detailed information in ${assistant?.knowledgeBank || 'this domain'}. ${assistantDescription} How can I help you today?`;
    }

    return {
      id: Date.now(),
      content: welcomeContent,
      isUser: false,
      timestamp: new Date(Date.now() - 300000),
      tokensUsed: Math.ceil(welcomeContent?.length / 4) // Rough token estimation
    };
  }, []);

  // Initialize conversation when assistant loads
  useEffect(() => {
    if (selectedAssistant && messages?.length === 0) {
      const welcomeMessage = generateWelcomeMessage(selectedAssistant);
      if (welcomeMessage) {
        setMessages([welcomeMessage]);
      }
    }
  }, [selectedAssistant, messages?.length, generateWelcomeMessage]);

  // Mock AI response generator based on assistant context
  const generateMockResponse = useCallback((userMessage) => {
    if (!selectedAssistant) return "I'm sorry, I'm not properly configured. Please try again.";

    const responses = [
      `Based on your question about "${userMessage?.substring(0, 50)}...", I can provide detailed insights from the ${selectedAssistant?.name} domain.\n\nHere are the key points to consider:\n\n1. **Primary Analysis**: This requires careful examination of multiple factors specific to ${selectedAssistant?.knowledgeBank?.toLowerCase() || 'this domain'}.\n\n2. **Best Practices**: Industry standards suggest following established protocols within the ${selectedAssistant?.domain} framework.\n\n3. **Recommendations**: I recommend taking a systematic approach based on ${selectedAssistant?.name} methodologies to address your specific needs.\n\nWould you like me to elaborate on any of these points or explore a specific aspect in more detail?`,
      
      `Thank you for that question. In the context of ${selectedAssistant?.name}, this is a complex topic that requires nuanced understanding based on ${selectedAssistant?.knowledgeBank} principles.\n\n**Key Considerations:**\n- Regulatory compliance and ${selectedAssistant?.domain} standards\n- Risk assessment and mitigation strategies\n- Implementation timeline and resource allocation within ${selectedAssistant?.knowledgeBank} framework\n\n**Next Steps:**\nI suggest we break this down into manageable components following ${selectedAssistant?.name} best practices. Which aspect would you like to explore first?\n\n*Note: This guidance is based on current ${selectedAssistant?.knowledgeBank} standards and best practices.*`,
      
      `Excellent question! Let me provide a comprehensive analysis from the ${selectedAssistant?.name} perspective:\n\n\`\`\`\nAnalysis Framework (${selectedAssistant?.domain}):\n1. Current situation assessment\n2. Available options evaluation\n3. Risk-benefit analysis\n4. Implementation strategy\n\`\`\`\n\n**Detailed Breakdown:**\nThe approach I recommend involves systematic evaluation of your specific circumstances using ${selectedAssistant?.knowledgeBank} methodologies. This ensures optimal outcomes while maintaining compliance with ${selectedAssistant?.domain} standards.\n\nShall we dive deeper into any particular aspect of this ${selectedAssistant?.name} analysis?`
    ];
    
    return responses?.[Math.floor(Math.random() * responses?.length)];
  }, [selectedAssistant]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (messageContent) => {
    if (!messageContent?.trim() || isLoading || !selectedAssistant) return;

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
      const tokensUsed = selectedAssistant?.creditsPerMessage || Math.floor(Math.random() * 150) + 50; // Use actual credits or fallback
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
  }, [isLoading, selectedAssistant, generateMockResponse]);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setSessionUsage(0);
    setLastTransactionTokens(0);
    setConversationTitle('');
    // Re-initialize with welcome message
    setTimeout(() => {
      if (selectedAssistant) {
        const welcomeMessage = generateWelcomeMessage(selectedAssistant);
        if (welcomeMessage) {
          setMessages([welcomeMessage]);
          setConversationTitle(`${selectedAssistant?.name} Consultation`);
        }
      }
    }, 100);
  }, [selectedAssistant, generateWelcomeMessage]);

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
      assistant: {
        name: selectedAssistant?.name,
        domain: selectedAssistant?.domain,
        knowledgeBank: selectedAssistant?.knowledgeBank
      },
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
  }, [messages, conversationTitle, selectedAssistant, sessionUsage]);

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

  // Show loading state while assistant is being loaded
  if (isLoadingAssistant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading assistant...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if assistant failed to load
  if (assistantError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 h-screen flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <Icon name="AlertCircle" size={48} className="text-destructive mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Assistant Not Available</h2>
            <p className="text-muted-foreground">{assistantError}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/domain-selection')} 
                className="w-full"
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Select Assistant
              </Button>
              <Button 
                variant="outline" 
                onClick={loadAssistant} 
                className="w-full"
                iconName="RefreshCw"
                iconPosition="left"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 h-screen flex flex-col">
        {/* Chat Header */}
        <ChatHeader
          selectedDomain={selectedAssistant}
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
              disabled={isLoading || credits < 10 || !selectedAssistant}
              placeholder={
                !selectedAssistant
                  ? "Loading assistant..."
                  : credits < 10 
                    ? "Insufficient credits to continue..." 
                    : `Ask your ${selectedAssistant?.name} question...`
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
                    onClick={() => navigate('/assistant-catalog')}
                    iconName="Brain"
                    iconPosition="left"
                  >
                    Switch Assistant
                  </Button>
                </div>
              </div>

              {/* Assistant Info */}
              {selectedAssistant && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon 
                      name={selectedAssistant?.domain === 'USMXXX' ? 'BookOpen' : 'Brain'} 
                      size={16} 
                      className="text-primary" 
                    />
                    <span className="text-sm font-medium text-foreground">
                      {selectedAssistant?.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {selectedAssistant?.description}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Domain: {selectedAssistant?.domain}</div>
                    <div>Credits/Message: {selectedAssistant?.creditsPerMessage}</div>
                  </div>
                </div>
              )}
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