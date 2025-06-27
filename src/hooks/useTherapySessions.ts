
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TherapyMode = 'Reflect' | 'Recover' | 'Rebuild' | 'Evolve';

export interface TherapySession {
  id: string;
  title: string;
  mode: TherapyMode;
  created_at: string;
  updated_at: string;
}

export interface TherapyMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export const useTherapySessions = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  const [messages, setMessages] = useState<TherapyMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const createNewSession = async (title: string, mode: TherapyMode): Promise<TherapySession | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert({
          user_id: user.id,
          title,
          mode
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSession(data);
      setMessages([]);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  const loadSession = async (session: TherapySession) => {
    try {
      setLoading(true);
      setCurrentSession(session);

      const { data, error } = await supabase
        .from('therapy_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (content: string, sender: 'user' | 'ai'): Promise<TherapyMessage | null> => {
    if (!currentSession || !user) return null;

    try {
      const { data, error } = await supabase
        .from('therapy_messages')
        .insert({
          session_id: currentSession.id,
          user_id: user.id,
          sender,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Update session's updated_at timestamp
      await supabase
        .from('therapy_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSession.id);

      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

  const updateSessionTitle = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title: newTitle } : null);
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  return {
    currentSession,
    messages,
    loading,
    createNewSession,
    loadSession,
    addMessage,
    updateSessionTitle
  };
};
