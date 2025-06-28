
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TherapySession {
  id: string;
  title: string;
  mode: string;
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

      // Transform data to match TherapySession interface
      const transformedData = (data || []).map(session => ({
        id: session.id,
        title: session.title,
        mode: session.mode,
        created_at: session.created_at,
        updated_at: session.updated_at,
        user_id: session.user_id
      }));

      setSessions(transformedData);
      
      // If no current session and we have sessions, select the most recent one
      if (!currentSession && transformedData.length > 0) {
        setCurrentSession(transformedData[0]);
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
          mode: mode as 'Reflect' | 'Recover' | 'Rebuild' | 'Evolve',
          title
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        toast.error('Failed to create new session');
        return null;
      }

      const newSession: TherapySession = {
        id: data.id,
        title: data.title,
        mode: data.mode,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id
      };

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
      // Only update fields that exist in the database
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.mode !== undefined) dbUpdates.mode = updates.mode;

      const { error } = await supabase
        .from('therapy_sessions')
        .update(dbUpdates)
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
      
      if (currentSession?.id === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setCurrentSession(remainingSessions.length > 0 ? remainingSessions[0] : null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const generateSessionTitle = (firstMessage: string) => {
    if (!firstMessage?.trim()) return 'New Session';
    
    const text = firstMessage.trim().substring(0, 50);
    return text.length < firstMessage.length ? `${text}...` : text;
  };

  return {
    sessions,
    currentSession,
    loading,
    setCurrentSession,
    createSession,
    updateSession,
    deleteSession,
    generateSessionTitle,
    fetchSessions
  };
};
