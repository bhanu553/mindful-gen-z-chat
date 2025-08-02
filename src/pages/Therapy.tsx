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
  return <>{before}<span className="therapy-question-modern">“{question.trim()}”</span>{after}</>;
}

const Therapy = () => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log('Therapy component rendered');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionInfo, setRestrictionInfo] = useState<any>(null);
  const navigate = useNavigate();
  
  // Debug sessionComplete state changes
  useEffect(() => {
    console.log('🔄 sessionComplete state changed to:', sessionComplete);
  }, [sessionComplete]);
  
  // Debug messages state changes
  useEffect(() => {
    console.log('🔄 messages state changed, current length:', messages.length);
    console.log('🔄 last message:', messages[messages.length - 1]);
  }, [messages]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user, isPremium } = useAuth();

  // Get your OpenAI API key from the environment variable. Put VITE_OPENAI_API_KEY=sk-... in a .env file in the project root (do NOT commit the .env file).
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  // In scrollToBottom, ensure smooth behavior is set
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, forceUpdate]);

  // Auto-trigger first AI message when component mounts and user is available
  useEffect(() => {
    if (user && !hasInitialized && messages.length === 0) {
      setHasInitialized(true);
      // Don't trigger first message - it should come from session loading
      console.log("🎯 Therapy page initialized, waiting for session messages");
    }
  }, [user, hasInitialized, messages.length]);

  // Add this useEffect after messages state is defined
  useEffect(() => {
    console.log('🔄 Messages changed, current length:', messages.length);
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log('🔄 Last message is from user:', lastMessage.isUser);
      if (!lastMessage.isUser && isLoading) {
        setIsLoading(false);
        console.log('🔄 Loading stopped because last message is from AI');
      }
    }
  }, [messages, isLoading]);

  // Fetch or create session and load messages on initial mount only
  useEffect(() => {
    if (user && !hasInitialized) {
      setHasInitialized(true);
      fetchSessionAndMessages();
    }
    // eslint-disable-next-line
  }, [user, hasInitialized]);

  useEffect(() => {
    console.log(`[Therapy Render #${renderCount.current}] messages:`, messages);
  });

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
      
      // Check for restriction info first
      if (data.restrictionInfo && data.restrictionInfo.isRestricted) {
        setIsRestricted(true);
        setRestrictionInfo(data.restrictionInfo);
        setSessionComplete(true);
        
        // Add restriction message as a chat message
        const restrictionMessage: Message = {
          id: 'restriction-message',
          text: `⏰ **Your Free Trial is Over**

You've completed your free therapy session. To continue your healing journey, you'll need to wait for your next free session or upgrade to premium.

**Next Free Session Available:** ${data.restrictionInfo.daysRemaining} days
${data.restrictionInfo.nextEligibleDate ? `Available on ${new Date(data.restrictionInfo.nextEligibleDate).toLocaleDateString()}` : 'Date calculation in progress...'}

**Ready to continue your healing?**
Premium: $49/month
• 8 sessions (vs 1 free)
• 3 - 4 days spacing for optimal progress
• Session continuity that builds on your breakthrough
• Personalized homework and skill development

*Therapy isn't a one-session miracle. Real change happens with consistent work.*

**Don't wait ${data.restrictionInfo.daysRemaining} days and lose momentum.**`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages([restrictionMessage]);
        return;
      }
      
      if (data.sessionComplete) {
        setSessionComplete(true);
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
    setMessages(prev => {
      const updated = [...prev, userMessage];
      console.log('[setMessages after user message]', updated);
      return updated;
    });
    console.log('User message added:', userMessage);

    try {
      // Call backend API with user context
      console.log('📤 Sending message to backend:', userInput.substring(0, 50) + '...');
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
      console.log('[AI response from /api/chat]', data);
      const aiResponse = data.reply;

      if (!aiResponse) {
        throw new Error('No response from assistant.');
      }

      console.log('🤖 AI Response received:', aiResponse.substring(0, 100) + '...');
      console.log('🤖 Full AI Response length:', aiResponse.length);

      // Add AI response to messages
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      console.log('📝 About to add AI message to state:', aiMessage);
      console.log('📝 Current messages before update:', messages);
      
      // Update messages state with the new AI message - use immediate callback
      setMessages(prev => {
        const updated = [...prev, aiMessage];
        console.log('[setMessages after AI message]', updated);
        console.log('[setMessages] Updated messages length:', updated.length);
        return updated;
      });
      
      // Force immediate re-render
      setForceUpdate(prev => prev + 1);
      
      // Ensure loading is stopped immediately
      setIsLoading(false);
      
      console.log('✅ AI message added to state:', aiMessage);
      console.log('✅ Loading state set to false');
      
      // Force multiple re-renders to ensure the message appears immediately
      setForceUpdate(prev => prev + 1);
      console.log('🔄 Force update triggered');
      
      // Additional force update after a small delay to ensure re-render
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
        console.log('🔄 Additional force update triggered');
      }, 100);
      
      console.log('🔍 Checking sessionComplete flag from backend:', data.sessionComplete);
      if (data.sessionComplete) {
        console.log('✅ Session complete detected! Setting sessionComplete state to true.');
        setSessionComplete(true);
      } else {
        console.log('❌ Session complete NOT detected from backend response.');
      }
    } catch (error: any) {
      console.error('❌ Frontend error:', error);
      // Suppress onboarding errors from user view
      const errMsg = (error.message || '').toLowerCase();
      if (errMsg.includes('onboarding')) {
        setErrorMessage(null);
      } else {
        setErrorMessage(error.message || 'Failed to get response. Please try again.');
        toast.error(error.message || 'Failed to get response. Please try again.');
      }
      // Do NOT remove the user message; keep it in the chat
      console.log('🔄 Keeping user message in chat despite error');
    } finally {
      setIsLoading(false);
      console.log('🔄 Loading stopped in finally block');
    }
  };

  // Add a function to start a new session for premium users
  const handleStartNewSession = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Call backend to create a new session and get the first AI message (with summary)
      const response = await fetch('/api/new-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to start new session.');
      const data = await response.json();
      // Clear chat and set first AI message
      setMessages([
        {
          id: Date.now().toString(),
          text: data.firstMessage,
          isUser: false,
          timestamp: new Date()
        }
      ]);
      setSessionComplete(false);
      setInputText('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to start new session.');
      toast.error(error.message || 'Failed to start new session.');
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
          <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollable-container scroll-smooth">
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
                
                {/* Session Complete Message in Chat Area - Only show if not restricted */}
                {sessionComplete && !isRestricted && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-purple-700/80 to-blue-600/80 rounded-2xl shadow-xl p-6 md:p-8 mr-4 max-w-2xl border border-white/20">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">🌟 Session Complete - What's Next?</h2>
                      <div className="text-white/90 text-left space-y-4 mb-6">
                        <p className="text-base md:text-lg">You just experienced real therapy, not just a chat. That professional structure and evidence-based approach you felt? That's what $300/session therapy delivers.</p>
                        
                        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                          <h3 className="font-semibold text-white mb-2">As a free user:</h3>
                          <ul className="text-white/80 space-y-1 text-sm">
                            <li>• Next session available in 30 days</li>
                            <li>• No continuity or progress building</li>
                            <li>• Limited breakthrough potential</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
                          <h3 className="font-semibold text-yellow-300 mb-2">Ready to continue your healing?</h3>
                          <div className="text-white/90">
                            <p className="font-semibold">Premium: $49/month</p>
                            <ul className="text-white/80 space-y-1 text-sm mt-2">
                              <li>• 8 sessions (vs 1 free)</li>
                              <li>• 3 - 4 days spacing for optimal progress</li>
                              <li>• Session continuity that builds on your breakthrough</li>
                              <li>• Personalized homework and skill development</li>
                            </ul>
                          </div>
                        </div>
                        
                        <p className="text-white/80 italic">Therapy isn't a one-session miracle. Real change happens with consistent work.</p>
                        <p className="text-yellow-300 font-semibold">Don't wait 30 days and lose momentum.</p>
                      </div>
                      
                      <button
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black font-bold rounded-xl px-6 py-3 transition-all duration-200 shadow-lg text-base md:text-lg w-full"
                        onClick={() => navigate('/premium-plan-details')}
                      >
                        Continue My Journey - $49/month
                      </button>
                      
                      {isPremium && (
                        <button
                          className="bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl px-4 py-2 mt-3 transition-all duration-200 border border-white/30 text-sm md:text-base w-full"
                          onClick={handleStartNewSession}
                          disabled={isLoading}
                        >
                          Start New Session
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input Section */}
          {!sessionComplete && !isRestricted && (
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
                    className="flex-1 min-h-[2.5rem] max-h-32 bg-transparent border-0 text-white placeholder-white/50 resize-none focus-visible:ring-0 text-sm md:text-base p-0 disabled:opacity-60"
                    disabled={isLoading}
                  />
                  
                  {/* Send Button */}
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                    className="bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Small Upgrade Button for Restricted Users */}
          {isRestricted && (
            <div className="p-4 md:p-6 border-t border-white/10">
              <div className="flex justify-center">
                <Button
                  onClick={() => navigate('/premium-plan-details')}
                  className="premium-glass border border-white/20 text-white font-bold rounded-xl px-6 py-3 transition-all duration-200 shadow-lg text-sm md:text-base hover:bg-white/10"
                >
                  Upgrade to Premium - $49/month
                </Button>
              </div>
            </div>
          )}
          
          
        </div>
      </div>
    </div>
  );
};

export default Therapy; 