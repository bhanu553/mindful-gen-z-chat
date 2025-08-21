
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const versionInfo = {
      app: 'EchoMind',
      version: '1.0.0',
      build: new Date().toISOString(),
      api_version: '1.0',
      status: 'active'
    };

    console.log('📋 Version info requested');
    res.status(200).json(versionInfo);
  } catch (error) {
    console.error('❌ Version error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
