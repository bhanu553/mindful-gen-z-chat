import { authenticateUser, setCorsHeaders } from './auth/middleware.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Authenticate user
  const auth = await authenticateUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }
  
  const { user, supabase } = auth;
  const { type } = req.query;
  
  try {
    if (type === 'usage') {
      // Usage data
      const today = new Date().toISOString().slice(0, 10);
      
      // Get daily message count
      const { count: messageCount, error: messageError } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today + 1}T00:00:00.000Z`);
        
      if (messageError) {
        console.error('Error fetching message count:', messageError);
        return res.status(500).json({ error: 'Failed to fetch usage data' });
      }
      
      // Get daily upload count (if uploads table exists)
      const { count: uploadCount, error: uploadError } = await supabase
        .from('uploads')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today + 1}T00:00:00.000Z`);
        
      // Don't fail if uploads table doesn't exist
      const uploads = uploadError ? 0 : (uploadCount || 0);
      
      // Get total sessions
      const { count: sessionCount, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);
        
      if (sessionError) {
        console.error('Error fetching session count:', sessionError);
        return res.status(500).json({ error: 'Failed to fetch session data' });
      }
      
      // Get user profile to check premium status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
        
      const isPremium = profile?.is_premium || false;
      const maxMessages = isPremium ? 300 : 50;
      const maxUploads = isPremium ? 25 : 5;
      
      return res.status(200).json({
        today: {
          messages: messageCount || 0,
          uploads: uploads,
          remainingMessages: Math.max(0, maxMessages - (messageCount || 0)),
          remainingUploads: Math.max(0, maxUploads - uploads)
        },
        totals: {
          sessions: sessionCount || 0
        },
        limits: {
          maxMessages,
          maxUploads,
          isPremium
        },
        user: {
          id: user.id,
          email: user.email
        }
      });
    } else {
      // Stats data (default)
      const today = new Date().toISOString().slice(0, 10);
      
      const { count: messagesUsedToday, error: messageError } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today + 1}T00:00:00.000Z`);
        
      if (messageError) {
        console.error('Error fetching message count:', messageError);
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
      
      const { count: totalSessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);
        
      if (sessionError) {
        console.error('Error fetching session count:', sessionError);
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
        
      const isPremium = profile?.is_premium || false;
      const maxMessages = isPremium ? 300 : 50;
      
      return res.status(200).json({
        messagesUsedToday: messagesUsedToday || 0,
        remainingMessages: Math.max(0, maxMessages - (messagesUsedToday || 0)),
        totalSessions: totalSessions || 0,
        isPremium
      });
    }
  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}