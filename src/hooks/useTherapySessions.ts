
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TherapySession {
  id: string;
  title: string;
  mode: string;
  messages: any[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useTherapySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  const [loading, setLoading] = useState(true);

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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast.error('Failed to load therapy sessions');
        return;
      }

      setSessions(data || []);
      
      // If no current session and we have sessions, select the most recent one
      if (!currentSession && data && data.length > 0) {
        setCurrentSession(data[0]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load therapy sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (mode: string = 'Reflect', title: string = 'New Session') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert({
          user_id: user.id,
          mode,
          title,
          messages: []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        toast.error('Failed to create new session');
        return null;
      }

      const newSession = data as TherapySession;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create new session');
      return null;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<TherapySession>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating session:', error);
        toast.error('Failed to update session');
        return;
      }

      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      ));

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;

    try {
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
      
      if (currentSession?.id === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setCurrentSession(remainingSessions.length > 0 ? remainingSessions[0] : null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const addMessageToSession = async (sessionId: string, message: any) => {
    if (!user) return;

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const updatedMessages = [...session.messages, message];
    await updateSession(sessionId, { messages: updatedMessages });
  };

  const generateSessionTitle = (messages: any[]) => {
    if (messages.length === 0) return 'New Session';
    
    const firstUserMessage = messages.find(msg => msg.isUser && msg.text);
    if (firstUserMessage) {
      const text = firstUserMessage.text.substring(0, 50);
      return text.length < firstUserMessage.text.length ? `${text}...` : text;
    }
    
    return 'New Session';
  };

  return {
    sessions,
    currentSession,
    loading,
    setCurrentSession,
    createSession,
    updateSession,
    deleteSession,
    addMessageToSession,
    generateSessionTitle,
    fetchSessions
  };
};
