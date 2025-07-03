
import { authenticateUser, setCorsHeaders } from '../auth/middleware.js';
import { checkDailyLimit } from '../utils/dailyLimits.js';

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
  
  try {
    // Get daily limit info
    const limitInfo = await checkDailyLimit(supabase, user.id);
    if (limitInfo.error) {
      return res.status(limitInfo.status).json({ error: limitInfo.error });
    }
    
    // Get total sessions count
    const { count: sessionCount, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);
      
    if (sessionError) {
      console.error('Error fetching session count:', sessionError);
      return res.status(500).json({ error: 'Failed to fetch user stats' });
    }
    
    return res.status(200).json({
      messagesUsedToday: limitInfo.messageCount,
      remainingMessages: limitInfo.remainingMessages,
      totalSessions: sessionCount || 0,
      isPremium: false // Free tier only
    });
    
  } catch (error) {
    console.error('User stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
