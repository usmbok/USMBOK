import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChatArea = ({ 
  messages = [], 
  isLoading = false, 
  onScrollToTop,
  hasMoreMessages = false,
  loadingMoreMessages = false 
}) => {
  const messagesEndRef = useRef(null);
  const chatAreaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef?.current && !loadingMoreMessages) {
      messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingMoreMessages]);

  // Handle scroll to load more messages
  const handleScroll = (e) => {
    const { scrollTop } = e?.target;
    if (scrollTop === 0 && hasMoreMessages && !loadingMoreMessages) {
      onScrollToTop?.();
    }
  };

  if (messages?.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageSquare" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Start a Conversation
          </h3>
          <p className="text-muted-foreground mb-6">
            Ask me anything about your selected domain. I'm here to help with detailed, accurate information.
          </p>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              iconName="Lightbulb"
              iconPosition="left"
            >
              Explain a complex concept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              iconName="Search"
              iconPosition="left"
            >
              Research a specific topic
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              iconName="Code"
              iconPosition="left"
            >
              Help with problem-solving
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={chatAreaRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
    >
      {/* Load More Messages Indicator */}
      {hasMoreMessages && (
        <div className="flex justify-center py-4">
          {loadingMoreMessages ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Icon name="Loader2" size={16} className="animate-spin" />
              <span className="text-sm">Loading previous messages...</span>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onScrollToTop}
              iconName="ChevronUp"
              iconPosition="left"
            >
              Load previous messages
            </Button>
          )}
        </div>
      )}
      {/* Messages */}
      {messages?.map((message, index) => (
        <ChatMessage
          key={message?.id || index}
          message={message?.content}
          isUser={message?.isUser}
          timestamp={message?.timestamp}
          tokensUsed={message?.tokensUsed}
          isTyping={message?.isTyping}
        />
      ))}
      {/* Loading Indicator */}
      {isLoading && (
        <ChatMessage
          message=""
          isUser={false}
          timestamp={new Date()}
          isTyping={true}
        />
      )}
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatArea;