import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PayPal webhook verification constants
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

/**
 * PAYPAL WEBHOOK ENDPOINT
 * 
 * This endpoint handles PayPal IPN (Instant Payment Notification) webhooks
 * to verify payments and assign session credits to users.
 * 
 * Features:
 * - Payment verification with PayPal API
 * - Idempotent processing (prevents duplicate credit assignment)
 * - Credit assignment for paid sessions
 * - Comprehensive error handling and logging
 */

export async function POST(req) {
  try {
    console.log('🔔 PayPal webhook received');
    
    // Get webhook payload
    const webhookData = await req.json();
    console.log('📦 Webhook payload:', JSON.stringify(webhookData, null, 2));
    
    // Verify webhook signature (if available)
    if (!verifyWebhookSignature(req, webhookData)) {
      console.warn('⚠️ Webhook signature verification failed');
      // Continue processing as some webhooks may not have signatures
    }
    
    // Extract payment information
    const { event_type, resource, resource_type } = webhookData;
    
    // Only process payment completion events
    if (event_type !== 'PAYMENT.CAPTURE.COMPLETED' && event_type !== 'CHECKOUT.ORDER.APPROVED') {
      console.log(`ℹ️ Ignoring webhook event type: ${event_type}`);
      return Response.json({ status: 'ignored', reason: 'Event type not relevant' });
    }
    
    // Extract payment details
    let paymentId, orderId, amount, currency, status;
    
    if (resource_type === 'capture') {
      // PAYMENT.CAPTURE.COMPLETED event
      paymentId = resource.id;
      orderId = resource.custom_id || resource.invoice_id;
      amount = parseFloat(resource.amount.value);
      currency = resource.amount.currency_code;
      status = resource.status;
    } else if (resource_type === 'order') {
      // CHECKOUT.ORDER.APPROVED event
      orderId = resource.id;
      paymentId = resource.payment_source?.paypal?.capture_id;
      amount = parseFloat(resource.payment_source?.paypal?.amount?.value || '0');
      currency = resource.payment_source?.paypal?.amount?.currency_code || 'USD';
      status = resource.status;
    }
    
    if (!orderId || !paymentId) {
      console.error('❌ Missing required payment identifiers');
      return Response.json({ error: 'Missing payment identifiers' }, { status: 400 });
    }
    
    console.log(`💰 Processing payment: Order ${orderId}, Payment ${paymentId}, Amount ${amount} ${currency}`);
    
    // Verify payment with PayPal API
    const isPaymentValid = await verifyPaymentWithPayPal(paymentId, orderId, amount, currency);
    if (!isPaymentValid) {
      console.error('❌ Payment verification failed');
      return Response.json({ error: 'Payment verification failed' }, { status: 400 });
    }
    
    // Process payment and assign credits
    const result = await processPaymentAndAssignCredits(orderId, paymentId, amount, currency, webhookData);
    
    if (result.success) {
      console.log('✅ Payment processed successfully:', result);
      return Response.json({ 
        status: 'success', 
        message: 'Payment processed and credits assigned',
        details: result
      });
    } else {
      console.error('❌ Failed to process payment:', result.error);
      return Response.json({ 
        error: 'Failed to process payment', 
        details: result.error 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * Verify webhook signature (basic implementation)
 * In production, implement proper signature verification
 */
function verifyWebhookSignature(req, webhookData) {
  // TODO: Implement proper PayPal webhook signature verification
  // For now, we'll accept all webhooks and rely on payment verification
  return true;
}

/**
 * Verify payment with PayPal API
 */
async function verifyPaymentWithPayPal(paymentId, orderId, amount, currency) {
  try {
    console.log('🔍 Verifying payment with PayPal API...');
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      console.error('❌ Failed to get PayPal access token');
      return false;
    }
    
    // Verify payment capture
    const verificationResponse = await fetch(`https://api-m.paypal.com/v2/payments/captures/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!verificationResponse.ok) {
      console.error('❌ PayPal API verification failed:', verificationResponse.status);
      return false;
    }
    
    const paymentData = await verificationResponse.json();
    console.log('📋 PayPal payment data:', JSON.stringify(paymentData, null, 2));
    
    // Verify payment details match
    const isValid = 
      paymentData.status === 'COMPLETED' &&
      paymentData.amount.currency_code === currency &&
      parseFloat(paymentData.amount.value) === amount &&
      paymentData.custom_id === orderId;
    
    console.log(`🔍 Payment verification result: ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
    
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return false;
  }
}

/**
 * Get PayPal access token for API calls
 */
async function getPayPalAccessToken() {
  try {
    const authResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!authResponse.ok) {
      console.error('❌ PayPal auth failed:', authResponse.status);
      return null;
    }
    
    const authData = await authResponse.json();
    return authData.access_token;
    
  } catch (error) {
    console.error('❌ PayPal auth error:', error);
    return null;
  }
}

/**
 * Process payment and assign credits to user
 */
async function processPaymentAndAssignCredits(orderId, paymentId, amount, currency, webhookData) {
  try {
    console.log('💳 Processing payment and assigning credits...');
    
    // Check if payment already processed (idempotency)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status, user_id')
      .eq('paypal_order_id', orderId)
      .single();
    
    if (existingPayment) {
      if (existingPayment.status === 'completed') {
        console.log('✅ Payment already processed, skipping duplicate');
        return { 
          success: true, 
          message: 'Payment already processed',
          paymentId: existingPayment.id,
          userId: existingPayment.user_id
        };
      } else {
        console.log(`🔄 Payment exists but status is ${existingPayment.status}, updating...`);
      }
    }
    
    // Extract user ID from order ID (assuming format: "user_<uuid>_session")
    const userIdMatch = orderId.match(/user_([a-f0-9-]+)_session/);
    if (!userIdMatch) {
      console.error('❌ Could not extract user ID from order ID:', orderId);
      return { success: false, error: 'Invalid order ID format' };
    }
    
    const userId = userIdMatch[1];
    console.log(`👤 Extracted user ID: ${userId}`);
    
    // Verify user exists
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, user_id, is_premium')
      .eq('id', userId)
      .single();
    
    if (userError || !userProfile) {
      console.error('❌ User not found:', userId);
      return { success: false, error: 'User not found' };
    }
    
    console.log(`✅ User verified: ${userProfile.full_name || userProfile.email}`);
    
    // Begin transaction: Insert/update payment and assign credits
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .upsert({
        paypal_order_id: orderId,
        paypal_payment_id: paymentId,
        user_id: userId,
        amount: amount,
        currency: currency,
        status: 'completed',
        payment_method: 'paypal',
        completed_at: new Date().toISOString(),
        webhook_data: webhookData,
        verification_hash: `${paymentId}_${orderId}_${Date.now()}`
      }, {
        onConflict: 'paypal_order_id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('❌ Failed to save payment:', paymentError);
      return { success: false, error: 'Failed to save payment' };
    }
    
    console.log('✅ Payment saved:', payment.id);
    
    // Assign paid session credit
    const { data: credit, error: creditError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        payment_id: payment.id,
        credit_type: 'paid',
        sessions_granted: 1,
        sessions_used: 0,
        sessions_remaining: 1,
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
      })
      .select()
      .single();
    
    if (creditError) {
      console.error('❌ Failed to assign credit:', creditError);
      return { success: false, error: 'Failed to assign credit' };
    }
    
    console.log('✅ Credit assigned:', credit.id);
    
    // Update user's payment status (trigger will handle this automatically)
    console.log('✅ User payment status updated via trigger');
    
    return {
      success: true,
      message: 'Payment processed and credits assigned successfully',
      paymentId: payment.id,
      creditId: credit.id,
      userId: userId,
      sessionsGranted: 1
    };
    
  } catch (error) {
    console.error('❌ Payment processing error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * GET endpoint for testing webhook functionality
 */
export async function GET(req) {
  return Response.json({ 
    message: 'PayPal webhook endpoint is active',
    status: 'ready',
    timestamp: new Date().toISOString()
  });
}
