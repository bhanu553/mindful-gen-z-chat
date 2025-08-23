import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('paypal-transmission-sig');
    const certUrl = req.headers.get('paypal-cert-url');
    const authAlgo = req.headers.get('paypal-auth-algo');
    const transmissionId = req.headers.get('paypal-transmission-id');
    const timestamp = req.headers.get('paypal-transmission-time');

    // TODO: Implement proper PayPal webhook signature verification
    // For now, we'll process the webhook (in production, verify signature)
    
    const event = JSON.parse(body);
    console.log('🔔 PayPal webhook received:', event.event_type);

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const payment = event.resource;
      const paymentId = payment.id;
      const amount = payment.amount.value;
      const currency = payment.amount.currency_code;
      
      console.log(`💰 Payment completed: ${paymentId}, Amount: ${amount} ${currency}`);

      // Extract user ID from custom_id or description
      // This should be set when creating the PayPal order
      let userId = null;
      
      if (payment.custom_id) {
        userId = payment.custom_id;
      } else if (payment.description && payment.description.includes('user:')) {
        // Extract from description if custom_id not available
        const match = payment.description.match(/user:([a-f0-9-]+)/);
        if (match) {
          userId = match[1];
        }
      }

      if (!userId) {
        console.error('❌ No user ID found in payment data');
        return Response.json({ error: "No user ID found" }, { status: 400 });
      }

      // Verify user exists
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('❌ User not found:', userId);
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      // Check if payment_id already exists (idempotency)
      const { data: existingCredit, error: checkError } = await supabase
        .from('session_credits')
        .select('id')
        .eq('payment_id', paymentId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error checking existing credit:', checkError);
        return Response.json({ error: "Failed to check existing credit" }, { status: 500 });
      }

      if (existingCredit) {
        console.log('✅ Credit already exists for payment:', paymentId);
        return Response.json({ message: "Credit already exists" });
      }

      // Create session credit
      const { data: credit, error: creditError } = await supabase
        .from('session_credits')
        .insert({
          user_id: userId,
          payment_id: paymentId,
          status: 'unredeemed'
        })
        .select()
        .single();

      if (creditError) {
        console.error('❌ Error creating session credit:', creditError);
        return Response.json({ error: "Failed to create session credit" }, { status: 500 });
      }

      console.log('✅ Session credit created:', credit.id);

      // Check if user can start a session immediately (cooldown finished)
      const { data: gateResult, error: gateError } = await supabase
        .rpc('can_user_start_session', { user_uuid: userId });

      if (gateError) {
        console.error('❌ Error checking session gate:', gateError);
        // Credit was created successfully, so return success
        return Response.json({ 
          message: "Credit created successfully",
          creditId: credit.id
        });
      }

      const gateInfo = gateResult[0];
      
      if (gateInfo.can_start) {
        // User can start session immediately - redeem credit and create session
        console.log('✅ User can start session immediately - auto-starting');
        
        // Mark credit as redeemed
        const { error: redeemError } = await supabase
          .from('session_credits')
          .update({ 
            status: 'redeemed',
            redeemed_at: new Date().toISOString()
          })
          .eq('id', credit.id);

        if (redeemError) {
          console.error('❌ Error redeeming credit:', redeemError);
          // Credit was created successfully, so return success
          return Response.json({ 
            message: "Credit created successfully",
            creditId: credit.id
          });
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
            .eq('id', credit.id);
          
          return Response.json({ 
            message: "Credit created successfully",
            creditId: credit.id
          });
        }

        console.log('✅ Auto-started new session:', newSession.id);
        
        return Response.json({ 
          message: "Credit created and session auto-started",
          creditId: credit.id,
          sessionId: newSession.id,
          autoStarted: true
        });
      } else {
        // User cannot start session yet (cooldown active)
        console.log('⏰ User cannot start session yet - credit stored for later use');
        
        return Response.json({ 
          message: "Credit created successfully - waiting for cooldown to end",
          creditId: credit.id,
          autoStarted: false
        });
      }
    }

    // Handle other event types if needed
    return Response.json({ message: "Webhook processed" });

  } catch (error) {
    console.error('❌ Error processing PayPal webhook:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
