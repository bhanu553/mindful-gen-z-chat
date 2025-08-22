import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * UNIFIED SESSION CREATION ENDPOINT
 * 
 * This endpoint implements the unified EchoMind model where every user follows the same rules:
 * - 10-minute cooldown after each completed session
 * - Payment required for each new session (or unused paid credit)
 * - No more free vs premium branching
 * 
 * Business Rules:
 * - ALL users: 10-minute cooldown
 * - BOTH conditions must be satisfied: cooldown elapsed AND paid credit available
 * - Credit consumption is atomic and idempotent
 */

export async function POST(req) {
  try {
    console.log('🚀 Unified session creation request received');
    
    // Get request data
    const { userId, mode = 'Reflect', title = 'Therapy Session' } = await req.json();
    
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`👤 Creating unified session for user: ${userId}, mode: ${mode}`);
    
    // Step 1: Validate user can start new session using unified logic
    const sessionValidation = await validateUnifiedSessionCreation(userId);
    
    if (!sessionValidation.canStart) {
      return Response.json({
        error: 'Cannot start new session',
        reason: sessionValidation.reason,
        cooldownRemaining: sessionValidation.cooldownRemaining,
        nextAvailable: sessionValidation.nextAvailable,
        hasCredit: sessionValidation.hasCredit
      }, { status: 403 });
    }
    
    console.log('✅ Unified session creation validated');
    
    // Step 2: Create session atomically with credit redemption
    const sessionResult = await createUnifiedSessionAtomically(userId, mode, title);
    
    if (!sessionResult.success) {
      return Response.json({
        error: 'Failed to create session',
        details: sessionResult.error
      }, { status: 500 });
    }
    
    console.log('✅ Unified session created successfully:', sessionResult.session.id);
    
    // Step 3: Return session data with unified cooldown information
    return Response.json({
      success: true,
      session: sessionResult.session,
      message: 'Session created successfully',
      cooldownInfo: {
        cooldownDuration: '10 minutes',
        nextSessionAvailable: sessionResult.nextSessionAvailable
      }
    });
    
  } catch (error) {
    console.error('❌ Unified session creation error:', error);
    return Response.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Validate if user can start a new session using unified logic
 */
async function validateUnifiedSessionCreation(userId) {
  try {
    console.log(`🔍 Validating unified session creation for user: ${userId}`);
    
    // Use the database function for unified validation
    const { data: validationResult, error: validationError } = await supabase
      .rpc('can_start_unified_session', { user_uuid: userId });
    
    if (validationError) {
      console.error('❌ Database validation error:', validationError);
      return {
        canStart: false,
        reason: 'Database validation failed',
        cooldownRemaining: null,
        nextAvailable: null,
        hasCredit: false
      };
    }
    
    if (!validationResult || validationResult.length === 0) {
      return {
        canStart: false,
        reason: 'Validation result not found',
        cooldownRemaining: null,
        nextAvailable: null,
        hasCredit: false
      };
    }
    
    const result = validationResult[0];
    console.log(`🔍 Unified validation result:`, result);
    
    return {
      canStart: result.can_start,
      reason: result.reason,
      cooldownRemaining: result.cooldown_remaining,
      nextAvailable: result.next_available,
      hasCredit: result.has_credit
    };
    
  } catch (error) {
    console.error('❌ Error in unified session validation:', error);
    return {
      canStart: false,
      reason: 'Validation error: ' + error.message,
      cooldownRemaining: null,
      nextAvailable: null,
      hasCredit: false
    };
  }
}

/**
 * Create session atomically with credit redemption
 */
async function createUnifiedSessionAtomically(userId, mode, title) {
  try {
    console.log(`🔧 Creating unified session atomically for user: ${userId}`);
    
    // Start a transaction by using the database function
    const { data: creditRedemption, error: creditError } = await supabase
      .rpc('redeem_session_credit', { user_uuid: userId });
    
    if (creditError || !creditRedemption || creditRedemption.length === 0) {
      console.error('❌ Credit redemption failed:', creditError);
      return { success: false, error: 'Failed to redeem session credit' };
    }
    
    const redemption = creditRedemption[0];
    if (!redemption.success) {
      console.error('❌ Credit redemption unsuccessful:', redemption.error_message);
      return { success: false, error: redemption.error_message };
    }
    
    console.log(`✅ Credit redeemed successfully: ${redemption.credit_id}`);
    
    // Create the new session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        mode: mode,
        title: title,
        is_complete: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (sessionError || !session) {
      console.error('❌ Session creation failed:', sessionError);
      return { success: false, error: 'Failed to create session' };
    }
    
    console.log(`✅ Session created: ${session.id}`);
    
    // Calculate next session availability (10 minutes from now)
    const nextSessionAvailable = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    return {
      success: true,
      session: session,
      creditId: redemption.credit_id,
      nextSessionAvailable: nextSessionAvailable
    };
    
  } catch (error) {
    console.error('❌ Error in unified session creation:', error);
    return { success: false, error: error.message };
  }
}
