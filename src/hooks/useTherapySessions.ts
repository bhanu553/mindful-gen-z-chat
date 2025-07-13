
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
      console.log('🔍 Fetching sessions for user:', user.id);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        console.error('❌ No auth token available');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/getSessions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sessions');
      }

      const data = await response.json();
      console.log('📋 Found', data.sessions?.length || 0, 'sessions');

      // Transform data to match TherapySession interface
      const transformedData = (data.sessions || []).map(session => ({
        id: session.id,
        title: session.title || 'Untitled Session',
        mode: session.current_mode || 'reflect',
        created_at: session.created_at,
        updated_at: session.created_at,
        user_id: user.id
      }));

      setSessions(transformedData);
      
      // If no current session and we have sessions, select the most recent one
      if (!currentSession && transformedData.length > 0) {
        setCurrentSession(transformedData[0]);
      }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      toast.error('Failed to load therapy sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (mode: string = 'reflect', title: string = 'New Session') => {
    if (!user) return null;

    try {
      console.log('📝 Creating new session:', { mode, title });
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        console.error('❌ No auth token available');
        return null;
      }

      const response = await fetch('/api/createSession', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const data = await response.json();
      console.log('✅ Session created successfully:', data.session.id);

      const newSession: TherapySession = {
        id: data.session.id,
        title: data.session.title,
        mode: data.session.current_mode,
        created_at: data.session.created_at,
        updated_at: data.session.created_at,
        user_id: data.session.user_id
      };

      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      return newSession;
    } catch (error) {
      console.error('❌ Error creating session:', error);
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
      if (updates.mode !== undefined) dbUpdates.current_mode = updates.mode;

      const { error } = await supabase
        .from('chat_sessions')
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
        .from('chat_messages')
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
        .from('chat_sessions')
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
