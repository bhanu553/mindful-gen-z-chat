
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 Running diagnostic check...');
    
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    const diagnosticResult = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      openai_configured: !!openaiApiKey
    };

    console.log('✅ Diagnostic completed:', diagnosticResult);
    
    res.status(200).json(diagnosticResult);
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
