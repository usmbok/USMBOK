import React from 'react';
import Icon from '../../../components/AppIcon';

const ChatMessage = ({ 
  message, 
  isUser = false, 
  timestamp, 
  tokensUsed = 0,
  isTyping = false 
}) => {
  const formatTime = (date) => {
    return new Date(date)?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCode = (content) => {
    // Simple code block detection and formatting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let formattedContent = content;
    
    // Replace code blocks
    formattedContent = formattedContent?.replace(codeBlockRegex, (match, language, code) => {
      return `<pre class="bg-muted p-3 rounded-md overflow-x-auto my-2"><code class="text-sm font-mono">${code?.trim()}</code></pre>`;
    });
    
    // Replace inline code
    formattedContent = formattedContent?.replace(inlineCodeRegex, (match, code) => {
      return `<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">${code}</code>`;
    });
    
    return formattedContent;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-primary' : 'bg-secondary'
          }`}>
            <Icon 
              name={isUser ? "User" : "Bot"} 
              size={16} 
              color="white" 
            />
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block p-4 rounded-lg ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-card border border-border'
          }`}>
            {isTyping ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            ) : (
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatCode(message) }}
              />
            )}
          </div>

          {/* Message Meta */}
          {!isTyping && (
            <div className={`flex items-center mt-2 space-x-3 text-xs text-muted-foreground ${
              isUser ? 'justify-end' : 'justify-start'
            }`}>
              <span>{formatTime(timestamp)}</span>
              {!isUser && tokensUsed > 0 && (
                <div className="flex items-center space-x-1">
                  <Icon name="Zap" size={12} />
                  <span>{tokensUsed} tokens</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;