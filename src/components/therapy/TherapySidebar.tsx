
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface TherapySession {
  id: string;
  title: string;
  mode: string;
  created_at: string;
  updated_at: string;
}

interface TherapySidebarProps {
  onSessionSelect: (session: TherapySession) => void;
  currentSessionId?: string;
}

const TherapySidebar: React.FC<TherapySidebarProps> = ({ onSessionSelect, currentSessionId }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching sessions:', error);
        toast.error('Failed to load therapy sessions');
        return;
      }

      // Transform data to match interface
      const transformedData = (data || []).map(session => ({
        id: session.id,
        title: session.title,
        mode: session.mode,
        created_at: session.created_at,
        updated_at: session.updated_at
      }));

      setSessions(transformedData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load therapy sessions');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert({
          user_id: user.id,
          mode: 'Reflect' as const,
          title: 'New Session'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        toast.error('Failed to create new session');
        return;
      }

      const newSession: TherapySession = {
        id: data.id,
        title: data.title,
        mode: data.mode,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setSessions(prev => [newSession, ...prev]);
      onSessionSelect(newSession);
      toast.success('New therapy session created');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create new session');
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;

    try {
      // First delete all messages for this session
      const { error: messagesError } = await supabase
        .from('therapy_messages')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        toast.error('Failed to delete session messages');
        return;
      }

      // Then delete the session
      const { error } = await supabase
        .from('therapy_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting session:', error);
        toast.error('Failed to delete session');
        return;
      }

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session deleted');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const startEditing = (session: TherapySession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveTitle = async (sessionId: string) => {
    if (!user || !editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ title: editTitle.trim() })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating title:', error);
        toast.error('Failed to update title');
        return;
      }

      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: editTitle.trim() }
          : session
      ));
      setEditingId(null);
      setEditTitle('');
      toast.success('Title updated');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className={`fixed left-0 top-0 h-full z-[60] transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Sidebar */}
      <div className="h-full glass-effect border-r border-white/20 backdrop-blur-md flex flex-col bg-black/30 lg:bg-black/20">
        {/* Header - Mobile Optimized */}
        <div className="p-3 lg:p-4 border-b border-white/20 flex items-center justify-between min-h-[60px]">
          {!isCollapsed && (
            <h2 className="text-white font-semibold text-base lg:text-lg tracking-wide">
              Therapy Sessions
            </h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white/80 hover:text-white hover:bg-white/10 flex-shrink-0 w-8 h-8 lg:w-auto lg:h-auto rounded-full"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        {!isCollapsed && (
          <>
            {/* New Session Button - Mobile Responsive */}
            <div className="p-3 lg:p-4 border-b border-white/20">
              <Button
                onClick={createNewSession}
                className="w-full bg-primary/80 hover:bg-primary text-white border border-white/20 h-10 lg:h-11 text-sm lg:text-base font-medium min-w-0 transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate">New Therapy</span>
              </Button>
            </div>

            {/* Sessions List with Enhanced Mobile Scrolling */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 lg:p-4 space-y-2 max-h-[calc(100vh-140px)] lg:max-h-none scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {loading ? (
                <div className="text-white/60 text-center py-8 text-sm lg:text-base">
                  Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-white/60 text-center py-8 px-2 text-sm lg:text-base">
                  No therapy sessions yet. Click + to begin.
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group p-3 lg:p-3 rounded-lg cursor-pointer transition-all duration-200 border animate-fade-in ${
                        currentSessionId === session.id
                          ? 'bg-white/20 border-white/40 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                      }`}
                      onClick={() => onSessionSelect(session)}
                    >
                      {editingId === session.id ? (
                        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-white/10 border-white/20 text-white text-sm h-8 lg:h-9"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(session.id);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            autoFocus
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => saveTitle(session.id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-7"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                              className="text-white/80 hover:text-white text-xs px-3 py-1 h-7"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium text-sm lg:text-sm truncate mb-1 leading-tight">
                                {session.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <p className="text-white/60 text-xs">
                                  {formatDate(session.created_at)}
                                </p>
                                {/* Mode indicator dot */}
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  session.mode === 'Reflect' ? 'bg-purple-400' :
                                  session.mode === 'Recover' ? 'bg-blue-400' :
                                  session.mode === 'Rebuild' ? 'bg-green-400' :
                                  'bg-yellow-400'
                                }`} />
                              </div>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(session);
                                }}
                                className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-6 w-6 rounded-md"
                              >
                                <Edit2 size={11} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 h-6 w-6 rounded-md"
                              >
                                <Trash2 size={11} />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TherapySidebar;
