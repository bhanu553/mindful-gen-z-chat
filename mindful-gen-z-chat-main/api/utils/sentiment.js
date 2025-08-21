
export function calculateSentiment(text) {
  if (!text || typeof text !== 'string') return 0;
  
  const positiveWords = [
    'happy', 'joy', 'love', 'excited', 'wonderful', 'amazing', 'great', 'good', 'better',
    'excellent', 'fantastic', 'awesome', 'perfect', 'beautiful', 'grateful', 'thankful',
    'hopeful', 'optimistic', 'positive', 'confident', 'proud', 'peaceful', 'calm'
  ];
  
  const negativeWords = [
    'sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'worse', 'worst', 'horrible',
    'depressed', 'anxious', 'worried', 'scared', 'afraid', 'angry', 'frustrated',
    'disappointed', 'upset', 'hurt', 'pain', 'suffering', 'trauma', 'difficult'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  let wordCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) {
      score += 1;
      wordCount++;
    } else if (negativeWords.includes(word)) {
      score -= 1;
      wordCount++;
    }
  });
  
  if (wordCount === 0) return 0;
  
  // Normalize score to -1 to 1 range
  const normalizedScore = score / Math.max(wordCount, 10);
  return Math.max(-1, Math.min(1, normalizedScore));
}
