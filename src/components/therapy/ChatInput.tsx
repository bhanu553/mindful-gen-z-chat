
import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import FileUpload from './FileUpload';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  disabled: boolean;
  messageCount?: number;
}

const ChatInput = ({ inputText, setInputText, onSendMessage, disabled, messageCount = 0 }: ChatInputProps) => {
  const { isPremium } = useAuth();
  const { stats, refresh: refreshStats } = useUserStats();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Updated limits for premium users
  const maxMessages = isPremium ? 300 : 50;
  const maxUploads = isPremium ? 25 : 5;
  
  // Use real stats if available, fallback to local counter
  const actualMessagesUsed = stats?.messagesUsedToday ?? messageCount;
  const messagesLeft = isPremium ? '∞' : Math.max(0, maxMessages - actualMessagesUsed);
  const canSendMessage = isPremium || actualMessagesUsed < maxMessages;

  // Refresh stats periodically
  useEffect(() => {
    const interval = setInterval(refreshStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    console.log('🎯 ChatInput handleSend called');
    console.log('🎯 Input text:', inputText);
    console.log('🎯 Can send message:', canSendMessage);
    console.log('🎯 Is disabled:', disabled);
    
    if (!inputText.trim()) {
      console.log('❌ No input text to send');
      return;
    }
    
    if (disabled) {
      console.log('❌ Send disabled');
      return;
    }
    
    if (!canSendMessage) {
      console.log('❌ Cannot send message - limit reached');
      return;
    }
    
    console.log('✅ Calling onSendMessage from parent');
    onSendMessage();
  };

  const handleUploadSuccess = (fileUrl: string) => {
    if (uploadedImages.length < maxUploads) {
      setUploadedImages(prev => [...prev, fileUrl]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative">
              <img 
                src={url} 
                alt={`Upload ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-border/50"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-3">
        <FileUpload 
          onUploadSuccess={handleUploadSuccess}
          className="flex-shrink-0"
        />
        
        <div className="flex-1 relative">
          <textarea
            value={inputText}
            onChange={(e) => {
              console.log('📝 Input text changed:', e.target.value);
              setInputText(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type something you're feeling…"
            className="w-full bg-secondary border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[48px] max-h-32"
            disabled={disabled || !canSendMessage}
            autoFocus
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || disabled || !canSendMessage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">
          {isPremium ? (
            <span className="text-green-400">✨ Premium: {maxMessages} messages & {maxUploads} uploads per day</span>
          ) : (
            <>
              <span className={cn(
                messagesLeft === 0 ? "text-red-400" : "text-foreground"
              )}>
                {stats ? `${stats.remainingMessages}` : messagesLeft} messages left today
              </span>
              {(stats?.remainingMessages === 0 || messagesLeft === 0) && (
                <span className="text-yellow-400 ml-2">
                  - Upgrade to Premium for 300 messages per day
                </span>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
