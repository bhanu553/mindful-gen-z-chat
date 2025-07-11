import { authenticateUser, setCorsHeaders } from './auth/middleware.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Authenticate user
  const auth = await authenticateUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }
  
  const { user, supabase } = auth;
  
  try {
    switch (req.method) {
      case 'GET':
        // List sessions
        const { data: sessions, error: listError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (listError) {
          console.error('Error fetching sessions:', listError);
          return res.status(500).json({ error: 'Failed to fetch sessions' });
        }
        
        return res.status(200).json({ sessions });
        
      case 'POST':
        // Create new session
        const { title, mode } = req.body;
        
        if (!title) {
          return res.status(400).json({ error: 'Title is required' });
        }
        
        const { data: newSession, error: createError } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user.id,
            title: title,
            current_mode: mode || 'reflect',
            message_count: 0
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating session:', createError);
          return res.status(500).json({ error: 'Failed to create session' });
        }
        
        return res.status(201).json({ session: newSession });
        
      case 'DELETE':
        // Delete session
        const { sessionId } = req.body;
        
        if (!sessionId) {
          return res.status(400).json({ error: 'Session ID is required' });
        }
        
        const { error: deleteError } = await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', user.id);
          
        if (deleteError) {
          console.error('Error deleting session:', deleteError);
          return res.status(500).json({ error: 'Failed to delete session' });
        }
        
        return res.status(200).json({ success: true });
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Sessions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}