
export default async function handler(req, res) {
  console.log('🏥 Health check called');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        openai_configured: !!process.env.OPENAI_API_KEY,
        supabase_url: !!process.env.VITE_SUPABASE_URL,
        supabase_anon_key: !!process.env.VITE_SUPABASE_ANON_KEY
      },
      endpoints: {
        therapy_api: '/api/therapy',
        actions: [
          'createSession',
          'sendMessage', 
          'getSessions',
          'getMessages',
          'getUserStats'
        ]
      }
    };

    console.log('✅ Health check passed:', healthStatus);
    return res.status(200).json(healthStatus);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
