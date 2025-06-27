
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAIChat = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string, sessionId: string): Promise<string | null> => {
    if (!user || !message.trim()) return null;

    setIsLoading(true);
    
    try {
      console.log('Sending message to AI:', message);
      
      const { data, error } = await supabase.functions.invoke('therapy-chat', {
        body: {
          message: message.trim(),
          sessionId,
          userId: user.id
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      console.log('AI response received:', data.response);
      return data.response;

    } catch (error) {
      console.error('Error sending message to AI:', error);
      // Return a fallback response
      return "I hear you, and I want you to know that your feelings are completely valid. Let's explore this together. Can you tell me more about what led to these feelings?";
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
};
