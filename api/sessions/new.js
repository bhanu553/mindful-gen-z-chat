
import { authenticateUser, setCorsHeaders } from '../auth/middleware.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Authenticate user
  const auth = await authenticateUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }
  
  const { user, supabase } = auth;
  const { title = 'New Session', mode = 'reflect' } = req.body;
  
  try {
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        title,
        current_mode: mode,
        message_count: 0
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }
    
    return res.status(201).json(session);
    
  } catch (error) {
    console.error('Session creation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
