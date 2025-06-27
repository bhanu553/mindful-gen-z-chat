
import { useState, useEffect } from 'react';
import { Plus, MessageCircle, Calendar, X, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

type TherapyMode = 'Reflect' | 'Recover' | 'Rebuild' | 'Evolve';

interface TherapySession {
  id: string;
  title: string;
  mode: TherapyMode;
  created_at: string;
  updated_at: string;
}

interface TherapySidebarProps {
  onSessionSelect: (session: TherapySession) => void;
  onNewSession: () => void;
  currentSessionId?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const TherapySidebar = ({ 
  onSessionSelect, 
  onNewSession, 
  currentSessionId, 
  isOpen, 
  onToggle 
}: TherapySidebarProps) => {
  const { user, isPremium } = useAuth();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);

  const modeIcons = {
    Reflect: { icon: '🟣', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    Recover: { icon: '🔵', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    Rebuild: { icon: '🟢', color: 'text-green-500', bg: 'bg-green-500/10' },
    Evolve: { icon: '🟡', color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    if (!user) return;
    
    // Check session limit for free users
    if (!isPremium && sessions.length >= 20) {
      alert('Free users can only store up to 20 sessions. Upgrade to Premium for unlimited sessions.');
      return;
    }

    onNewSession();
    onToggle(); // Close sidebar on mobile after creating new session
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Therapy Sessions</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="md:hidden text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* New Session Button */}
        <Button
          onClick={handleNewSession}
          className="w-full mt-4 bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Therapy Session
        </Button>

        {/* Session Count */}
        <div className="mt-3 text-sm text-white/70">
          {sessions.length} / {isPremium ? '∞' : '20'} sessions
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-white/70 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70 mx-auto"></div>
            <p className="mt-2">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-white/70 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No therapy sessions yet.</p>
            <p className="text-sm mt-1">Create your first session to get started!</p>
          </div>
        ) : (
          sessions.map((session) => {
            const modeData = modeIcons[session.mode];
            const isActive = currentSessionId === session.id;
            
            return (
              <div
                key={session.id}
                onClick={() => {
                  onSessionSelect(session);
                  onToggle(); // Close sidebar on mobile after selecting session
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 border-white/40 shadow-lg'
                    : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
                }`}
              >
                {/* Session Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className={`p-1.5 rounded-full ${modeData.bg}`}>
                      <span className="text-sm">{modeData.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{session.title}</h3>
                      <div className="flex items-center space-x-2 text-xs text-white/70 mt-1">
                        <span className={modeData.color}>{session.mode}</span>
                        <span>•</span>
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center text-xs text-white/60">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Updated {formatTime(session.updated_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 h-full w-80 bg-black/30 backdrop-blur-md border-r border-white/20
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {sidebarContent}
      </div>
    </>
  );
};

export default TherapySidebar;
