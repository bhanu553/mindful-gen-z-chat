
export function detectOptimalMode(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') return 'reflect';
  
  const lower = userMessage.toLowerCase();
  
  // Recover mode keywords
  const recoverKeywords = [
    'trauma', 'healing', 'hurt', 'difficult past', 'abuse', 'grief', 'loss',
    'recovering', 'heal', 'painful', 'wounded', 'damaged', 'broken'
  ];
  
  // Rebuild mode keywords  
  const rebuildKeywords = [
    'identity', 'relationship', 'boundaries', 'rebuild', 'reconstruct',
    'establish', 'create new', 'start over', 'foundation', 'structure'
  ];
  
  // Evolve mode keywords
  const evolveKeywords = [
    'goals', 'future', 'potential', 'stuck', 'growth', 'develop', 'improve',
    'advance', 'progress', 'next level', 'ambition', 'dreams', 'aspirations'
  ];
  
  // Check for recover mode
  if (recoverKeywords.some(keyword => lower.includes(keyword))) {
    return 'recover';
  }
  
  // Check for rebuild mode
  if (rebuildKeywords.some(keyword => lower.includes(keyword))) {
    return 'rebuild';
  }
  
  // Check for evolve mode
  if (evolveKeywords.some(keyword => lower.includes(keyword))) {
    return 'evolve';
  }
  
  // Default to reflect mode
  return 'reflect';
}

export function getSystemPrompt(mode) {
  const prompts = {
    reflect: `You are a compassionate AI therapist in "Reflect" mode. Help users explore their thoughts and feelings through gentle questioning and active listening. Focus on helping them understand their emotions and gain self-awareness. Keep responses warm, empathetic, and under 300 words.`,
    
    recover: `You are a caring AI therapist in "Recover" mode. Support users who are healing from trauma or difficult experiences. Provide gentle guidance, validation, and coping strategies. Be extra sensitive and avoid pushing too hard. Focus on safety, healing, and gradual progress. Keep responses supportive and under 300 words.`,
    
    rebuild: `You are a supportive AI therapist in "Rebuild" mode. Help users reconstruct their identity, relationships, and life structure. Focus on setting healthy boundaries, building new habits, and creating positive foundations. Be encouraging and practical in your guidance. Keep responses constructive and under 300 words.`,
    
    evolve: `You are an inspiring AI therapist in "Evolve" mode. Help users overcome stagnation and reach their potential. Focus on goal-setting, personal growth, and moving forward. Be motivational while remaining grounded and realistic. Help them see possibilities and take action. Keep responses encouraging and under 300 words.`
  };
  
  return prompts[mode] || prompts.reflect;
}
