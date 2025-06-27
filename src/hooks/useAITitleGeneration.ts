
import { useState } from 'react';

export const useAITitleGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTitle = async (messages: string[], mode: string): Promise<string> => {
    setIsGenerating(true);
    
    try {
      // Simulate AI title generation based on content and mode
      // In a real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const modeContext = {
        'Reflect': ['Self-Discovery', 'Inner Reflection', 'Mindful Journey', 'Personal Insight'],
        'Recover': ['Healing Path', 'Recovery Journey', 'Emotional Healing', 'Restoration'],
        'Rebuild': ['New Beginnings', 'Rebuilding Life', 'Fresh Start', 'Transformation'],
        'Evolve': ['Growth Journey', 'Evolution', 'Personal Development', 'Advancement']
      };

      const contextWords = modeContext[mode as keyof typeof modeContext] || ['Therapy Session'];
      const randomContext = contextWords[Math.floor(Math.random() * contextWords.length)];
      
      // Generate title based on first message content (simplified)
      const firstMessage = messages[0] || '';
      const keywords = ['relationship', 'anxiety', 'depression', 'stress', 'family', 'work', 'fear', 'confidence'];
      const foundKeyword = keywords.find(keyword => firstMessage.toLowerCase().includes(keyword));
      
      if (foundKeyword) {
        return `${foundKeyword.charAt(0).toUpperCase() + foundKeyword.slice(1)} ${randomContext}`;
      }
      
      return randomContext;
    } catch (error) {
      console.error('Error generating title:', error);
      return `${mode} Session`;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateTitle, isGenerating };
};
