
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Therapy API called')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasOpenAIKey: !!openaiApiKey
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ User authenticated:', user.id)

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    console.log(`📋 Action requested: ${action}`)

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
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { title, mode } = await req.json()
    console.log('📝 Creating session:', { title, mode, userId })

    const sessionData = {
      user_id: userId,
      title: title || 'New Therapy Session',
      current_mode: mode || 'evolve',
      message_count: 0
    }

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
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { message, sessionId, mode } = await req.json()
    console.log('💬 Processing message:', { message: message?.substring(0, 50), sessionId, mode })

    if (!message || !sessionId) {
      return new Response(JSON.stringify({ error: 'Message and sessionId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check daily message limit (50 for free users)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const { count: messageCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())

    if (messageCount >= 50) {
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
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (sessionError || !session) {
      console.error('❌ Session not found:', sessionError)
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get recent message history for context
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const conversationHistory = (recentMessages || [])
      .reverse()
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))

    // Get system prompt based on mode
    const systemPrompt = getSystemPrompt(mode || 'evolve')

    // Call OpenAI GPT-4o
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    console.log('🤖 Calling OpenAI API with GPT-4o...')

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openAIMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('❌ OpenAI API error:', errorText)
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openAIData = await openAIResponse.json()
    const aiReply = openAIData.choices[0].message.content

    console.log('✅ OpenAI response received')

    // Save user message
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        content: message,
        role: 'user',
        mode: mode || 'evolve'
      })

    if (userMessageError) {
      console.error('❌ Error saving user message:', userMessageError)
      return new Response(JSON.stringify({ error: 'Failed to save user message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save AI reply
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        content: aiReply,
        role: 'assistant',
        mode: mode || 'evolve'
      })

    if (aiMessageError) {
      console.error('❌ Error saving AI message:', aiMessageError)
      return new Response(JSON.stringify({ error: 'Failed to save AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update session message count
    await supabase
      .from('chat_sessions')
      .update({ message_count: session.message_count + 1 })
      .eq('id', sessionId)
      .eq('user_id', userId)

    console.log('✅ Message exchange completed successfully')

    return new Response(JSON.stringify({
      reply: aiReply,
      mode: mode || 'evolve',
      sessionId,
      remainingMessages: Math.max(0, 50 - (messageCount + 1))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ handleSendMessage error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleGetSessions(supabase: any, userId: string) {
  try {
    console.log('📋 Fetching sessions for user:', userId)
    
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title, current_mode, message_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching sessions:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch sessions' }), {
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
  try {
    const sessionId = url.searchParams.get('sessionId')
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('💬 Fetching messages for session:', sessionId)

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (sessionError || !session) {
      console.error('❌ Session not found:', sessionError)
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
      return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), {
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
  try {
    console.log('📊 Fetching user stats for:', userId)
    
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    // Get daily message count
    const { count: messageCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      
    // Get total sessions
    const { count: sessionCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact' })
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
