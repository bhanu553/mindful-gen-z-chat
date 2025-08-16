import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth token from request
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify user with auth token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user profile to check premium status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()

    const isPremium = profile?.is_premium || false

    if (req.method === 'POST') {
      const { action } = await req.json()

      if (action === 'createNewSession') {
        console.log('🆕 Creating new session after cooldown completion for user:', user.id)

        // Create new session
        const { data: newSession, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user.id,
            current_mode: 'evolve',
            title: 'New Session',
            message_count: 0,
            is_complete: false
          })
          .select()
          .single()

        if (sessionError) {
          console.error('❌ Error creating new session:', sessionError)
          return new Response(JSON.stringify({ error: 'Failed to create new session' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        // Generate new first message based on user type
        let firstMessage = ''
        if (isPremium) {
          firstMessage = `Welcome back to your therapy session! I'm Echo, and I'm glad you're here for this next part of your healing journey. 

Your integration period has concluded, and this is a fresh space for you to explore, process, and grow. 

How are you feeling as we begin this new session? What would you like to focus on today?`
        } else {
          firstMessage = `Welcome back! I'm Echo, your therapy companion. 

I see this is a new session - I'm here to support you on your continued healing journey. This is your space to explore, process, and discover new insights about yourself.

How are you feeling today? What would you like to explore in our time together?`
        }

        // Update session with first message
        const { error: updateError } = await supabase
          .from('chat_sessions')
          .update({ session_first_message: firstMessage })
          .eq('id', newSession.id)

        if (updateError) {
          console.error('❌ Error updating session with first message:', updateError)
        }

        console.log('✅ New session created with first message')

        return new Response(JSON.stringify({
          success: true,
          session: newSession,
          firstMessage
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Session cooldown error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})