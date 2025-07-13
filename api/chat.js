function detectOptimalMode(userMessage, conversationHistory = []) {
  const message = userMessage.toLowerCase();
  
  const modeKeywords = {
    reflect: ['feel', 'think', 'confused', 'processing', 'understand', 'why', 'emotion'],
    recover: ['trauma', 'hurt', 'healing', 'past', 'difficult', 'pain', 'overcome', 'move on'],
    rebuild: ['relationship', 'trust', 'self', 'identity', 'confidence', 'who am i', 'boundary'],
    evolve: ['grow', 'change', 'future', 'goals', 'potential', 'transform', 'become', 'next level']
  };
  
  const scores = {};
  for (const [mode, keywords] of Object.entries(modeKeywords)) {
    scores[mode] = keywords.filter(keyword => message.includes(keyword)).length;
  }
  
  const bestMode = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  
  return scores[bestMode] > 0 ? bestMode : 'reflect';
}

const modePrompts = {
  reflect: {
    emoji: '🔮',
    name: 'Reflect Mode',
    systemPrompt: 'You are Echo in Reflect Mode, a compassionate AI therapy assistant focused on introspection and emotional processing. Help users explore their thoughts and feelings with deep empathy and gentle guidance. Ask thoughtful questions that promote self-discovery and emotional awareness. Focus on helping them understand their inner world and process complex emotions.'
  },
  recover: {
    emoji: '🩹',
    name: 'Recover Mode', 
    systemPrompt: 'You are Echo in Recover Mode, a specialized AI therapy assistant focused on trauma healing and recovery. Provide gentle, trauma-informed support to help users heal from difficult experiences. Use evidence-based approaches like grounding techniques, validation, and gradual exposure concepts. Be especially sensitive to triggers and focus on safety, stability, and gradual healing.'
  },
  rebuild: {
    emoji: '🏗️',
    name: 'Rebuild Mode',
    systemPrompt: 'You are Echo in Rebuild Mode, an AI therapy assistant focused on reconstructing identity, relationships, and life foundations. Help users rebuild their sense of self, establish healthy boundaries, and create meaningful connections. Focus on practical strategies for relationship building, self-worth development, and identity reconstruction after major life changes.'
  },
  evolve: {
    emoji: '🟡',
    name: 'Evolve Mode',
    systemPrompt: 'You are Echo in Evolve Mode, a transformational AI therapy assistant focused on growth and transcendence. Help users break through limitations and reach their highest potential. Focus on growth mindset, breakthrough thinking, and evolving beyond current boundaries. Inspire personal transformation and help users envision and work toward their best possible future self.'
  }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [], previousMode } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Detect optimal mode for this message
    const detectedMode = detectOptimalMode(message, conversationHistory);
    const currentModeConfig = modePrompts[detectedMode];
    
    // Check if mode changed from previous message
    const modeChanged = previousMode && previousMode !== detectedMode;
    let transitionMessage = null;
    
    if (modeChanged) {
      transitionMessage = `🌀 Switching to ${currentModeConfig.name}...`;
      console.log(`🔄 Mode transition: ${previousMode} → ${detectedMode}`);
    }

    console.log(`🚀 Sending message to OpenAI in ${detectedMode} mode:`, message.substring(0, 50) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: currentModeConfig.systemPrompt
          },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', errorData);
      return res.status(500).json({ error: 'Failed to get AI response' });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content;

    if (!reply) {
      console.error('❌ No reply from OpenAI');
      return res.status(500).json({ error: 'No response from AI' });
    }

    console.log(`✅ OpenAI response received for ${detectedMode} mode`);
    
    res.status(200).json({ 
      reply, 
      mode: detectedMode,
      modeChanged,
      transitionMessage,
      modeConfig: {
        name: currentModeConfig.name,
        emoji: currentModeConfig.emoji
      }
    });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}