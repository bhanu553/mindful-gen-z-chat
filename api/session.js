import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "https://tvjqpmxugitehucwhdbk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImF1ZCI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k"
);

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// New function to check user restriction status
async function checkUserRestriction(userId) {
  try {
    // Get user's sessions for current month
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', getMonthStart())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // If no sessions, user is not restricted
    if (!sessions || sessions.length === 0) {
      return { isRestricted: false };
    }
    
    // Find the most recent session
    const lastSession = sessions[0];
    
    // If session is not complete, user is not restricted
    if (!lastSession.is_complete) {
      return { isRestricted: false };
    }
    
    // Calculate days until next session (30 days from last session)
    const sessionDate = new Date(lastSession.created_at);
    const now = new Date();
    const diffTime = sessionDate.getTime() + (30 * 24 * 60 * 60 * 1000) - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) {
      return { isRestricted: false };
    }
    
    // Calculate next eligible date
    const nextEligibleDate = new Date(sessionDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return {
      isRestricted: true,
      daysRemaining,
      nextEligibleDate: nextEligibleDate.toISOString(),
      lastSessionDate: lastSession.created_at
    };
  } catch (error) {
    console.error('❌ Error checking user restriction:', error);
    return { isRestricted: false };
  }
}

async function getOrCreateCurrentSession(userId) {
  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', getMonthStart())
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (sessions && sessions.length > 0) {
    const active = sessions.find(s => !s.is_complete);
    if (active) return active;
    return sessions[0];
  }
  const { data: newSession, error: createError } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, is_complete: false, created_at: new Date().toISOString() })
    .select()
    .single();
  if (createError) throw createError;
  return newSession;
}

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return Response.json({ error: "No userId provided." }, { status: 400 });
    }
    
    // Check user restriction status first
    const restrictionInfo = await checkUserRestriction(userId);
    
    // If user is restricted, return restriction info immediately
    if (restrictionInfo.isRestricted) {
      return Response.json({ 
        sessionComplete: true, 
        messages: [],
        restrictionInfo 
      });
    }
    
    // Get or create session (existing logic unchanged)
    const session = await getOrCreateCurrentSession(userId);
    
    // CRITICAL FIX: Only mark session as complete if the AI has sent the session end message
    // Check if the last message from AI contains session completion indicators
    if (session.is_complete) {
      // Get the last AI message to check if it actually ended the session
      const { data: lastMessages, error: lastMsgError } = await supabase
        .from('chat_messages')
        .select('content, role')
        .eq('session_id', session.id)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (lastMsgError) throw lastMsgError;
      
      // Only mark as complete if the last message was from AI and contains session end indicators
      const lastMessage = lastMessages?.[0];
      const isSessionEndedByAI = lastMessage && 
        lastMessage.role === 'assistant' && 
        (lastMessage.content.toLowerCase().includes('see you in the next session') ||
         lastMessage.content.toLowerCase().includes('see you next session') ||
         lastMessage.content.toLowerCase().includes('until next session') ||
         lastMessage.content.toLowerCase().includes('session complete') ||
         lastMessage.content.toLowerCase().includes('session ended'));
      
      if (isSessionEndedByAI) {
        return Response.json({ sessionComplete: true, messages: [] });
      } else {
        // Session was marked complete but AI didn't end it - reset it
        console.log('🔄 Session was marked complete but AI didn\'t end it - resetting session');
        await supabase.from('chat_sessions').update({ is_complete: false }).eq('id', session.id);
        session.is_complete = false;
      }
    }
    // Fetch all messages for this session
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', session.id)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (msgError) throw msgError;
    // Fetch AI analysis message from onboarding
    const { data: onboarding, error: onboardingError } = await supabase
      .from('user_onboarding')
      .select('ai_analysis')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    let allMessages = messages || [];
    let aiAnalysisToUse = onboarding && onboarding.ai_analysis ? onboarding.ai_analysis : 'Welcome to your first therapy session. Let\'s begin.';
    // Only prepend if there are no assistant messages yet
    const hasAssistantMessage = allMessages.some(m => m.role === 'assistant');
    if (!hasAssistantMessage) {
      allMessages = [
        {
          id: 'ai_analysis',
          role: 'assistant',
          content: aiAnalysisToUse,
          created_at: session.created_at
        },
        ...allMessages
      ];
    }
    // If onboarding is missing or onboardingError, just proceed with allMessages (no error)
    return Response.json({ sessionComplete: false, messages: allMessages });
  } catch (error) {
    console.error('❌ Error in /api/session:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 