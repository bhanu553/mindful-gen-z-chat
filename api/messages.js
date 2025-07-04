
import { authenticateUser, setCorsHeaders } from './auth/middleware.js';
import { checkDailyLimit } from './utils/dailyLimits.js';
import { detectOptimalMode, getSystemPrompt } from './utils/modeDetection.js';
import { calculateSentiment } from './utils/sentiment.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
  const { message, currentMode, sessionId } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    return res.status(500).json({ error: 'AI service not configured' });
  }

  try {
    // Check daily message limit
    const limitCheck = await checkDailyLimit(supabase, user.id);
    if (limitCheck.error) {
      return res.status(limitCheck.status).json({ error: limitCheck.error });
    }
    
    if (limitCheck.isLimitReached) {
      return res.status(429).json({ 
        error: "You've reached the daily message limit for free users.",
        remainingMessages: 0
      });
    }

    // Detect optimal mode from message content
    const detectedMode = currentMode || detectOptimalMode(message);
    console.log('🧠 Mode Detection:', detectedMode, 'for message:', message.substring(0, 50));

    // Find or create session
    let session;
    let modeChanged = false;

    if (sessionId) {
      // Get existing session
      const { data: existingSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !existingSession) {
        console.log('Session not found, creating new one');
        session = null;
      } else {
        session = existingSession;
        modeChanged = session.current_mode !== detectedMode;
      }
    }

    // Create new session if needed or mode changed
    if (!session || modeChanged) {
      const sessionTitle = message.length > 50 ? 
        message.substring(0, 50) + '...' : 
        message;

      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: sessionTitle,
          current_mode: detectedMode,
          message_count: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating session:', createError);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      // Log mode transition if this was a mode change
      if (modeChanged && session) {
        await supabase
          .from('mode_transitions')
          .insert({
            session_id: session.id,
            user_id: user.id,
            old_mode: session.current_mode,
            new_mode: detectedMode
          });
      }

      session = newSession;
    }

    // Get recent message history for context (last 10 messages)
    const { data: recentMessages, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content, mode')
      .eq('session_id', session.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching message history:', historyError);
    }

    // Prepare conversation history for OpenAI (reverse to get chronological order)
    const conversationHistory = (recentMessages || [])
      .reverse()
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    // Get system prompt for detected mode
    const systemPrompt = getSystemPrompt(detectedMode);

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('🚀 Making OpenAI API call with', openAIMessages.length, 'messages');
    console.log('📝 System prompt for', detectedMode, 'mode:', systemPrompt.substring(0, 100) + '...');

    // Call OpenAI GPT-4o - MANDATORY API CALL - NO FALLBACKS ALLOWED
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

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ OpenAI API error:', openAIResponse.status, errorText);
      return res.status(500).json({ error: 'AI service temporarily unavailable' });
    }

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', openAIData);
      return res.status(500).json({ error: 'Invalid AI response' });
    }

    const aiReply = openAIData.choices[0].message.content;
    console.log('✅ OpenAI response received:', aiReply.substring(0, 100) + '...');

    // Validate that we got a real response, not a system prompt or error
    if (!aiReply || aiReply.trim().length === 0) {
      console.error('❌ Empty response from OpenAI');
      return res.status(500).json({ error: 'No response generated' });
    }

    // Additional validation - ensure response is not just the system prompt
    if (aiReply.trim() === systemPrompt.trim()) {
      console.error('❌ OpenAI returned system prompt as response');
      return res.status(500).json({ error: 'Invalid AI response generated' });
    }

    // Calculate sentiment score for user message
    const sentimentScore = calculateSentiment(message);

    // Save user message to database
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: user.id,
        content: message,
        role: 'user',
        mode: detectedMode,
        sentiment_score: sentimentScore
      });

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
      return res.status(500).json({ error: 'Failed to save message' });
    }

    // Save AI reply to database
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: user.id,
        content: aiReply,
        role: 'assistant',
        mode: detectedMode
      });

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError);
      return res.status(500).json({ error: 'Failed to save AI response' });
    }

    // Update session message count
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ 
        message_count: session.message_count + 1,
        current_mode: detectedMode
      })
      .eq('id', session.id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating session:', updateError);
    }

    // Prepare response - ONLY use OpenAI generated content
    let responseReply = aiReply;
    if (modeChanged) {
      responseReply = `I sense we're entering ${detectedMode} territory... ${aiReply}`;
    }

    // Return ONLY OpenAI generated response - NO HARDCODED CONTENT
    return res.status(200).json({
      reply: responseReply,
      mode: detectedMode,
      sessionId: session.id,
      remainingMessages: Math.max(0, 50 - (limitCheck.messageCount + 1))
    });

  } catch (error) {
    console.error('❌ Messages API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
