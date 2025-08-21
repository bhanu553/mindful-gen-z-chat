
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
    
    // Check all required environment variables
    const requiredEnvVars = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
      PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
      PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID
    };
    
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        supabase: {
          status: requiredEnvVars.SUPABASE_URL && requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY ? 'healthy' : 'unhealthy',
          details: {
            url_configured: !!requiredEnvVars.SUPABASE_URL,
            service_role_key_configured: !!requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY,
            missing_vars: missingVars.filter(v => v.startsWith('SUPABASE'))
          }
        },
        openai: {
          status: requiredEnvVars.OPENAI_API_KEY ? 'healthy' : 'unhealthy',
          details: {
            api_key_configured: !!requiredEnvVars.OPENAI_API_KEY
          }
        },
        paypal: {
          status: requiredEnvVars.PAYPAL_CLIENT_ID && requiredEnvVars.PAYPAL_CLIENT_SECRET && requiredEnvVars.PAYPAL_WEBHOOK_ID ? 'healthy' : 'unhealthy',
          details: {
            client_id_configured: !!requiredEnvVars.PAYPAL_CLIENT_ID,
            client_secret_configured: !!requiredEnvVars.PAYPAL_CLIENT_SECRET,
            webhook_id_configured: !!requiredEnvVars.PAYPAL_WEBHOOK_ID
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

    if (missingVars.length > 0) {
      healthData.missing_environment_variables = missingVars;
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
