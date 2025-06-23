
import { useState } from 'react';
import { Plus, Send } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  disabled: boolean;
  uploadsLeft: number;
}

const ChatInput = ({ inputText, setInputText, onSendMessage, disabled, uploadsLeft }: ChatInputProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, or JPEG image.');
      return;
    }

    // Check upload limit (frontend validation)
    if (uploadsLeft <= 0) {
      alert('You have reached your daily upload limit. Upgrade to Premium for unlimited uploads.');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process (replace with actual Supabase upload later)
    setTimeout(() => {
      setIsUploading(false);
      alert('Upload successful! (Note: Actual file storage requires Supabase integration)');
      // Reset file input
      event.target.value = '';
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && inputText.trim()) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading || uploadsLeft <= 0}
          />
          <button 
            className={cn(
              "p-2 rounded-full transition-colors",
              isUploading || uploadsLeft <= 0
                ? "bg-secondary/50 cursor-not-allowed" 
                : "bg-secondary hover:bg-secondary/80"
            )}
            disabled={isUploading || uploadsLeft <= 0}
          >
            <Plus className={cn(
              "w-5 h-5",
              isUploading || uploadsLeft <= 0 
                ? "text-muted-foreground/50" 
                : "text-foreground"
            )} />
          </button>
        </div>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type something you're feeling…"
            className="w-full bg-secondary border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={disabled}
            autoFocus
          />
          <button
            onClick={onSendMessage}
            disabled={!inputText.trim() || disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-foreground">
        {uploadsLeft} uploads per day left
        {uploadsLeft <= 0 && (
          <span className="text-yellow-400 ml-2">
            - Upgrade to Premium for unlimited uploads
          </span>
        )}
      </p>
    </div>
  );
};

export default ChatInput;
