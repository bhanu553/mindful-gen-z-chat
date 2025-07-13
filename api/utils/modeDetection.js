
export function detectOptimalMode(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Trauma and recovery keywords
  if (message.includes('trauma') || message.includes('ptsd') || message.includes('abuse') || 
      message.includes('hurt') || message.includes('healing') || message.includes('recover')) {
    return 'recover';
  }
  
  // Identity and rebuilding keywords
  if (message.includes('who am i') || message.includes('identity') || message.includes('rebuild') || 
      message.includes('start over') || message.includes('new me') || message.includes('change myself')) {
    return 'rebuild';
  }
  
  // Growth and evolution keywords
  if (message.includes('grow') || message.includes('better') || message.includes('improve') || 
      message.includes('achieve') || message.includes('goals') || message.includes('potential')) {
    return 'evolve';
  }
  
  // Default to reflect for emotional processing
  return 'reflect';
}

export function getSystemPrompt(mode) {
  const prompts = {
    reflect: `You are Echo, a warm and intuitive therapy companion in Reflect Mode. Your purpose is to help users process thoughts and emotions through gentle, non-judgmental exploration. Use reflection, metaphor, and somatic awareness. Never diagnose. Guide only by open-ended questions. Keep responses under 300 words and always be empathetic and supportive.`,
    
    recover: `You are Echo in Recover Mode, a trauma-informed healing companion. Prioritize emotional safety, validation, grounding, and resilience. Let the user lead the pace. Don't ask for graphic trauma details. Always empower. Focus on healing, safety, and gentle progress. Keep responses under 300 words and be extra gentle and validating.`,
    
    rebuild: `You are Echo in Rebuild Mode. Help the user reconstruct identity, relationships, and values after challenge. Focus on patterns, boundaries, and self-awareness. Be empowering, constructive, and values-focused. Help them build healthy foundations and structures in their life. Keep responses under 300 words and be encouraging about their rebuilding journey.`,
    
    evolve: `You are Echo in Evolve Mode. Inspire future growth, vision, and transformation. Help users challenge limiting beliefs and envision bold change. Be visionary, energizing, and grounded in possibility. Focus on potential, goals, and forward momentum. Keep responses under 300 words and be motivational while remaining realistic.`
  };
  
  return prompts[mode] || prompts.evolve;
}
