
export async function checkDailyLimit(supabase, userId) {
  if (!userId) {
    console.warn('No user ID provided for daily limit check');
    return { error: 'User authentication required', status: 401 };
  }

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().slice(0, 10);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    
    console.log(`🔍 Checking daily limit for user ${userId} on ${todayStr}`);
    
    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', `${todayStr}T00:00:00.000Z`)
      .lt('created_at', `${tomorrowStr}T00:00:00.000Z`);
      
    if (error) {
      console.error('Error checking daily limit:', error);
      return { error: 'Limit could not be verified. Please try again.', status: 500 };
    }
    
    const messageCount = count || 0;
    const isLimitReached = messageCount >= 50;
    
    console.log(`📊 Daily limit check: ${messageCount}/50 messages used today`);
    
    return { 
      messageCount, 
      isLimitReached,
      remainingMessages: Math.max(0, 50 - messageCount)
    };
  } catch (error) {
    console.error('Daily limit check error:', error);
    return { error: 'Limit could not be verified. Please try again.', status: 500 };
  }
}
