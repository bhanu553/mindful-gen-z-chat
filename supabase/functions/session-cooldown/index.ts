import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  console.log('🕐 Session cooldown handler started')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      console.error('❌ Missing environment variables')
      return new Response(JSON.stringify({ 
        error: 'Missing required environment variables'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
      console.error('❌ Authentication failed:', authError?.message)
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Creating new session after cooldown for user:', user.id)

    // Check if user is premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()
    
    const isPremium = profile?.is_premium || false

    // Create new session
    const sessionData = {
      user_id: user.id,
      title: 'New Therapy Session',
      current_mode: 'evolve',
      message_count: 0,
      is_complete: false
    }

    console.log('💾 Creating new session...')
    const { data: newSession, error: createError } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating session:', createError)
      return new Response(JSON.stringify({ 
        error: 'Failed to create session'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate first message
    let firstMessage = ''
    const systemPrompt = isPremium 
      ? 'Welcome back to your therapy session. How are you feeling today and what would you like to explore in this session?'
      : 'Welcome to your therapy session. Take a moment to settle in. How are you feeling right now?'
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Start my new therapy session.' }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (openAIResponse.ok) {
      const openAIData = await openAIResponse.json()
      firstMessage = openAIData.choices?.[0]?.message?.content || systemPrompt
    } else {
      firstMessage = systemPrompt
    }

    // Update session with first message
    await supabase
      .from('chat_sessions')
      .update({ session_first_message: firstMessage })
      .eq('id', newSession.id)

    console.log('✅ New session created with first message')

    return new Response(JSON.stringify({
      success: true,
      sessionId: newSession.id,
      firstMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Session cooldown error:', error)
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})