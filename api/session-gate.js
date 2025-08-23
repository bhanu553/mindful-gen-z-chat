import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return Response.json({ 
        error: "User ID required" 
      }, { status: 400 });
    }

    console.log(`🔍 Session gate check for user: ${userId}`);

    // Call the Supabase RPC function to check session eligibility
    const { data: eligibility, error } = await supabase.rpc('can_user_start_session', {
      user_uuid: userId
    });

    if (error) {
      console.error('❌ Error checking session eligibility:', error);
      return Response.json({ 
        error: "Failed to check session eligibility" 
      }, { status: 500 });
    }

    const result = eligibility[0];
    console.log('🔍 Session eligibility result:', result);

    if (!result.can_start) {
      // User cannot start session - return appropriate message
      let message = '';
      let cooldownRemaining = null;
      let hasCredit = false;

      switch (result.reason) {
        case 'Session already active':
          message = 'You already have an active therapy session. Please complete it before starting a new one.';
          break;
        case 'Cooldown active':
          message = 'Your previous session just ended. Please wait for the 10-minute cooldown to finish before starting your next session.';
          cooldownRemaining = result.cooldown_remaining;
          break;
        case 'Payment required':
          message = 'Payment required ($5.99) to start your next session.';
          break;
        default:
          message = 'Unable to start session at this time.';
      }

      return Response.json({
        canStart: false,
        reason: result.reason,
        message,
        cooldownRemaining,
        hasCredit: result.has_credit
      }, { status: 403 });
    }

    // User can start session - atomically redeem credit and create new session
    console.log('✅ User eligible to start session - redeeming credit and creating session');
    
    try {
      // Start a transaction to redeem credit and create session atomically
      const { data: credit, error: creditError } = await supabase
        .from('session_credits')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'unredeemed')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (creditError || !credit) {
        console.error('❌ No unredeemed credit found:', creditError);
        return Response.json({ 
          error: "No session credit available" 
        }, { status: 400 });
      }

      // Redeem the credit
      const { error: redeemError } = await supabase
        .from('session_credits')
        .update({ 
          status: 'redeemed',
          redeemed_at: new Date().toISOString()
        })
        .eq('id', credit.id);

      if (redeemError) {
        console.error('❌ Error redeeming credit:', redeemError);
        return Response.json({ 
          error: "Failed to redeem session credit" 
        }, { status: 500 });
      }

      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          is_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          .eq('id', credit.id);
        
        return Response.json({ 
          error: "Failed to create new session" 
        }, { status: 500 });
      }

      console.log('✅ Successfully created new session:', newSession.id);

      // Return session info and first message prompt
      return Response.json({
        canStart: true,
        sessionId: newSession.id,
        firstMessage: "🌟 **Welcome to Your New Therapy Session**\n\nI'm here to support you on your healing journey. What would you like to work on today?",
        message: "Starting your next session..."
      });

    } catch (transactionError) {
      console.error('❌ Transaction error:', transactionError);
      return Response.json({ 
        error: "Failed to process session start" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in session gate:', error);
    return Response.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
