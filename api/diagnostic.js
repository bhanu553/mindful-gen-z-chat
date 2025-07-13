
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    const result = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      openai_configured: !!openaiApiKey,
      environment: 'production'
    };

    console.log('✅ Diagnostic check completed:', result);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
