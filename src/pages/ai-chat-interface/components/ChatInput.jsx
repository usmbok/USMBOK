import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChatInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Ask me anything...",
  estimatedTokens = 0 
}) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef?.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea?.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Estimate tokens (rough calculation: ~4 characters per token)
  const getEstimatedTokens = (text) => {
    return Math.ceil(text?.length / 4);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message?.trim() && !disabled && !isComposing) {
      onSendMessage(message?.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey && !isComposing) {
      e?.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return (
    <div className="border-t border-border bg-surface">
      <div className="p-4">
        {/* Token Estimation */}
        {message?.trim() && (
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Icon name="Type" size={12} />
                <span>{message?.length} characters</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Zap" size={12} />
                <span>~{getEstimatedTokens(message)} tokens</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e?.target?.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full min-h-12 max-h-32 p-3 pr-12 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
            />
            
            {/* Character count indicator */}
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {message?.length}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!message?.trim() || disabled || isComposing}
            iconName="Send"
            size="default"
            className="flex-shrink-0"
          >
            Send
          </Button>
        </form>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessage('')}
              disabled={!message?.trim()}
              iconName="X"
              className="text-xs"
            >
              Clear
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Shield" size={12} />
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;