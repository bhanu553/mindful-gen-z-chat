import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: string;
  created_at: string;
  mode: string;
  sentiment_score: number;
  session_id: string;
  user_id: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
  current_mode: string;
  message_count: number;
  user_id: string;
}

const SessionView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) return;

      try {
        // Fetch session details
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          return;
        }

        setSession(sessionData);

        // Fetch session messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          return;
        }

        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(/lovable-uploads/35a62b57-2cb9-4669-988d-d33156872a1d.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 z-0" />
        
        <div className="relative z-10">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="premium-glass rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="animate-pulse">
                <div className="h-8 bg-white/10 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-white/10 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Therapeutic Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(/lovable-uploads/35a62b57-2cb9-4669-988d-d33156872a1d.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 z-0" />
      
      <div className="relative z-10">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="premium-glass rounded-3xl p-6 border border-white/20 shadow-2xl mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-2xl font-serif text-white">
                    {session?.title || 'Session History'}
                  </h1>
                  <div className="flex items-center text-white/60 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {session?.created_at && formatTimestamp(session.created_at)}
                  </div>
                </div>
              </div>
              <div className="text-white/60 text-sm">
                {messages.length} messages
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="premium-glass rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 mr-2 text-white/70" />
                        ) : (
                          <div className="w-4 h-4 mr-2 rounded-full bg-white/30"></div>
                        )}
                        <span className="text-xs text-white/60">
                          {formatTimestamp(message.created_at)}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60">No messages found in this session.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionView; 