import { authenticateUser, setCorsHeaders } from './auth/middleware.js';
import { detectOptimalMode } from './utils/modeDetection.js';

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
  const { sessionId, newMode, message } = req.body;
  
  if (!sessionId || !newMode) {
    return res.status(400).json({ error: 'SessionId and newMode are required' });
  }
  
  try {
    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Update session mode
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ current_mode: newMode })
      .eq('id', sessionId)
      .eq('user_id', user.id);
      
    if (updateError) {
      console.error('Error updating session mode:', updateError);
      return res.status(500).json({ error: 'Failed to update session mode' });
    }
    
    // Log mode transition
    await supabase
      .from('mode_transitions')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        old_mode: session.current_mode,
        new_mode: newMode
      });
    
    // Optional: Auto-detect mode if message provided
    let suggestedMode = newMode;
    if (message) {
      suggestedMode = detectOptimalMode(message);
    }
    
    return res.status(200).json({
      success: true,
      oldMode: session.current_mode,
      newMode: newMode,
      suggestedMode: suggestedMode,
      message: `Switched from ${session.current_mode} to ${newMode} mode`
    });
    
  } catch (error) {
    console.error('Mode switch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}