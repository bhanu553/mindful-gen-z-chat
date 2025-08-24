import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { orderID, userId } = await req.json();
    
    // 🔒 UNIFIED USER VALIDATION - CRITICAL SECURITY CHECK
    if (!userId) {
      console.error('❌ No userId provided to capture PayPal order');
      return Response.json({ 
        error: "User ID required" 
      }, { status: 400 });
    }
    
    if (!orderID) {
      console.error('❌ No orderID provided to capture PayPal order');
      return Response.json({ 
        error: "Order ID required" 
      }, { status: 400 });
    }
    
    // Validate userId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ Invalid userId format in capture PayPal order:', userId);
      return Response.json({ 
        error: "Invalid user ID format" 
      }, { status: 400 });
    }
    
    console.log(`🔒 Capture PayPal order: Unified user validation passed for user: ${userId}, order: ${orderID}`);
    
    // Verify user exists and is authenticated
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();
    
    if (userError || !userProfile) {
      console.error('❌ User not found or not authenticated in capture PayPal order:', userId);
      return Response.json({ 
        error: "User not authenticated" 
      }, { status: 401 });
    }
    
    console.log(`✅ Capture PayPal order: User authenticated: ${userProfile.email}`);
    
    // Capture PayPal payment using PayPal SDK
    try {
      const paypalClientId = process.env.PAYPAL_CLIENT_ID;
      const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
      
      if (!paypalClientId || !paypalClientSecret) {
        console.error('❌ PayPal credentials not configured');
        return Response.json({ 
          error: "Payment service not configured" 
        }, { status: 500 });
      }
      
      // Get PayPal access token
      const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      
      if (!tokenResponse.ok) {
        console.error('❌ Failed to get PayPal access token');
        return Response.json({ 
          error: "Payment service error" 
        }, { status: 500 });
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      // Capture the payment
      const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!captureResponse.ok) {
        console.error('❌ Failed to capture PayPal payment');
        return Response.json({ 
          error: "Failed to capture payment" 
        }, { status: 500 });
      }
      
      const captureData = await captureResponse.json();
      console.log('✅ PayPal payment captured successfully:', captureData.id);
      
      // Extract payment details
      const paymentId = captureData.purchase_units[0].payments.captures[0].id;
      const amount = parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value);
      const currency = captureData.purchase_units[0].payments.captures[0].amount.currency_code;
      
      // Validate payment amount (should be $5.99)
      if (amount !== 5.99 || currency !== 'USD') {
        console.error('❌ Invalid payment amount or currency:', { amount, currency });
        return Response.json({ 
          error: "Invalid payment amount" 
        }, { status: 400 });
      }
      
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
        return Response.json({ error: "Failed to create session credit" }, { status: 500 });
      }
      
      console.log('✅ Session credit created successfully:', newCredit.id);
      
      return Response.json({
        message: "Payment captured and credit created successfully",
        creditId: newCredit.id,
        paymentId: paymentId,
        amount: amount,
        currency: currency
      });
      
    } catch (paypalError) {
      console.error('❌ PayPal API error:', paypalError);
      return Response.json({ 
        error: "Payment service error" 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error in capture PayPal order:', error);
    return Response.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
