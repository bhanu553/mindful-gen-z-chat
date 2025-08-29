import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Clock, CreditCard } from 'lucide-react';
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
  return <>{before}<span className="therapy-question-modern">"{question.trim()}"</span>{after}</>;
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
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string>('');
  const [countdownTime, setCountdownTime] = useState({ minutes: 10, seconds: 0 });
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
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
  
     // 🔧 COMPLETELY REBUILT: Live cooldown timer linked to backend ended_at and cooldown_until
   useEffect(() => {
     console.log('⏰ Countdown timer useEffect triggered');
     console.log('⏰ sessionComplete:', sessionComplete);
     console.log('⏰ restrictionInfo?.cooldownEndsAt:', restrictionInfo?.cooldownEndsAt);
     
     // Clear any existing timer first
     if (timerInterval) {
       clearInterval(timerInterval);
       setTimerInterval(null);
     }
     
     if (!sessionComplete || !restrictionInfo?.cooldownEndsAt) {
       console.log('⏰ Countdown timer not started - missing required conditions');
       return;
     }
     
     console.log('⏰ Starting live countdown timer linked to backend cooldown_until');
     
     // Store cooldown end time in localStorage for persistence
     localStorage.setItem('cooldownEndTime', restrictionInfo.cooldownEndsAt);
     
     // 🔧 FIXED: Proper timer calculation function that uses backend cooldown_until time
     const calculateTimeRemaining = () => {
       try {
         const now = new Date().getTime();
         const cooldownEndTime = new Date(restrictionInfo.cooldownEndsAt).getTime();
         
         // Validate the timestamp
         if (isNaN(cooldownEndTime)) {
           console.error('❌ Invalid cooldown end time from backend:', restrictionInfo.cooldownEndsAt);
           setCountdownTime({ minutes: 0, seconds: 0 });
           return;
         }
         
         const difference = cooldownEndTime - now;
         
         console.log('⏰ Backend-linked countdown calculation:', {
           now: new Date(now).toISOString(),
           backendCooldownUntil: new Date(cooldownEndTime).toISOString(),
           difference: difference,
           minutes: Math.floor((difference / (1000 * 60)) % 60),
           seconds: Math.floor((difference / (1000)) % 60)
         });
         
         if (difference <= 0) {
           console.log('⏰ Backend cooldown completed - setting to 00:00');
           setCountdownTime({ minutes: 0, seconds: 0 });
           localStorage.removeItem('cooldownEndTime');
           
           // Clear the timer
           if (timerInterval) {
             clearInterval(timerInterval);
             setTimerInterval(null);
           }
           
           // Auto-start new session when countdown completes
           console.log('⏰ Backend cooldown completed - checking session gate');
           setTimeout(() => {
             if (typeof checkSessionGate === 'function') {
               checkSessionGate();
             } else {
               console.log('⚠️ checkSessionGate not available yet, will retry on next render');
             }
           }, 100);
           return;
         }
         
         const minutes = Math.floor((difference / (1000 * 60)) % 60);
         const seconds = Math.floor((difference / (1000)) % 60);
         
         console.log(`⏰ Setting countdown to: ${minutes}:${seconds.toString().padStart(2, '0')} (from backend cooldown_until)`);
         setCountdownTime({ minutes, seconds });
       } catch (error) {
         console.error('❌ Error in backend-linked countdown calculation:', error);
         setCountdownTime({ minutes: 0, seconds: 0 });
       }
     };
     
     // Calculate immediately
     calculateTimeRemaining();
     
     // Update every second and store interval reference
     const interval = setInterval(calculateTimeRemaining, 1000);
     setTimerInterval(interval);
     
     console.log('⏰ Backend-linked countdown timer interval set up with ID:', interval);
     
     return () => {
       console.log('⏰ Cleaning up backend-linked countdown timer interval:', interval);
       clearInterval(interval);
       setTimerInterval(null);
     };
   }, [sessionComplete, restrictionInfo?.cooldownEndsAt, timerInterval]);
  
     // 🔧 REBUILT: Restore countdown from localStorage on page load with proper backend timestamp handling
   useEffect(() => {
     const savedCooldownEndTime = localStorage.getItem('cooldownEndTime');
     if (savedCooldownEndTime) {
       const now = new Date().getTime();
       const backendCooldownUntil = new Date(savedCooldownEndTime).getTime();
       const difference = backendCooldownUntil - now;
       
       if (difference > 0) {
         console.log('⏰ Restoring cooldown from localStorage - backend time remaining:', difference);
         console.log('⏰ Backend cooldown_until:', new Date(savedCooldownEndTime).toISOString());
         
         // Cooldown is still active, restore the state with backend timestamp
         setSessionComplete(true);
         setIsRestricted(true);
         setRestrictionInfo({
           type: 'cooldown',
           message: 'Session complete - cooldown active (restored from backend)',
           cooldownRemaining: { minutes: 0, seconds: 0 },
           cooldownEndsAt: savedCooldownEndTime // This is the backend cooldown_until timestamp
         });
         
         // Calculate initial countdown time from backend timestamp
         const minutes = Math.floor((difference / (1000 * 60)) % 60);
         const seconds = Math.floor((difference / (1000)) % 60);
         setCountdownTime({ minutes, seconds });
         
         console.log('⏰ Backend cooldown state restored - timer will start automatically from backend cooldown_until');
       } else {
         // Backend cooldown has expired, clean up
         console.log('⏰ Backend cooldown expired, cleaning up localStorage');
         localStorage.removeItem('cooldownEndTime');
       }
     }
   }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // OpenAI API calls are handled by the backend - no client-side API keys needed

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
       // Check session gate to determine current state
       checkSessionGate();
       console.log("🎯 Therapy page initialized, checking session gate");
     }
   }, [user, hasInitialized, messages.length]);

   // Auto-check session gate when component mounts to handle edge cases
   useEffect(() => {
     if (user && hasInitialized) {
       // Check if we're in a cooldown or payment state that needs verification
       if (sessionComplete || isRestricted) {
         console.log('🔄 Auto-checking session gate for existing state');
         setTimeout(() => {
           checkSessionGate();
         }, 1000); // Small delay to ensure component is fully mounted
       }
     }
   }, [user, hasInitialized, sessionComplete, isRestricted]);

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

  // Handle countdown completion
  useEffect(() => {
    if (countdownCompleted) {
      setCountdownCompleted(false);
      // Check session gate to see if we can start a new session
      checkSessionGate();
    }
  }, [countdownCompleted]);

  // 🔧 NEW: Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        console.log('⏰ Component unmounting - cleaning up timer');
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    };
  }, [timerInterval]);

  // 🔧 NEW: Ensure timer starts immediately when backend session completes
  const startBackendLinkedTimer = (cooldownEndTime: string) => {
    console.log('⏰ Starting backend-linked timer with cooldown_until:', cooldownEndTime);
    
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Calculate initial time from backend timestamp
    const now = new Date().getTime();
    const backendCooldownUntil = new Date(cooldownEndTime).getTime();
    const difference = backendCooldownUntil - now;
    
    if (difference > 0) {
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / (1000)) % 60);
      setCountdownTime({ minutes, seconds });
      
      console.log(`⏰ Backend-linked timer started: ${minutes}:${seconds.toString().padStart(2, '0')}`);
      
      // Store in localStorage for persistence
      localStorage.setItem('cooldownEndTime', cooldownEndTime);
    } else {
      console.log('⏰ Backend cooldown already expired');
      setCountdownTime({ minutes: 0, seconds: 0 });
    }
  };

  // Check session gate before allowing new sessions
  const checkSessionGate = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/session-gate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

             if (response.ok && data.canStart) {
         // User can start new session
         console.log('✅ Session gate passed - can start new session');
         setSessionComplete(false);
         setIsRestricted(false);
         setRestrictionInfo(null);
         setMessages([]);
         setHasInitialized(false);
         setForceUpdate(prev => prev + 1);
         
         // Show session summary if available
         if (data.sessionSummary) {
           const summaryMessage: Message = {
             id: 'session-summary',
             text: `✅ **Your New Session Has Started!**

Here's a quick summary of your last session:

${data.sessionSummary}

I'm here to continue supporting you on your healing journey. What would you like to work on today?`,
             isUser: false,
             timestamp: new Date()
           };
           setMessages([summaryMessage]);
         } else if (data.firstMessage) {
           const firstMessage: Message = {
             id: 'session-first-message',
             text: data.firstMessage,
             isUser: false,
             timestamp: new Date()
           };
           setMessages([firstMessage]);
         }
       } else {
         // User cannot start new session (cooldown or payment required)
         console.log('❌ Session gate blocked:', data.reason);
         if (data.reason === 'Cooldown active') {
           // Still in cooldown
           setSessionComplete(true);
           setIsRestricted(true);
           setRestrictionInfo({
             type: 'cooldown',
             message: data.message,
             cooldownRemaining: data.cooldownRemaining,
             cooldownEndsAt: data.cooldownEndsAt
           });
         } else if (data.reason === 'Payment required') {
           // Payment required - cooldown is over but payment needed
           setSessionComplete(false); // Allow new session after payment
           setIsRestricted(true);
           setRestrictionInfo({
             type: 'payment',
             message: data.message,
             paymentAmount: data.paymentAmount
           });
           
           // Show payment required message
           const paymentMessage: Message = {
             id: 'payment-required',
             text: `💳 **Payment Required**

Your cooldown period has ended! To continue your therapeutic journey, please complete payment for your next session.

**Session Cost:** $${data.paymentAmount || 5.99}

Click "Pay Now" below to proceed.`,
             isUser: false,
             timestamp: new Date()
           };
           setMessages([paymentMessage]);
         }
       }
    } catch (error) {
      console.error('❌ Error checking session gate:', error);
    }
  };

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
      
      console.log('🔍 Session API response:', {
        sessionComplete: data.sessionComplete,
        hasMessages: data.messages && data.messages.length > 0,
        messageCount: data.messages ? data.messages.length : 0,
        hasFirstMessage: !!data.firstMessage,
        hasExistingHistory: data.hasExistingHistory
      });
      
      // 🔧 CRITICAL FIX: PRIORITY 1 - Always load existing messages first if they exist
      if (data.messages && data.messages.length > 0) {
        console.log(`✅ Found ${data.messages.length} existing messages - loading them FIRST`);
        
        // Map backend messages to local format with proper error handling
        const existingMessages = data.messages.map((msg: any) => {
          try {
            return {
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              text: msg.content || msg.text || '',
              isUser: msg.role === 'user',
              timestamp: msg.created_at ? new Date(msg.created_at) : new Date()
            };
          } catch (mapError) {
            console.error('❌ Error mapping message:', mapError, msg);
            // Return a safe fallback message
            return {
              id: `fallback-${Date.now()}`,
              text: msg.content || msg.text || 'Message content unavailable',
              isUser: msg.role === 'user',
              timestamp: new Date()
            };
          }
        }).filter(msg => msg.text && msg.text.trim() !== ''); // Filter out empty messages
        
        console.log(`✅ Successfully mapped ${existingMessages.length} messages for chat history preservation`);
        
        // Always set messages to preserve chat history, regardless of other conditions
        setMessages(existingMessages);
        setSessionComplete(false);
        
        // If we have existing messages, we don't need to show firstMessage or sessionComplete
        console.log('✅ Chat history preserved - returning early to prevent overwriting');
        return;
      }
      
      // 🔧 CRITICAL FIX: PRIORITY 2 - Check for restriction info if no existing messages
      if (data.restrictionInfo && data.restrictionInfo.isRestricted) {
        console.log('🚫 User is restricted - showing restriction message only');
        console.log('🔍 Restriction details:', {
          type: data.restrictionInfo.type || 'cooldown',
          minutesRemaining: data.restrictionInfo.minutesRemaining,
          cooldownEndsAt: data.restrictionInfo.cooldownEndsAt
        });
        setIsRestricted(true);
        setRestrictionInfo(data.restrictionInfo);
        setSessionComplete(true);
        
        // Clean, minimal cooldown message
        const restrictionText = `⏰ **Session Complete**

Your therapy session has concluded. A brief integration period allows your insights to settle.

**Next session available in:** ${data.restrictionInfo.minutesRemaining || 10} minutes

Ready to continue? Click "Pay Now" below to secure your next session.`;
        
        const restrictionMessage: Message = {
          id: 'restriction-message',
          text: restrictionText,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages([restrictionMessage]);
        return;
      }
      
      // 🔧 CRITICAL FIX: PRIORITY 3 - Handle users with firstMessage (both premium and free)
      if (data.firstMessage) {
        console.log(`✅ User - displaying first message from session_first_message`);
        const firstMessage: Message = {
          id: 'session-first-message',
          text: data.firstMessage,
          isUser: false,
          timestamp: new Date()
        };
        setMessages([firstMessage]);
        setSessionComplete(false);
        return;
      }
      
      // 🔧 CRITICAL FIX: PRIORITY 4 - Handle session complete if no existing messages
      if (data.sessionComplete) {
        console.log('✅ Session complete detected! Setting sessionComplete state to true.');
        setSessionComplete(true);
        
        // 🔧 FIXED: Use backend ended_at and cooldown_until timestamps
        const backendEndedAt = data.ended_at || new Date().toISOString();
        const backendCooldownUntil = data.cooldown_until || new Date(Date.now() + (10 * 60 * 1000)).toISOString();
        
        console.log('⏰ Backend timestamps:', {
          ended_at: backendEndedAt,
          cooldown_until: backendCooldownUntil
        });
        
        // Clean, minimal session end message
        const sessionEndMessage: Message = {
          id: 'session-end',
          text: `⏰ **Session Complete**

Your therapy session has concluded. A brief integration period allows your insights to settle.

**Next session available in:** 10 minutes

Ready to continue? Click "Pay Now" below to secure your next session.`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages([sessionEndMessage]);
        setIsRestricted(true);
        setRestrictionInfo({
          type: 'cooldown',
          message: 'Session complete - 10-minute cooldown active (backend-linked)',
          cooldownRemaining: { minutes: 10, seconds: 0 },
          cooldownEndsAt: backendCooldownUntil // Use backend cooldown_until timestamp
        });
        
        // 🔧 FIXED: Use the new backend-linked timer function
        startBackendLinkedTimer(backendCooldownUntil);
        return;
      }
      
      // 🔧 CRITICAL FIX: PRIORITY 5 - Fallback for new sessions with no messages
      console.log('⚠️ No existing messages, firstMessage, or sessionComplete - this is a new session');
      // For new sessions, show a welcome message
      const welcomeMessage: Message = {
        id: 'welcome-message',
        text: 'Welcome to your therapy session! I\'m here to support you on your healing journey. How are you feeling today?',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
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
      
      // Check if AI response contains session end marker
      const sessionEndMarker = aiResponse.toLowerCase().includes('see you in our next session');
      console.log('🔍 Checking for session end marker in AI response:', sessionEndMarker);
      
      if (data.sessionComplete || sessionEndMarker) {
        console.log('✅ Session complete detected! Setting sessionComplete state to true immediately.');
        setSessionComplete(true);
        setIsRestricted(true);
        
                 // CRITICAL FIX: Use cooldown info from backend if available
         if (data.cooldownInfo && data.cooldownInfo.cooldownEndTime) {
           console.log('✅ Backend provided cooldown info:', data.cooldownInfo);
           
           // Show "Session Ended" message first
           const sessionEndedMessage: Message = {
             id: 'session-ended-notification',
             text: '🌟 **Session Ended**\n\nYour therapy session has concluded. Take time to reflect on today\'s insights.',
             isUser: false,
             timestamp: new Date()
           };
           
           // Add the session ended message
           setMessages(prev => [...prev, sessionEndedMessage]);
           
           // Then add cooldown message with backend info
           setTimeout(() => {
             const cooldownMessage: Message = {
               id: 'session-end',
               text: `⏰ **Session Complete**

Your therapy session has concluded. A brief integration period allows your insights to settle.

**Next session available in:** ${data.cooldownInfo.timeRemaining.minutes}:${data.cooldownInfo.timeRemaining.seconds.toString().padStart(2, '0')}

Ready to continue? Click "Pay Now" below to secure your next session.`,
               isUser: false,
               timestamp: new Date()
             };
             
             setRestrictionInfo({
               type: 'cooldown',
               message: data.cooldownInfo.message,
               cooldownRemaining: data.cooldownInfo.timeRemaining,
               cooldownEndsAt: data.cooldownInfo.cooldownEndTime
             });
             
             // Initialize countdown timer immediately
             const now = new Date().getTime();
             const endTime = new Date(data.cooldownInfo.cooldownEndTime).getTime();
             const difference = endTime - now;
             
             console.log('⏰ Frontend countdown initialization:');
             console.log(`   - Current time: ${new Date(now).toISOString()}`);
             console.log(`   - Cooldown end time: ${data.cooldownInfo.cooldownEndTime}`);
             console.log(`   - Time difference: ${difference}ms`);
             
             if (difference > 0) {
               const minutes = Math.floor((difference / (1000 * 60)) % 60);
               const seconds = Math.floor((difference / (1000)) % 60);
               console.log(`   - Setting countdown to: ${minutes}:${seconds.toString().padStart(2, '0')}`);
               setCountdownTime({ minutes, seconds });
             } else {
               console.log('   - Cooldown has already expired, setting to 00:00');
               setCountdownTime({ minutes: 0, seconds: 0 });
             }
             
             // CRITICAL: Set session complete state to trigger countdown timer
             setSessionComplete(true);
             
             // CRITICAL: Set restrictionInfo BEFORE the countdown timer useEffect runs
             setRestrictionInfo({
               type: 'cooldown',
               message: data.cooldownInfo.message,
               cooldownRemaining: data.cooldownInfo.timeRemaining,
               cooldownEndsAt: data.cooldownInfo.cooldownEndTime
             });
             
             // CRITICAL: Set restricted state to trigger countdown timer
             setIsRestricted(true);
             
             // 🔧 FIXED: Ensure timer starts immediately with proper state
             setCountdownTime({ minutes: 10, seconds: 0 });
             
             setMessages(prev => [...prev, cooldownMessage]);
           }, 2000); // 2 second delay to show session ended message first
        } else {
          // Fallback: Use default cooldown logic
          console.log('⚠️ No backend cooldown info - using fallback logic');
          
          // Show "Session Ended" message first
          const sessionEndedMessage: Message = {
            id: 'session-ended-notification',
            text: '🌟 **Session Ended**\n\nYour therapy session has concluded. Take time to reflect on today\'s insights.',
            isUser: false,
            timestamp: new Date()
          };
          
          // Add the session ended message
          setMessages(prev => [...prev, sessionEndedMessage]);
          
          // Then add cooldown/restriction message after a brief delay
          setTimeout(() => {
                         // Clean, minimal fallback cooldown message
             const cooldownMessage: Message = {
               id: 'session-end',
               text: `⏰ **Session Complete**

Your therapy session has concluded. A brief integration period allows your insights to settle.

**Next session available in:** 10 minutes

Ready to continue? Click "Pay Now" below to secure your next session.`,
               isUser: false,
               timestamp: new Date()
             };
            
            const cooldownEndTime = new Date(Date.now() + (10 * 60 * 1000)).toISOString();
            
            // CRITICAL: Set restrictionInfo for fallback case
            setRestrictionInfo({
              type: 'cooldown',
              message: 'Session complete - 10-minute cooldown active',
              cooldownRemaining: { minutes: 10, seconds: 0 },
              cooldownEndsAt: cooldownEndTime
            });
            
            // Initialize countdown timer immediately for fallback case
            setCountdownTime({ minutes: 10, seconds: 0 });
            
            // CRITICAL: Set session complete state for fallback case
            setSessionComplete(true);
            
            // 🔧 FIXED: Ensure timer starts immediately for fallback case
            setCountdownTime({ minutes: 10, seconds: 0 });
            
            setMessages(prev => [...prev, cooldownMessage]);
            setIsRestricted(true);
          }, 2000); // 2 second delay to show session ended message first
        }
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

     // Handle session unlock after payment completion
   const handleSessionUnlock = (sessionData: any) => {
     console.log('🔓 Session unlocked with data:', sessionData);
     
     // Clear cooldown state and localStorage
     setSessionComplete(false);
     setIsRestricted(false);
     setRestrictionInfo(null);
     localStorage.removeItem('cooldownEndTime');
     
     // 🔧 FIXED: Clear timer state
     if (timerInterval) {
       clearInterval(timerInterval);
       setTimerInterval(null);
     }
     setCountdownTime({ minutes: 10, seconds: 0 });
     
     // Show session summary if available
     if (sessionData.sessionSummary) {
       setSessionSummary(sessionData.sessionSummary);
       const summaryMessage: Message = {
         id: 'session-summary',
         text: `✅ **Your New Session Has Started!**

Here's a quick summary of your last session:

${sessionData.sessionSummary}

I'm here to continue supporting you on your healing journey. What would you like to work on today?`,
         isUser: false,
         timestamp: new Date()
       };
       setMessages([summaryMessage]);
     } else {
       // Show welcome message for new session
       const welcomeMessage: Message = {
         id: 'new-session-welcome',
         text: sessionData.firstMessage || "🌟 **Welcome to Your New Therapy Session**\n\nI'm here to support you on your healing journey. What would you like to work on today?",
         isUser: false,
         timestamp: new Date()
       };
       setMessages([welcomeMessage]);
     }
     
     // Reset initialization state
     setHasInitialized(false);
     setForceUpdate(prev => prev + 1);
   };

   // Handle payment completion and session unlock
   const handlePaymentCompletion = async () => {
     console.log('💳 Payment completed - checking session gate');
     setIsLoading(true);
     
     try {
       // Check session gate to see if we can start a new session
       const response = await fetch('/api/session-gate', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ userId: user?.id }),
       });

       const data = await response.json();

       if (response.ok && data.canStart) {
         // Payment successful - unlock session
         console.log('✅ Payment successful - session unlocked');
         handleSessionUnlock(data);
         toast.success('Payment successful! Your new session is ready.');
       } else {
         // Payment failed or other issue
         console.log('❌ Payment completion issue:', data.reason);
         if (data.reason === 'Payment required') {
           toast.error('Payment verification failed. Please try again or contact support.');
         } else {
           toast.error('Unable to start session. Please try again.');
         }
       }
     } catch (error) {
       console.error('❌ Error handling payment completion:', error);
       toast.error('Payment verification failed. Please refresh and try again.');
     } finally {
       setIsLoading(false);
     }
   };

   // Handle payment failure
   const handlePaymentFailure = (error: string) => {
     console.error('❌ Payment failed:', error);
     toast.error('Payment failed. Please try again or contact support.');
     
     // Show payment retry message
     const retryMessage: Message = {
       id: 'payment-retry',
       text: `❌ **Payment Failed**

We couldn't process your payment. This could be due to:
• Insufficient funds
• Card declined
• Network issues

Please try again or contact support if the problem persists.`,
       isUser: false,
       timestamp: new Date()
     };
     
     setMessages(prev => [...prev, retryMessage]);
   };

  // Handle errors from cooldown component
  const handleCooldownError = (error: string) => {
    console.error('❌ Cooldown error:', error);
    toast.error(error);
  };

  // Add a function to start a new session using the session gate
  const handleStartNewSession = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Call the session gate to check eligibility and create session
      const response = await fetch('/api/session-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start new session.');
      }
      
      const data = await response.json();
      
      if (data.canStart) {
        // Clear chat and set first AI message
        const messages = [
          {
            id: Date.now().toString(),
            text: data.firstMessage,
            isUser: false,
            timestamp: new Date()
          }
        ];
        
        // Add session summary if available
        if (data.sessionSummary) {
          messages.unshift({
            id: (Date.now() - 1).toString(),
            text: `✅ **Your new session has started. Here's a quick summary of your last session:**\n\n${data.sessionSummary}`,
            isUser: false,
            timestamp: new Date()
          });
        }
        
        setMessages(messages);
        setSessionComplete(false);
        setIsRestricted(false);
        setInputText('');
        
        // 🔧 FIXED: Clear timer state when starting new session
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
        setCountdownTime({ minutes: 10, seconds: 0 });
        
        toast.success(data.message || 'Session started successfully!');
      } else {
        throw new Error(data.message || 'Cannot start session at this time.');
      }
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
           <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scrollable-container scroll-smooth">
             {messages.length === 0 ? (
               <div className="h-full flex items-center justify-center">
                 <div className="text-center text-white/70">
                   <p className="text-lg md:text-xl lg:text-2xl mb-2 font-serif">Your therapeutic session begins now</p>
                   <p className="text-sm md:text-base lg:text-lg text-white/50">What's the most important emotional challenge you're ready to work on today?</p>
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
                               <div className="space-y-4 md:space-y-6">
                  {messages.map((message) => {
                    // Check if this is a cooldown/restriction message that should be centered
                    const isCooldownMessage = message.id === 'session-end' || 
                                            message.id === 'restriction-message' || 
                                            message.id === 'session-ended-notification';
                    
                    return (
                      <div key={message.id} className={`flex w-full ${isCooldownMessage ? 'justify-center' : (message.isUser ? 'justify-end' : 'justify-start')}`}>
                        <div className={`max-w-[90%] md:max-w-[85%] lg:max-w-2xl ${message.isUser ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`p-3 md:p-4 lg:p-5 rounded-2xl backdrop-blur-sm ${
                              message.isUser
                                ? 'bg-white/15 border border-white/20 text-white ml-2 md:ml-4'
                                : 'bg-black/20 border border-white/10 text-white/95 mr-2 md:mr-4'
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
                    );
                  })}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-black/20 border border-white/10 text-white/95 p-3 md:p-4 lg:p-5 rounded-2xl backdrop-blur-sm mr-2 md:mr-4 max-w-2xl">
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
                    <div className="bg-red-900/80 border border-red-400/40 text-white/95 p-3 md:p-4 lg:p-5 rounded-2xl backdrop-blur-sm mr-2 md:mr-4 max-w-2xl">
                      <div className="text-red-200 font-semibold">{errorMessage}</div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
                     {/* Input Section or Cooldown Timer */}
           {!sessionComplete && !isRestricted ? (
             <div className="p-4 md:p-8 lg:p-10 border-t border-white/10">
               <div className="relative">
                 <div className="premium-glass rounded-2xl border border-white/20 p-3 md:p-4 flex items-end space-x-2 md:space-x-3">
                   
                   {/* Text Input */}
                   <Textarea
                     ref={inputRef}
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     onKeyPress={handleKeyPress}
                     placeholder="Share your thoughts..."
                     className="flex-1 min-h-[44px] max-h-32 bg-transparent border-0 text-white placeholder-white/50 resize-none focus-visible:ring-0 text-sm md:text-base p-0 disabled:opacity-60"
                     disabled={isLoading}
                   />
                   
                   {/* Send Button */}
                   <Button
                     onClick={handleSendMessage}
                     disabled={!inputText.trim() || isLoading}
                     className="bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl p-2 md:p-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
                   >
                     <Send size={18} className="md:w-5 md:h-5" />
                   </Button>
                 </div>
               </div>
             </div>
           ) : sessionComplete ? (
             /* Premium Cooldown Timer - Clean Design */
             <div className="p-4 md:p-8 lg:p-10 border-t border-white/10">
               <div className="flex flex-col items-center justify-center space-y-6">
                 {/* 🔧 FIXED: Live Timer with proper formatting */}
                 <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20">
                   <Clock className="w-6 h-6 text-blue-400" />
                   <span className="text-3xl font-mono font-bold text-white">
                     {countdownTime.minutes.toString().padStart(2, '0')}:{countdownTime.seconds.toString().padStart(2, '0')}
                   </span>
                 </div>
                 
                 {/* 🔧 NEW: Timer status indicator */}
                 <div className="text-center text-white/70 text-sm">
                   {countdownTime.minutes === 0 && countdownTime.seconds === 0 
                     ? 'Session ready to start!' 
                     : 'Next session available in'}
                 </div>
                 
                 {/* Pay Button - Centered and Bigger */}
                 <Button 
                   onClick={() => navigate('/premium-plan-details')}
                   className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-6 rounded-2xl font-semibold text-lg"
                 >
                   <CreditCard className="w-6 h-6 mr-3" />
                   Pay Now
                 </Button>
               </div>
             </div>
           ) : null}
        </div>
      </div>
    </div>
  );
};

export default Therapy;