// Secure replacement for deprecated /api/chat endpoint
// This endpoint now requires proper authentication and doesn't use service role keys
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return security notice
  return res.status(410).json({ 
    error: 'This endpoint has been permanently deprecated for security reasons.',
    migration: 'Please use the Supabase Edge Function instead: supabase.functions.invoke("therapy-api")',
    documentation: 'All chat functionality has been migrated to secure Edge Functions that properly validate user authentication.',
    timestamp: new Date().toISOString()
  });
}