
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🏥 Health check requested...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        supabase: {
          status: supabaseUrl && supabaseAnonKey ? 'healthy' : 'unhealthy',
          details: {
            url_configured: !!supabaseUrl,
            anon_key_configured: !!supabaseAnonKey
          }
        },
        openai: {
          status: openaiApiKey ? 'healthy' : 'unhealthy',
          details: {
            api_key_configured: !!openaiApiKey
          }
        },
        environment: {
          status: 'healthy',
          details: {
            node_version: process.version,
            platform: process.platform
          }
        }
      }
    };

    // Overall status based on individual checks
    const hasUnhealthyChecks = Object.values(healthData.checks).some(check => check.status === 'unhealthy');
    if (hasUnhealthyChecks) {
      healthData.status = 'unhealthy';
    }

    console.log('✅ Health check completed:', healthData.status);
    
    res.status(200).json(healthData);
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
