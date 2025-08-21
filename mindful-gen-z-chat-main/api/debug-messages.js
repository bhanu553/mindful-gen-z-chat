import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Debug: Fetching data for user:', userId);

    // Get all sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id, created_at, updated_at, is_complete, session_first_message')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError);
      return Response.json({ 
        error: 'Failed to fetch sessions',
        details: sessionsError.message
      }, { status: 500 });
    }

    console.log('✅ Found sessions:', sessions?.length || 0);

    // Get all messages for this user
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, session_id, role, content, created_at, mode')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError);
      return Response.json({ 
        error: 'Failed to fetch messages',
        details: messagesError.message
      }, { status: 500 });
    }

    console.log('✅ Found messages:', messages?.length || 0);

    // Group messages by session for better analysis
    const messagesBySession = {};
    if (messages) {
      messages.forEach(msg => {
        if (!messagesBySession[msg.session_id]) {
          messagesBySession[msg.session_id] = [];
        }
        messagesBySession[msg.session_id].push(msg);
      });
    }

    // Return comprehensive debug information
    return Response.json({ 
      userId: userId,
      sessions: sessions || [],
      messages: messages || [],
      messagesBySession: messagesBySession,
      summary: {
        totalSessions: sessions?.length || 0,
        totalMessages: messages?.length || 0,
        sessionsWithMessages: Object.keys(messagesBySession).length,
        userMessages: messages?.filter(m => m.role === 'user').length || 0,
        assistantMessages: messages?.filter(m => m.role === 'assistant').length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error in /api/debug-messages:', error);
    return Response.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}
