export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    version: '1.0.0',
    environment: 'production',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/diagnostic',
      '/api/messages',
      '/api/chat/send',
      '/api/user/stats', 
      '/api/messages/history',
      '/api/sessions/new',
      '/api/sessions/list',
      '/api/sessions/delete',
      '/api/version'
    ]
  });
}