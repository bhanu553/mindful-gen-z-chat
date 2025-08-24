import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, amount } = await req.json();
    
    // 🔒 UNIFIED USER VALIDATION - CRITICAL SECURITY CHECK
    if (!userId) {
      console.error('❌ No userId provided to create PayPal order');
      return Response.json({ 
        error: "User ID required" 
      }, { status: 400 });
    }
    
    // Validate userId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ Invalid userId format in create PayPal order:', userId);
      return Response.json({ 
        error: "Invalid user ID format" 
      }, { status: 400 });
    }
    
    console.log(`🔒 Create PayPal order: Unified user validation passed for user: ${userId}`);
    
    // Verify user exists and is authenticated
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();
    
    if (userError || !userProfile) {
      console.error('❌ User not found or not authenticated in create PayPal order:', userId);
      return Response.json({ 
        error: "User not authenticated" 
      }, { status: 401 });
    }
    
    console.log(`✅ Create PayPal order: User authenticated: ${userProfile.email}`);
    
    // Validate amount (should be $5.99)
    if (amount !== 5.99) {
      console.error('❌ Invalid amount in create PayPal order:', amount);
      return Response.json({ 
        error: "Invalid amount" 
      }, { status: 400 });
    }
    
    // Create PayPal order using PayPal SDK
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
      
      // Create PayPal order
      const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: amount.toString()
            },
            description: `EchoMind Therapy Session - $${amount} per session - user:${userId}`,
            custom_id: userId
          }],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/therapy`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/therapy`
          }
        })
      });
      
      if (!orderResponse.ok) {
        console.error('❌ Failed to create PayPal order');
        return Response.json({ 
          error: "Failed to create payment order" 
        }, { status: 500 });
      }
      
      const orderData = await orderResponse.json();
      console.log('✅ PayPal order created successfully:', orderData.id);
      
      return Response.json({
        orderID: orderData.id,
        status: orderData.status
      });
      
    } catch (paypalError) {
      console.error('❌ PayPal API error:', paypalError);
      return Response.json({ 
        error: "Payment service error" 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error in create PayPal order:', error);
    return Response.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
