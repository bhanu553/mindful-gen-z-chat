
import { authenticateUser, setCorsHeaders } from './auth/middleware.js';
import { checkDailyLimit } from './utils/dailyLimits.js';
import { detectOptimalMode, getSystemPrompt } from './utils/modeDetection.js';
import { calculateSentiment } from './utils/sentiment.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  console.log('🚀 sendMessage API called');
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

  const { message, sessionId, mode } = req.body;
  console.log('📝 Message parameters:', { 
    messageLength: message?.length, 
    sessionId, 
    mode,
    messagePreview: message?.substring(0, 50) + '...'
  });

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    console.error('❌ Invalid message:', { message, type: typeof message });
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!sessionId) {
    console.error('❌ Missing sessionId');
    return res.status(400).json({ error: 'Session ID is required' });
  }

  if (!OPENAI_API_KEY) {
    console.error('❌ OpenAI API key not configured');
    return res.status(500).json({ error: 'AI service not configured' });
  }

  try {
    console.log('🚀 Processing message for session:', sessionId);

    // Check daily message limit
    console.log('📊 Checking daily limits...');
    const limitCheck = await checkDailyLimit(supabase, user.id);
    if (limitCheck.error) {
      console.error('❌ Daily limit check failed:', limitCheck.error);
      return res.status(limitCheck.status).json({ error: limitCheck.error });
    }
    
    if (limitCheck.isLimitReached) {
      console.log('⚠️ Daily limit reached for user:', user.id);
      return res.status(429).json({ 
        error: "You've reached the daily message limit for free users.",
        remainingMessages: 0
      });
    }

    console.log('✅ Daily limit check passed:', { messageCount: limitCheck.messageCount });

    // Verify session exists and belongs to user
    console.log('🔍 Verifying session exists...');
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError) {
      console.error('❌ Session query error:', JSON.stringify(sessionError, null, 2));
      return res.status(404).json({ 
        error: 'Session not found',
        details: sessionError.message,
        sessionId
      });
    }

    if (!session) {
      console.error('❌ Session not found for:', { sessionId, userId: user.id });
      return res.status(404).json({ error: 'Session not found' });
    }

    console.log('✅ Session verified:', { 
      id: session.id, 
      title: session.title, 
      messageCount: session.message_count 
    });

    // Detect optimal mode from message content
    const detectedMode = mode || detectOptimalMode(message);
    console.log('🧠 Mode Detection:', { originalMode: mode, detectedMode });

    // Get recent message history for context (last 10 messages)
    console.log('📚 Fetching message history...');
    const { data: recentMessages, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('⚠️ Error fetching message history:', historyError);
    }

    console.log('📚 Message history loaded:', { count: recentMessages?.length || 0 });

    // Prepare conversation history for OpenAI (reverse to get chronological order)
    const conversationHistory = (recentMessages || [])
      .reverse()
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    console.log('💭 Conversation history prepared:', conversationHistory.length, 'messages');

    // Get system prompt for detected mode
    const systemPrompt = getSystemPrompt(detectedMode);
    console.log('🎯 System prompt selected for mode:', detectedMode);

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('🤖 Making OpenAI API call with', openAIMessages.length, 'messages');
    console.log('🤖 OpenAI request preview:', {
      model: 'gpt-4o',
      messageCount: openAIMessages.length,
      systemPromptLength: systemPrompt.length,
      userMessageLength: message.length
    });

    // Call OpenAI GPT-4o
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openAIMessages,
        temperature: 0.8,
        max_tokens: 500,
        stream: false
      }),
    });

    console.log('📡 OpenAI response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ OpenAI API error:', {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        error: errorText
      });
      return res.status(500).json({ 
        error: 'AI service temporarily unavailable',
        details: `OpenAI API returned ${openAIResponse.status}: ${errorText}`
      });
    }

    const openAIData = await openAIResponse.json();
    console.log('📡 OpenAI response received:', {
      choices: openAIData.choices?.length,
      usage: openAIData.usage,
      model: openAIData.model
    });
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', JSON.stringify(openAIData, null, 2));
      return res.status(500).json({ error: 'Invalid AI response structure' });
    }

    const aiReply = openAIData.choices[0].message.content;
    console.log('✅ OpenAI response received:', {
      length: aiReply.length,
      preview: aiReply.substring(0, 100) + '...'
    });

    // Calculate sentiment score for user message
    const sentimentScore = calculateSentiment(message);
    console.log('📊 Sentiment calculated:', sentimentScore);

    // Save user message to database
    console.log('💾 Saving user message...');
    const userMessageData = {
      session_id: sessionId,
      user_id: user.id,
      content: message,
      role: 'user',
      mode: detectedMode,
      sentiment_score: sentimentScore
    };

    console.log('💾 User message data:', JSON.stringify(userMessageData, null, 2));

    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert(userMessageData);

    if (userMessageError) {
      console.error('❌ Error saving user message:', JSON.stringify(userMessageError, null, 2));
      return res.status(500).json({ 
        error: 'Failed to save user message',
        details: userMessageError.message
      });
    }

    console.log('✅ User message saved successfully');

    // Save AI reply to database
    console.log('💾 Saving AI message...');
    const aiMessageData = {
      session_id: sessionId,
      user_id: user.id,
      content: aiReply,
      role: 'assistant',
      mode: detectedMode
    };

    console.log('💾 AI message data:', JSON.stringify(aiMessageData, null, 2));

    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert(aiMessageData);

    if (aiMessageError) {
      console.error('❌ Error saving AI message:', JSON.stringify(aiMessageError, null, 2));
      return res.status(500).json({ 
        error: 'Failed to save AI response',
        details: aiMessageError.message
      });
    }

    console.log('✅ AI message saved successfully');

    // Update session message count and mode
    console.log('📊 Updating session...');
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ 
        message_count: session.message_count + 1,
        current_mode: detectedMode
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('⚠️ Error updating session:', updateError);
    } else {
      console.log('✅ Session updated successfully');
    }

    console.log('✅ Message exchange completed successfully');

    // Return the AI response
    return res.status(200).json({
      reply: aiReply,
      mode: detectedMode,
      sessionId: sessionId,
      remainingMessages: Math.max(0, 50 - (limitCheck.messageCount + 1)),
      debug: {
        openAIUsage: openAIData.usage,
        sentimentScore,
        messagesSaved: 2,
        sessionUpdated: !updateError
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in sendMessage:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
