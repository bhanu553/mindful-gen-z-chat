import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Utility to highlight the last question in an AI message
function highlightTherapyQuestion(text: string): JSX.Element {
  // Find the last question mark
  const lastQ = text.lastIndexOf('?');
  if (lastQ === -1) return <>{text}</>;
  // Find the start of the last sentence (after previous period or newline)
  let start = text.lastIndexOf('.', lastQ);
  if (start === -1) start = text.lastIndexOf('\n', lastQ);
  if (start === -1) start = 0; else start += 1;
  // Extract question and before/after
  const before = text.slice(0, start);
  const question = text.slice(start, lastQ + 1);
  const after = text.slice(lastQ + 1);
  return <>{before}<span className="therapy-question">«{question.trim()}»</span>{after}</>;
}

const Therapy = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get your OpenAI API key from the environment variable. Put VITE_OPENAI_API_KEY=sk-... in a .env file in the project root (do NOT commit the .env file).
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-trigger first AI message when component mounts and user is available
  useEffect(() => {
    if (user && !hasInitialized && messages.length === 0) {
      setHasInitialized(true);
      // Don't trigger first message - it should come from session loading
      console.log("🎯 Therapy page initialized, waiting for session messages");
    }
  }, [user, hasInitialized, messages.length]);

  // Fetch or create session and load messages on mount
  useEffect(() => {
    if (user) {
      fetchSessionAndMessages();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchSessionAndMessages = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      if (!response.ok) {
        let errorMsg = 'Failed to load session.';
        try {
          const errData = await response.json();
          if (errData && errData.error) errorMsg = errData.error;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (data.sessionComplete) {
        setSessionComplete(true);
        navigate('/premium-plan-details');
        return;
      }
      // Map backend messages to local format
      setMessages(
        (data.messages || []).map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.created_at)
        }))
      );
      setSessionComplete(false);
    } catch (error: any) {
      // Suppress onboarding errors from user view
      const errMsg = (error.message || '').toLowerCase();
      if (errMsg.includes('onboarding')) {
        setErrorMessage(null);
      } else {
        setErrorMessage(error.message || 'Failed to load session.');
        toast.error(error.message || 'Failed to load session.');
      }
    } finally {
      setIsLoading(false);
    }
  };



  const handleSendMessage = async () => {
    if (!inputText?.trim() || sessionComplete) return;

    const userInput = inputText.trim();
    setInputText('');
    setIsLoading(true);
    setErrorMessage(null);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call backend API with user context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userInput,
          userId: user?.id,
          isFirstMessage: false
        })
      });

      if (!response.ok) {
        let errorMsg = 'Failed to get response. Please try again.';
        try {
          const errData = await response.json();
          if (errData && errData.error) errorMsg = errData.error;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const aiResponse = data.reply;

      if (!aiResponse) {
        throw new Error('No response from assistant.');
      }

      // Add AI response to messages
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      if (data.sessionComplete) {
        setSessionComplete(true);
        toast.info('Your free session is now complete. Upgrade to continue.');
        setTimeout(() => navigate('/premium-plan-details'), 2000);
      }
    } catch (error: any) {
      console.error('Error:', error);
      // Suppress onboarding errors from user view
      const errMsg = (error.message || '').toLowerCase();
      if (errMsg.includes('onboarding')) {
        setErrorMessage(null);
      } else {
        setErrorMessage(error.message || 'Failed to get response. Please try again.');
        toast.error(error.message || 'Failed to get response. Please try again.');
      }
      // Do NOT remove the user message; keep it in the chat
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-screen background */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url('/lovable-uploads/815cbe7d-545b-4277-830c-a3d5d45a18f5.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Black to blue gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/40 to-purple-900/30" />
      
      {/* Centered Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        
        
        {/* Main Chat Container */}
        <div className="w-full max-w-5xl h-[90vh] md:h-[85vh] premium-glass rounded-3xl flex flex-col">
          
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollable-container">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-white/70">
                  <p className="text-xl md:text-2xl mb-2 font-serif">Your therapeutic session begins now</p>
                  <p className="text-base md:text-lg text-white/50">What's the most important emotional challenge you're ready to work on today?</p>
                  {isLoading && (
                    <div className="mt-4 flex justify-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  )}
                  {errorMessage && (
                    <div className="mt-4 text-red-400 text-sm font-semibold">{errorMessage}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-2xl ${message.isUser ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`p-4 md:p-5 rounded-2xl backdrop-blur-sm ${
                          message.isUser
                            ? 'bg-white/15 border border-white/20 text-white ml-4'
                            : 'bg-black/20 border border-white/10 text-white/95 mr-4'
                        }`}
                      >
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {message.isUser ? message.text : highlightTherapyQuestion(message.text)}
                        </p>
                        <p className="text-xs text-white/50 mt-2">
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-black/20 border border-white/10 text-white/95 p-4 md:p-5 rounded-2xl backdrop-blur-sm mr-4 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {errorMessage && (
                  <div className="flex justify-start">
                    <div className="bg-red-900/80 border border-red-400/40 text-white/95 p-4 md:p-5 rounded-2xl backdrop-blur-sm mr-4 max-w-2xl">
                      <div className="text-red-200 font-semibold">{errorMessage}</div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input Section */}
          <div className="p-8 md:p-10 border-t border-white/10">
            <div className="relative">
              <div className="premium-glass rounded-2xl border border-white/20 p-4 flex items-end space-x-3">
                
                {/* Text Input */}
                <Textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts..."
                  className="flex-1 min-h-[2.5rem] max-h-32 bg-transparent border-0 text-white placeholder-white/50 resize-none focus-visible:ring-0 text-sm md:text-base p-0"
                  disabled={isLoading || sessionComplete}
                />
                
                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading || sessionComplete}
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </Button>
              </div>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Therapy; 