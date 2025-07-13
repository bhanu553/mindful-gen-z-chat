
import { authenticateUser, setCorsHeaders } from './auth/middleware.js';

export default async function handler(req, res) {
  console.log('🚀 createSession API called');
  console.log('📋 Method:', req.method);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  // Authenticate user
  console.log('🔐 Starting authentication...');
  const auth = await authenticateUser(req);
  if (auth.error) {
    console.error('❌ Authentication failed:', auth.error);
    return res.status(auth.status).json({ error: auth.error });
  }

  const { user, supabase } = auth;
  console.log('✅ User authenticated:', { id: user.id, email: user.email });

  const { title, mode = 'reflect' } = req.body;
  console.log('📝 Session parameters:', { title, mode });

  try {
    console.log('💾 Creating session in Supabase...');
    
    // Create new session
    const sessionData = {
      user_id: user.id,
      title: title || 'New Therapy Session',
      current_mode: mode,
      message_count: 0
    };
    
    console.log('📊 Session data to insert:', JSON.stringify(sessionData, null, 2));

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error creating session:', JSON.stringify(error, null, 2));
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return res.status(500).json({ 
        error: 'Failed to create session',
        details: error.message,
        code: error.code
      });
    }

    if (!session) {
      console.error('❌ No session returned from Supabase');
      return res.status(500).json({ error: 'Session creation returned null' });
    }

    console.log('✅ Session created successfully:', JSON.stringify(session, null, 2));
    
    return res.status(201).json({ 
      session,
      debug: {
        userId: user.id,
        sessionId: session.id,
        title: session.title,
        mode: session.current_mode
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in createSession:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
