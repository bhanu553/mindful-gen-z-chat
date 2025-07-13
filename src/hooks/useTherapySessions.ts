
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
    if (!user) {
      console.log('❌ No user found for fetching sessions');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching sessions for user:', user.id);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        console.error('❌ No auth token available');
        setLoading(false);
        return;
      }

      const response = await fetch('https://tvjqpmxugitehucwhdbk.supabase.co/functions/v1/therapy-api?action=getSessions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 getSessions response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ getSessions error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 getSessions response data:', data);

      const transformedData = (data.sessions || []).map(session => ({
        id: session.id,
        title: session.title || 'Untitled Session',
        mode: session.current_mode || 'evolve',
        created_at: session.created_at,
        updated_at: session.created_at,
        user_id: user.id
      }));

      console.log('✅ Sessions transformed:', transformedData.length, 'sessions');
      setSessions(transformedData);
      
      if (!currentSession && transformedData.length > 0) {
        setCurrentSession(transformedData[0]);
        console.log('🎯 Set current session to:', transformedData[0].id);
      }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      toast.error('Failed to load therapy sessions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (mode: string = 'evolve', title: string = 'New Session') => {
    if (!user) {
      console.log('❌ No user found for creating session');
      return null;
    }

    try {
      console.log('📝 Creating new session:', { mode, title, userId: user.id });
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        console.error('❌ No auth token available');
        return null;
      }

      const response = await fetch('https://tvjqpmxugitehucwhdbk.supabase.co/functions/v1/therapy-api?action=createSession', {
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

      console.log('📡 createSession response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ createSession error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ createSession response data:', data);

      const newSession: TherapySession = {
        id: data.session.id,
        title: data.session.title,
        mode: data.session.current_mode,
        created_at: data.session.created_at,
        updated_at: data.session.created_at,
        user_id: data.session.user_id
      };

      console.log('🎯 New session created:', newSession.id);
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      return newSession;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      toast.error('Failed to create new session: ' + error.message);
      return null;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<TherapySession>) => {
    if (!user) return;

    try {
      console.log('📝 Updating session:', sessionId, updates);
      
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.mode !== undefined) dbUpdates.current_mode = updates.mode;

      const { error } = await supabase
        .from('chat_sessions')
        .update(dbUpdates)
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error updating session:', error);
        toast.error('Failed to update session: ' + error.message);
        return;
      }

      console.log('✅ Session updated successfully');
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      ));

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('❌ Error updating session:', error);
      toast.error('Failed to update session: ' + error.message);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;

    try {
      console.log('🗑️ Deleting session:', sessionId);
      
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (messagesError) {
        console.error('❌ Error deleting messages:', messagesError);
        toast.error('Failed to delete session messages: ' + messagesError.message);
        return;
      }

      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error deleting session:', error);
        toast.error('Failed to delete session: ' + error.message);
        return;
      }

      console.log('✅ Session deleted successfully');
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setCurrentSession(remainingSessions.length > 0 ? remainingSessions[0] : null);
      }
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      toast.error('Failed to delete session: ' + error.message);
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
