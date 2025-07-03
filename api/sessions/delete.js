
import { authenticateUser, setCorsHeaders } from '../auth/middleware.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Authenticate user
  const auth = await authenticateUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }
  
  const { user, supabase } = auth;
  const { sessionId } = req.query;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }
  
  try {
    // Delete all messages first (cascading should handle this, but being explicit)
    await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user.id);
    
    // Delete mode transitions
    await supabase
      .from('mode_transitions')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user.id);
    
    // Delete the session
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error deleting session:', error);
      return res.status(500).json({ error: 'Failed to delete session' });
    }
    
    return res.status(200).json({ message: 'Session deleted successfully' });
    
  } catch (error) {
    console.error('Session deletion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
