
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type TherapyMode = 'Reflect' | 'Recover' | 'Rebuild' | 'Evolve';

export const useEmotionClassifier = () => {
  const classifyEmotion = async (message: string): Promise<TherapyMode> => {
    try {
      console.log('Classifying message:', message);
      
      const { data, error } = await supabase.functions.invoke('classify-emotion', {
        body: { message }
      });

      if (error) {
        console.error('Error classifying emotion:', error);
        toast.error('Failed to classify emotional mode');
        return 'Reflect'; // fallback
      }

      const mode = data?.mode || 'Reflect';
      console.log('Classified mode:', mode);
      
      return mode as TherapyMode;
    } catch (error) {
      console.error('Error in emotion classification:', error);
      toast.error('Failed to classify emotional mode');
      return 'Reflect'; // fallback
    }
  };

  return { classifyEmotion };
};
