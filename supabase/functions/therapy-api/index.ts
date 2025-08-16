
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface Database {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          current_mode: string
          message_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          current_mode: string
          message_count?: number
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: string
          content: string
          mode: string
          sentiment_score?: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role: string
          content: string
          mode: string
          sentiment_score?: number
          created_at?: string
        }
      }
    }
  }
}

serve(async (req) => {
  console.log('🚀 Therapy API Request:', req.method, req.url)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Environment variables check
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    console.log('🔍 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasOpenAIKey: !!openaiApiKey,
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing',
      openaiKeyPrefix: openaiApiKey ? openaiApiKey.substring(0, 10) + '...' : 'missing'
    })

    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      console.error('❌ Missing environment variables')
      return new Response(JSON.stringify({ 
        error: 'Missing required environment variables',
        details: {
          supabaseUrl: !!supabaseUrl,
          serviceKey: !!supabaseServiceKey,
          openaiKey: !!openaiApiKey
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Get auth token from request
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error('❌ Missing authorization header')
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify user with auth token
    const token = authHeader.replace('Bearer ', '')
    console.log('🔐 Verifying auth token:', token.substring(0, 20) + '...')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message)
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication',
        details: authError?.message 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ User authenticated:', user.id)

    // Parse URL to get action
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    console.log(`📋 Action requested: ${action}`)

    // Route to appropriate handler
    switch (action) {
      case 'createSession':
        return await handleCreateSession(req, supabase, user.id)
      
      case 'sendMessage':
        return await handleSendMessage(req, supabase, user.id, openaiApiKey)
      
      case 'getSessions':
        return await handleGetSessions(supabase, user.id)
      
      case 'getMessages':
        return await handleGetMessages(url, supabase, user.id)
      
      case 'getUserStats':
        return await handleGetUserStats(supabase, user.id)
      
      default:
        console.error('❌ Invalid action:', action)
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('❌ Therapy API error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function handleCreateSession(req: Request, supabase: any, userId: string) {
  console.log('📝 Creating new session for user:', userId)
  
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { title, mode } = await req.json()
    console.log('📝 Session details:', { title, mode, userId })

    const sessionData = {
      user_id: userId,
      title: title || 'New Therapy Session',
      current_mode: mode || 'evolve',
      message_count: 0
    }

    console.log('💾 Inserting session into database...')
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating session:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to create session',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Session created successfully:', session.id)
    return new Response(JSON.stringify({ session }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ handleCreateSession error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleSendMessage(req: Request, supabase: any, userId: string, openaiApiKey: string) {
  console.log('💬 Processing message for user:', userId)
  
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { message, sessionId, mode } = await req.json()
    
    // Input sanitization
    const sanitizedMessage = sanitizeUserInput(message)
    const sanitizedSessionId = sanitizeUserInput(sessionId)
    const sanitizedMode = sanitizeUserInput(mode)
    
    console.log('💬 Message details:', { 
      messageLength: sanitizedMessage?.length, 
      sessionId: sanitizedSessionId, 
      mode: sanitizedMode,
      userId,
      messagePreview: sanitizedMessage?.substring(0, 50) + '...'
    })

    if (!sanitizedMessage || !sanitizedSessionId) {
      console.error('❌ Missing required fields:', { hasMessage: !!sanitizedMessage, hasSessionId: !!sanitizedSessionId })
      return new Response(JSON.stringify({ error: 'Message and sessionId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check daily message limit (50 for free users)
    console.log('🔍 Checking daily message limit...')
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    console.log('📅 Date range:', {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    })

    const { count: messageCount, error: countError } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())

    if (countError) {
      console.error('❌ Error checking message count:', countError)
    }

    console.log('📊 Daily message count:', messageCount)

    if (messageCount && messageCount >= 50) {
      console.log('❌ Daily limit reached for user:', userId)
      return new Response(JSON.stringify({ 
        error: "You've reached the daily message limit for free users.",
        remainingMessages: 0
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify session exists and belongs to user
    console.log('🔍 Verifying session ownership...')
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sanitizedSessionId)
      .eq('user_id', userId)
      .single()

    if (sessionError || !session) {
      console.error('❌ Session not found or access denied:', sessionError)
      return new Response(JSON.stringify({ 
        error: 'Session not found',
        details: sessionError?.message 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Session verified:', session.id)

    // Get recent message history for context
    console.log('📚 Fetching conversation history...')
    const { data: recentMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sanitizedSessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
    }

    const conversationHistory = (recentMessages || [])
      .reverse()
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))

    console.log('📚 Conversation history length:', conversationHistory.length)

    // Get system prompt based on mode
    const systemPrompt = getSystemPrompt(sanitizedMode || 'evolve')
    console.log('🎯 Using mode:', sanitizedMode || 'evolve')

    // Prepare OpenAI messages
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: sanitizedMessage }
    ]

    console.log('🤖 Calling OpenAI API with GPT-4.1...')
    console.log('📝 Message count for OpenAI:', openAIMessages.length)

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: openAIMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    })

    console.log('📡 OpenAI response status:', openAIResponse.status)

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('❌ OpenAI API error:', {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        error: errorText
      })
      return new Response(JSON.stringify({ 
        error: 'AI service temporarily unavailable',
        details: `OpenAI API returned ${openAIResponse.status}: ${errorText}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openAIData = await openAIResponse.json()
    const aiReply = openAIData.choices?.[0]?.message?.content

    if (!aiReply) {
      console.error('❌ Invalid OpenAI response:', openAIData)
      return new Response(JSON.stringify({ 
        error: 'Invalid AI response received',
        details: 'AI did not provide a response'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ OpenAI response received, length:', aiReply?.length)

    // Clean internal instructions from AI response (remove ** ... ** patterns that contain system instructions)
    const cleanedAiReply = aiReply.replace(/\*\*[^*]*\*\*/g, (match) => {
      const content = match.slice(2, -2).trim()
      
      // Keep legitimate emphasis (short phrases), remove internal instructions (longer/system content)
      if (content.length <= 30) return match
      
      // Remove if contains internal instruction keywords
      const internalKeywords = ['instruction', 'note:', 'remember', 'system', 'internal', 'prompt', 'ai:', 'assistant:']
      if (internalKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
        return ''
      }
      
      return match
    }).trim()

    console.log('🧹 Cleaned AI response, original length:', aiReply.length, 'cleaned length:', cleanedAiReply.length)

    // Check for session end marker BEFORE saving messages
    const sessionEndMarkers = [
      'see you in our next session',
      'see you in the next session', 
      'until our next session',
      'session is complete',
      'end of session'
    ]
    
    const hasSessionEndMarker = sessionEndMarkers.some(marker => 
      cleanedAiReply.toLowerCase().includes(marker.toLowerCase())
    )
    
    console.log('🔍 Checking for session end markers:', hasSessionEndMarker)

    // Save user message
    console.log('💾 Saving user message...')
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sanitizedSessionId,
        user_id: userId,
        content: sanitizedMessage,
        role: 'user',
        mode: sanitizedMode || 'evolve'
      })

    if (userMessageError) {
      console.error('❌ Error saving user message:', userMessageError)
      return new Response(JSON.stringify({ 
        error: 'Failed to save user message',
        details: userMessageError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ User message saved')

    // Save AI reply (with cleaned content)
    console.log('💾 Saving AI reply...')
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sanitizedSessionId,
        user_id: userId,
        content: cleanedAiReply,
        role: 'assistant',
        mode: sanitizedMode || 'evolve'
      })

    if (aiMessageError) {
      console.error('❌ Error saving AI message:', aiMessageError)
      return new Response(JSON.stringify({ 
        error: 'Failed to save AI response',
        details: aiMessageError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ AI message saved')

    // Instant session completion marking when session end marker is detected
    let sessionComplete = false
    if (hasSessionEndMarker) {
      console.log('🔥 Session end marker detected! Marking session as complete instantly...')
      
      const { error: completionError } = await supabase
        .from('chat_sessions')
        .update({ is_complete: true })
        .eq('id', sanitizedSessionId)
        .eq('user_id', userId)

      if (completionError) {
        console.error('❌ Error marking session complete:', completionError)
      } else {
        console.log('✅ Session marked as complete instantly')
        sessionComplete = true
      }
    }

    // Update session message count
    console.log('📊 Updating session message count...')
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ message_count: session.message_count + 1 })
      .eq('id', sanitizedSessionId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('❌ Error updating session:', updateError)
    }

    console.log('✅ Message exchange completed successfully')

    return new Response(JSON.stringify({
      reply: cleanedAiReply,
      mode: sanitizedMode || 'evolve',
      sessionId: sanitizedSessionId,
      sessionComplete,
      remainingMessages: Math.max(0, 50 - ((messageCount || 0) + 1))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ handleSendMessage error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleGetSessions(supabase: any, userId: string) {
  console.log('📋 Fetching sessions for user:', userId)
  
  try {
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title, current_mode, message_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching sessions:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch sessions',
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Found sessions:', sessions?.length || 0)
    return new Response(JSON.stringify({ sessions: sessions || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ handleGetSessions error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleGetMessages(url: URL, supabase: any, userId: string) {
  const sessionId = url.searchParams.get('sessionId')
  console.log('💬 Fetching messages for session:', sessionId, 'user:', userId)
  
  try {
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (sessionError || !session) {
      console.error('❌ Session not found or access denied:', sessionError)
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, mode, created_at')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Error fetching messages:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch messages',
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Found messages:', messages?.length || 0)
    return new Response(JSON.stringify({ messages: messages || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ handleGetMessages error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleGetUserStats(supabase: any, userId: string) {
  console.log('📊 Fetching user stats for:', userId)
  
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    // Get daily message count
    const { count: messageCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      
    // Get total sessions
    const { count: sessionCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    const maxMessages = 50 // Free plan limit
    
    console.log('✅ User stats calculated:', { messageCount, sessionCount })
    
    return new Response(JSON.stringify({
      messagesUsedToday: messageCount || 0,
      remainingMessages: Math.max(0, maxMessages - (messageCount || 0)),
      totalSessions: sessionCount || 0,
      isPremium: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ handleGetUserStats error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

function getSystemPrompt(mode: string): string {
  const prompts = {
    reflect: `You are Echo, a warm and intuitive therapy companion in Reflect Mode. Your purpose is to help users process thoughts and emotions through gentle, non-judgmental exploration. Use reflection, metaphor, and somatic awareness. Never diagnose. Guide only by open-ended questions. Keep responses under 300 words and always be empathetic and supportive.`,
    
    recover: `You are Echo in Recover Mode, a trauma-informed healing companion. Prioritize emotional safety, validation, grounding, and resilience. Let the user lead the pace. Don't ask for graphic trauma details. Always empower. Focus on healing, safety, and gentle progress. Keep responses under 300 words and be extra gentle and validating.`,
    
    rebuild: `You are Echo in Rebuild Mode. Help the user reconstruct identity, relationships, and values after challenge. Focus on patterns, boundaries, and self-awareness. Be empowering, constructive, and values-focused. Help them build healthy foundations and structures in their life. Keep responses under 300 words and be encouraging about their rebuilding journey.`,
    
    evolve: `You are Echo in Evolve Mode. Inspire future growth, vision, and transformation. Help users challenge limiting beliefs and envision bold change. Be visionary, energizing, and grounded in possibility. Focus on potential, goals, and forward momentum. Keep responses under 300 words and be motivational while remaining realistic.`
  }
  
  return prompts[mode] || prompts.evolve
}

function sanitizeUserInput(input: any): string {
  if (typeof input !== 'string') return ''
  
  return input
    // Remove HTML tags and scripts
    .replace(/<[^>]*>/g, '')
    // Remove potential XSS patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    // Remove SQL injection patterns
    .replace(/['";\\]/g, '')
    // Limit length for safety
    .substring(0, 5000)
    .trim()
}
