
import { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Updated limits for premium users
  const maxMessages = isPremium ? 300 : 50;
  const maxUploads = isPremium ? 25 : 5;
  
  const messagesLeft = isPremium ? '∞' : Math.max(0, maxMessages - messageCount);
  const canSendMessage = isPremium || messageCount < maxMessages;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && inputText.trim() && canSendMessage) {
        onSendMessage();
      }
    }
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
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type something you're feeling…"
            className="w-full bg-secondary border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[48px] max-h-32"
            disabled={disabled || !canSendMessage}
            autoFocus
            rows={1}
          />
          <button
            onClick={onSendMessage}
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
                {messagesLeft} messages left today
              </span>
              {messagesLeft === 0 && (
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
