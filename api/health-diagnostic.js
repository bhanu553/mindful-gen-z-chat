export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;
    
    // Route to appropriate handler based on action parameter
    switch (action) {
      case 'health':
        return handleHealthCheck(req, res);
      case 'diagnostic':
        return handleDiagnostic(req, res);
      case 'version':
        return handleVersion(req, res);
      default:
        // Default to health check if no action specified
        return handleHealthCheck(req, res);
    }
  } catch (error) {
    console.error('❌ Health/Diagnostic/Version error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Health check handler
async function handleHealthCheck(req, res) {
  console.log('🏥 Health check requested...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
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
}

// Diagnostic handler
function handleDiagnostic(req, res) {
  console.log('🔍 Diagnostic check requested');
  
  const diagnosticData = {
    status: "ok",
    timestamp: new Date().toISOString(),
    endpoint: "diagnostic",
    message: "Diagnostic endpoint is functioning correctly"
  };
  
  res.status(200).json(diagnosticData);
}

// Version handler
function handleVersion(req, res) {
  console.log('📋 Version info requested');
  
  const versionInfo = {
    app: 'EchoMind',
    version: '1.0.0',
    build: new Date().toISOString(),
    api_version: '1.0',
    status: 'active',
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(versionInfo);
}
