import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "https://tvjqpmxugitehucwhdbk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImF1ZCI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k"
);

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
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
    // Get or create session
    const session = await getOrCreateCurrentSession(userId);
    if (session.is_complete) {
      return Response.json({ sessionComplete: true, messages: [] });
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
    if (onboarding && onboarding.ai_analysis) {
      // Only prepend if not already present
      const alreadyPresent = allMessages.some(
        m => m.content && m.content.trim() === onboarding.ai_analysis.trim()
      );
      if (!alreadyPresent) {
        allMessages = [
          {
            id: 'ai_analysis',
            role: 'assistant',
            content: onboarding.ai_analysis,
            created_at: session.created_at
          },
          ...allMessages
        ];
      }
    }
    return Response.json({ sessionComplete: false, messages: allMessages });
  } catch (error) {
    console.error('❌ Error in /api/session:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 