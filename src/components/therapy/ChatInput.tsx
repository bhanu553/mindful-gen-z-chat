
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import FileUpload from './FileUpload';
import { useAuth } from '@/contexts/AuthContext';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  disabled?: boolean;
  messageCount?: number;
}

const ChatInput = ({ 
  inputText, 
  setInputText, 
  onSendMessage, 
  disabled = false,
  messageCount = 0 
}: ChatInputProps) => {
  const { isPremium } = useAuth();
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxMessages = isPremium ? 300 : 50;
  const remainingMessages = Math.max(0, maxMessages - messageCount);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && inputText.trim() && remainingMessages > 0) {
        onSendMessage();
      }
    }
  };

  const handleSend = () => {
    if (!disabled && inputText.trim() && remainingMessages > 0) {
      onSendMessage();
    }
  };

  return (
    <div className="space-y-3">
      {/* Message Counter */}
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>Messages remaining today: {remainingMessages}</span>
        <span>{messageCount}/{maxMessages} used</span>
      </div>

      {/* File Upload */}
      {showFileUpload && (
        <div className="border border-white/20 rounded-lg p-4 bg-white/10 backdrop-blur-sm">
          <FileUpload onUploadSuccess={() => setShowFileUpload(false)} />
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={remainingMessages > 0 ? "Share what's on your mind..." : "Daily limit reached"}
            disabled={disabled || remainingMessages <= 0}
            className="min-h-[60px] max-h-32 resize-none bg-white/10 border-white/20 text-white placeholder-white/60 backdrop-blur-sm focus:bg-white/15 focus:border-white/30 transition-all duration-200 disabled:opacity-50"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileUpload(!showFileUpload)}
            disabled={remainingMessages <= 0}
            className="text-white/70 hover:text-white hover:bg-white/10 w-10 h-10 rounded-full transition-all duration-200 disabled:opacity-50"
          >
            <Paperclip size={16} />
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={disabled || !inputText.trim() || remainingMessages <= 0}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
      
      {remainingMessages <= 5 && remainingMessages > 0 && (
        <div className="text-amber-400 text-sm text-center">
          Only {remainingMessages} messages left today
        </div>
      )}
      
      {remainingMessages <= 0 && (
        <div className="text-red-400 text-sm text-center">
          Daily message limit reached. {isPremium ? 'Premium limit exceeded.' : 'Upgrade to premium for unlimited messages.'}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
