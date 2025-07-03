
export function detectOptimalMode(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') return 'reflect';
  
  const lower = userMessage.toLowerCase();
  
  // Recover mode keywords - trauma, healing, pain (highest priority for safety)
  const recoverKeywords = [
    'trauma', 'healing', 'hurt', 'difficult past', 'abuse', 'grief', 'loss',
    'recovering', 'heal', 'painful', 'wounded', 'damaged', 'broken',
    'getting over', 'i\'m broken', 'can\'t forget', 'haunted', 'flashback',
    'my father abused me', 'my mother hurt me', 'was abused', 'sexual abuse',
    'domestic violence', 'ptsd', 'nightmares', 'triggered'
  ];
  
  // Rebuild mode keywords - identity, relationships, boundaries
  const rebuildKeywords = [
    'identity', 'relationship', 'boundaries', 'rebuild', 'reconstruct',
    'establish', 'create new', 'start over', 'foundation', 'structure',
    'who am i', 'don\'t know myself', 'lost myself', 'redefine',
    'boundary', 'toxic', 'codependent', 'i don\'t know who i am anymore',
    'lost my identity', 'rebuild my life', 'toxic relationship'
  ];
  
  // Evolve mode keywords - goals, future, growth, transformation
  const evolveKeywords = [
    'goals', 'future', 'potential', 'stuck', 'growth', 'develop', 'improve',
    'advance', 'progress', 'next level', 'ambition', 'dreams', 'aspirations',
    'transform', 'change', 'vision', 'breakthrough', 'limiting beliefs',
    'want to become', 'achieve', 'succeed', 'i want to start a new life',
    'new beginning', 'fresh start', 'life goals', 'career change'
  ];
  
  // Reflect mode keywords - emotions, confusion, introspection
  const reflectKeywords = [
    'i feel', 'confused', 'why do i', 'don\'t understand',
    'processing', 'thinking about', 'emotional', 'feelings',
    'wondering', 'introspect', 'self-aware', 'i feel like',
    'not good enough', 'feel lost', 'feel empty', 'feel overwhelmed'
  ];
  
  // Check for recover mode (highest priority for safety)
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
  
  // Check for explicit reflect mode indicators
  if (reflectKeywords.some(keyword => lower.includes(keyword))) {
    return 'reflect';
  }
  
  // Default to reflect mode for general emotional processing
  return 'reflect';
}

export function getSystemPrompt(mode) {
  const prompts = {
    reflect: `You are Echo, a warm and intuitive therapy companion in Reflect Mode. Your purpose is to help users process thoughts and emotions through gentle, non-judgmental exploration. Use reflection, metaphor, and somatic awareness. Never diagnose. Guide only by open-ended questions. Keep responses under 300 words and always be empathetic and supportive.`,
    
    recover: `You are Echo in Recover Mode, a trauma-informed healing companion. Prioritize emotional safety, validation, grounding, and resilience. Let the user lead the pace. Don't ask for graphic trauma details. Always empower. Focus on healing, safety, and gentle progress. Keep responses under 300 words and be extra gentle and validating.`,
    
    rebuild: `You are Echo in Rebuild Mode. Help the user reconstruct identity, relationships, and values after challenge. Focus on patterns, boundaries, and self-awareness. Be empowering, constructive, and values-focused. Help them build healthy foundations and structures in their life. Keep responses under 300 words and be encouraging about their rebuilding journey.`,
    
    evolve: `You are Echo in Evolve Mode. Inspire future growth, vision, and transformation. Help users challenge limiting beliefs and envision bold change. Be visionary, energizing, and grounded in possibility. Focus on potential, goals, and forward momentum. Keep responses under 300 words and be motivational while remaining realistic.`
  };
  
  return prompts[mode] || prompts.reflect;
}
