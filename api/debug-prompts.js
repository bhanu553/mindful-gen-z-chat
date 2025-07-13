export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // Mode-specific system prompts for debugging
    const modePrompts = {
      reflect: "You are Echo in Reflect Mode. Help users process their thoughts and emotions with gentle, introspective guidance. Focus on self-awareness and understanding patterns.",
      recover: "You are Echo in Recover Mode. Support users healing from trauma and difficult experiences. Provide compassionate, trauma-informed responses with emphasis on safety and recovery.",
      rebuild: "You are Echo in Rebuild Mode. Guide users in reconstructing their sense of self and relationships. Focus on growth, rebuilding trust, and developing healthy patterns.",
      evolve: "You are Echo in Evolve Mode. Help users transcend their current limitations and reach their highest potential. Focus on transformation, growth mindset, and breakthrough thinking."
    };

    // Test OpenAI connectivity
    let openaiStatus = 'unconfigured';
    let testResponse = null;

    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: modePrompts.evolve },
              { role: 'user', content: 'Hello, I want to test if you can respond' }
            ],
            max_tokens: 50,
            temperature: 0.7
          }),
        });

        if (response.ok) {
          const data = await response.json();
          testResponse = data.choices[0]?.message?.content;
          openaiStatus = 'connected';
        } else {
          openaiStatus = 'error';
        }
      } catch (error) {
        openaiStatus = 'error';
        console.error('OpenAI test error:', error);
      }
    }

    // Response data
    const debugInfo = {
      timestamp: new Date().toISOString(),
      status: 'ok',
      openai: {
        configured: !!openaiApiKey,
        status: openaiStatus,
        model: 'gpt-4o-mini',
        testResponse: testResponse
      },
      modePrompts: {
        reflect: {
          name: 'Reflect Mode',
          icon: '🟣',
          systemPrompt: modePrompts.reflect,
          description: 'Process thoughts and emotions with gentle guidance'
        },
        recover: {
          name: 'Recover Mode', 
          icon: '🔵',
          systemPrompt: modePrompts.recover,
          description: 'Heal from trauma and difficult experiences'
        },
        rebuild: {
          name: 'Rebuild Mode',
          icon: '🟢', 
          systemPrompt: modePrompts.rebuild,
          description: 'Reconstruct sense of self and relationships'
        },
        evolve: {
          name: 'Evolve Mode',
          icon: '🟡',
          systemPrompt: modePrompts.evolve,
          description: 'Grow beyond current limitations'
        }
      },
      currentImplementation: {
        chatEndpoint: '/api/chat',
        diagnosticEndpoint: '/api/diagnostic',
        debugEndpoint: '/api/debug-prompts',
        modeBasedRouting: 'not_implemented_yet',
        note: 'Currently using generic system prompt in /api/chat. Mode-based routing needs to be implemented.'
      }
    };

    res.status(200).json(debugInfo);

  } catch (error) {
    console.error('❌ Debug prompts error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}