import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Global cooldown duration: 10 minutes
const COOLDOWN_DURATION_MINUTES = 10;

export async function POST(req) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return Response.json({ error: "No userId provided." }, { status: 400 });
    }

    console.log(`🔍 Session gate check for user: ${userId}`);

    // Use the database function to check if user can start a session
    const { data: gateResult, error: gateError } = await supabase
      .rpc('can_user_start_session', { user_uuid: userId });

    if (gateError) {
      console.error('❌ Error checking session gate:', gateError);
      return Response.json({ error: "Failed to check session eligibility" }, { status: 500 });
    }

    const gateInfo = gateResult[0];
    console.log(`🔍 Gate result:`, gateInfo);

    if (!gateInfo.can_start) {
      // User cannot start a session - return appropriate message
      let message = '';
      let cooldownRemaining = null;
      
      if (gateInfo.reason === 'Session already active') {
        message = 'You already have an active session. Please continue with your current session.';
      } else if (gateInfo.reason === 'Cooldown active') {
        const cooldownMs = gateInfo.cooldown_remaining;
        const minutes = Math.floor(cooldownMs / (1000 * 60));
        const seconds = Math.floor((cooldownMs % (1000 * 60)) / 1000);
        cooldownRemaining = { minutes, seconds };
        
        // Check if user has an unredeemed credit
        const { data: credits, error: creditError } = await supabase
          .from('session_credits')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'unredeemed')
          .limit(1);
        
        if (creditError) {
          console.error('❌ Error checking credits:', creditError);
        }
        
        if (credits && credits.length > 0) {
          message = `Payment received. Waiting for cooldown to end (${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}).`;
        } else {
          message = `Next session unlocks for $5.99 per session after your 10-minute cooldown. You can pay now; your session will start automatically when the cooldown ends.`;
        }
      } else if (gateInfo.reason === 'Payment required') {
        message = 'Pay $5.99 to start your next session.';
      }
      
      return Response.json({
        canStart: false,
        reason: gateInfo.reason,
        message,
        cooldownRemaining,
        hasCredit: gateInfo.has_credit
      });
    }

    // User can start a session - consume one credit and create new session
    console.log('✅ User can start session - consuming credit and creating new session');
    
    // Start a transaction to consume credit and create session atomically
    const { data: creditToRedeem, error: creditError } = await supabase
      .from('session_credits')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'unredeemed')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (creditError || !creditToRedeem) {
      console.error('❌ Error finding unredeemed credit:', creditError);
      return Response.json({ error: "No payment credit available" }, { status: 400 });
    }

    // Mark credit as redeemed
    const { error: redeemError } = await supabase
      .from('session_credits')
      .update({ 
        status: 'redeemed',
        redeemed_at: new Date().toISOString()
      })
      .eq('id', creditToRedeem.id);

    if (redeemError) {
      console.error('❌ Error redeeming credit:', redeemError);
      return Response.json({ error: "Failed to redeem payment credit" }, { status: 500 });
    }

    // Create new session
    const { data: newSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        is_complete: false,
        created_at: new Date().toISOString(),
        title: 'New Therapy Session',
        current_mode: 'evolve'
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Error creating new session:', sessionError);
      // Try to revert credit redemption
      await supabase
        .from('session_credits')
        .update({ 
          status: 'unredeemed',
          redeemed_at: null
        })
        .eq('id', creditToRedeem.id);
      
      return Response.json({ error: "Failed to create new session" }, { status: 500 });
    }

    console.log('✅ New session created successfully:', newSession.id);

    // Return session info with first message
    return Response.json({
      canStart: true,
      sessionId: newSession.id,
      message: 'Starting your next session...',
      firstMessage: 'Welcome back to your therapy session. How are you feeling today and what would you like to explore in this session?'
    });

  } catch (error) {
    console.error('❌ Error in session gate:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
