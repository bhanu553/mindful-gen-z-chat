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
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('🚀 Sending message to OpenAI:', message.substring(0, 50) + '...');

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
            content: 'You are Echo, a compassionate AI therapy assistant. Provide supportive, thoughtful responses to help users process their thoughts and emotions.' 
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

    console.log('✅ OpenAI response received');
    
    res.status(200).json({ reply });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}