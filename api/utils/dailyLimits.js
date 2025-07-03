
export async function checkDailyLimit(supabase, userId) {
  const today = new Date().toISOString().slice(0, 10);
  
  try {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today + 1}T00:00:00.000Z`);
      
    if (error) {
      console.error('Error checking daily limit:', error);
      return { error: 'Failed to check daily limit', status: 500 };
    }
    
    const messageCount = count || 0;
    const isLimitReached = messageCount >= 50;
    
    return { 
      messageCount, 
      isLimitReached,
      remainingMessages: Math.max(0, 50 - messageCount)
    };
  } catch (error) {
    console.error('Daily limit check error:', error);
    return { error: 'Failed to check daily limit', status: 500 };
  }
}
