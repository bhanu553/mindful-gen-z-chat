
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAITitleGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTitle = async (messages: string[], mode: string): Promise<string> => {
    setIsGenerating(true);
    
    try {
      // If we have messages, use AI to generate a meaningful title
      if (messages.length > 0) {
        const { data, error } = await supabase.functions.invoke('generate-title', {
          body: {
            messages: messages.slice(0, 3), // Use first 3 messages for context
            mode
          }
        });

        if (!error && data?.title) {
          return data.title;
        }
      }
      
      // Fallback to contextual titles based on mode
      const modeContext = {
        'Reflect': ['Self-Discovery Journey', 'Inner Reflection', 'Mindful Exploration', 'Personal Insight Session'],
        'Recover': ['Healing Path', 'Recovery Journey', 'Emotional Restoration', 'Processing Session'],
        'Rebuild': ['New Beginnings', 'Rebuilding Life', 'Fresh Start Journey', 'Transformation Path'],
        'Evolve': ['Growth Journey', 'Evolution Process', 'Personal Development', 'Advancement Session']
      };

      const contextWords = modeContext[mode as keyof typeof modeContext] || ['Therapy Session'];
      const randomContext = contextWords[Math.floor(Math.random() * contextWords.length)];
      
      return randomContext;
    } catch (error) {
      console.error('Error generating title:', error);
      
      // Fallback based on mode
      const fallbacks = {
        'Reflect': 'Reflection Session',
        'Recover': 'Recovery Session', 
        'Rebuild': 'Rebuilding Session',
        'Evolve': 'Growth Session'
      };
      
      return fallbacks[mode as keyof typeof fallbacks] || 'Therapy Session';
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateTitle, isGenerating };
};
