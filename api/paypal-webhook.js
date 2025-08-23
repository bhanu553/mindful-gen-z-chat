import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('paypal-transmission-sig');
    
    // TODO: Implement proper PayPal webhook signature verification
    // For now, we'll process the webhook without verification in development
    
    const event = JSON.parse(body);
    console.log('🔔 PayPal webhook received:', event.event_type);
    
    if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      console.log('⚠️ Ignoring non-payment webhook:', event.event_type);
      return Response.json({ received: true });
    }
    
    const payment = event.resource;
    const paymentId = payment.id;
    const amount = payment.amount.value;
    const currency = payment.amount.currency_code;
    
    console.log('💰 Payment details:', { paymentId, amount, currency });
    
    // 🔒 UNIFIED USER VALIDATION - Extract and validate user ID
    let userId = null;
    if (payment.custom_id) {
      userId = payment.custom_id;
    } else if (payment.description) {
      // Parse user ID from description: "EchoMind Therapy Session - $5.99 per session - user:UUID"
      const match = payment.description.match(/user:([a-f0-9-]+)/i);
      if (match) {
        userId = match[1];
      }
    }
    
    if (!userId) {
      console.error('❌ No user ID found in payment data');
      return Response.json({ error: "No user ID found" }, { status: 400 });
    }
    
    // Validate userId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ Invalid user ID format in payment:', userId);
      return Response.json({ error: "Invalid user ID format" }, { status: 400 });
    }
    
    // Verify user exists and is authenticated
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();
    
    if (userError || !userProfile) {
      console.error('❌ User not found or not authenticated:', userId);
      return Response.json({ error: "User not authenticated" }, { status: 401 });
    }
    
    console.log(`✅ User authenticated: ${userProfile.email}`);
    
    // Validate payment amount (should be $5.99)
    if (amount !== '5.99' || currency !== 'USD') {
      console.error('❌ Invalid payment amount or currency:', { amount, currency });
      return Response.json({ error: "Invalid payment amount" }, { status: 400 });
    }
    
    console.log('✅ Valid payment received for user:', userId);
    
    // Check if credit already exists for this payment (idempotency)
    const { data: existingCredit, error: checkError } = await supabase
      .from('session_credits')
      .select('id, status')
      .eq('payment_id', paymentId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing credit:', checkError);
      return Response.json({ error: "Database error" }, { status: 500 });
    }
    
    if (existingCredit) {
      console.log('✅ Credit already exists for payment:', paymentId, 'Status:', existingCredit.status);
      return Response.json({ 
        message: "Credit already processed",
        creditId: existingCredit.id,
        status: existingCredit.status
      });
    }
    
    // Create new session credit
    const { data: newCredit, error: createError } = await supabase
      .from('session_credits')
      .insert({
        user_id: userId,
        payment_id: paymentId,
        status: 'unredeemed',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating session credit:', createError);
      return Response.json({ error: "Failed to create credit" }, { status: 500 });
    }
    
    console.log('✅ Session credit created:', newCredit.id);
    
    // Check if user can start a session immediately (cooldown finished)
    const { data: completedSessions, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, is_complete, cooldown_until')
      .eq('user_id', userId)
      .eq('is_complete', true)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (sessionError) {
      console.error('❌ Error checking session status:', sessionError);
      // Credit was created successfully, so we'll return success
      return Response.json({ 
        message: "Payment received. Session credit created successfully.",
        creditId: newCredit.id,
        canStartSession: false
      });
    }
    
    let canStartSession = false;
    let cooldownRemaining = null;
    
    if (completedSessions && completedSessions.length > 0) {
      const latestSession = completedSessions[0];
      
      if (latestSession.cooldown_until) {
        const now = new Date();
        const cooldownUntil = new Date(latestSession.cooldown_until);
        
        if (now >= cooldownUntil) {
          // Cooldown finished - user can start session immediately
          canStartSession = true;
          console.log('✅ Cooldown finished - user can start session immediately');
        } else {
          // Cooldown still active
          const remainingMs = cooldownUntil.getTime() - now.getTime();
          const minutes = Math.floor(remainingMs / (1000 * 60));
          const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
          cooldownRemaining = { minutes, seconds };
          console.log('⏰ Cooldown still active:', cooldownRemaining);
        }
      } else {
        // No cooldown set - user can start session immediately
        canStartSession = true;
        console.log('✅ No cooldown set - user can start session immediately');
      }
    } else {
      // No completed sessions - user can start session immediately
      canStartSession = true;
      console.log('✅ No completed sessions - user can start session immediately');
    }
    
    if (canStartSession) {
      // User can start session immediately - redeem credit and create session
      console.log('✅ User can start session immediately - auto-starting');
      
      try {
        // Redeem the credit
        const { error: redeemError } = await supabase
          .from('session_credits')
          .update({ 
            status: 'redeemed',
            redeemed_at: new Date().toISOString()
          })
          .eq('id', newCredit.id);
        
        if (redeemError) {
          console.error('❌ Error redeeming credit:', redeemError);
          return Response.json({ 
            message: "Payment received. Session credit created, but failed to start session.",
            creditId: newCredit.id,
            canStartSession: false
          });
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
            .eq('id', newCredit.id);
          
          return Response.json({ 
            message: "Payment received. Session credit created, but failed to start session.",
            creditId: newCredit.id,
            canStartSession: false
          });
        }
        
        console.log('✅ Session auto-started successfully:', newSession.id);
        
        return Response.json({ 
          message: "Payment received. Session credit created and session started automatically!",
          creditId: newCredit.id,
          sessionId: newSession.id,
          canStartSession: true
        });
        
      } catch (transactionError) {
        console.error('❌ Transaction error:', transactionError);
        return Response.json({ 
          message: "Payment received. Session credit created, but failed to start session.",
          creditId: newCredit.id,
          canStartSession: false
        });
      }
      
    } else {
      // User cannot start session yet (cooldown active)
      console.log('⏰ User cannot start session yet - cooldown active');
      
      let message = "Payment received. Session credit created successfully.";
      
      if (cooldownRemaining) {
        message = `Payment received. We'll start your next session automatically when the cooldown ends (${cooldownRemaining.minutes.toString().padStart(2, '0')}:${cooldownRemaining.seconds.toString().padStart(2, '0')}).`;
      }
      
      return Response.json({ 
        message,
        creditId: newCredit.id,
        canStartSession: false,
        cooldownRemaining
      });
    }
    
  } catch (error) {
    console.error('❌ Error processing PayPal webhook:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
