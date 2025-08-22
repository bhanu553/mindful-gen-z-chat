import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * ENHANCED SESSION CREATION ENDPOINT
 * 
 * This endpoint creates new therapy sessions with comprehensive validation:
 * - Cooldown period enforcement
 * - Payment requirement validation
 * - Credit deduction for paid sessions
 * - Atomic session creation
 * 
 * Business Rules:
 * - Free users: 1 free session, 30-day cooldown
 * - Premium users: Paid sessions, 10-minute cooldown
 * - Both payment AND cooldown expiry must be satisfied
 */

export async function POST(req) {
  try {
    console.log('🚀 Enhanced session creation request received');
    
    // Get request data
    const { userId, mode = 'Reflect', title = 'Therapy Session' } = await req.json();
    
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`👤 Creating session for user: ${userId}, mode: ${mode}`);
    
    // Step 1: Validate user can start new session
    const sessionValidation = await validateSessionCreation(userId);
    
    if (!sessionValidation.canStart) {
      return Response.json({
        error: 'Cannot start new session',
        reason: sessionValidation.reason,
        cooldownRemaining: sessionValidation.cooldownRemaining,
        nextAvailable: sessionValidation.nextAvailable,
        details: sessionValidation
      }, { status: 403 });
    }
    
    console.log('✅ Session creation validated');
    
    // Step 2: Create session atomically with credit deduction
    const sessionResult = await createSessionAtomically(userId, mode, title);
    
    if (!sessionResult.success) {
      return Response.json({
        error: 'Failed to create session',
        details: sessionResult.error
      }, { status: 500 });
    }
    
    console.log('✅ Session created successfully:', sessionResult.session.id);
    
    // Step 3: Return session data with cooldown information
    return Response.json({
      success: true,
      session: sessionResult.session,
      message: 'Session created successfully',
      cooldownInfo: {
        isPremium: sessionResult.isPremium,
        cooldownDuration: sessionResult.cooldownDuration,
        nextSessionAvailable: sessionResult.nextSessionAvailable
      }
    });
    
  } catch (error) {
    console.error('❌ Session creation error:', error);
    return Response.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Validate if user can start a new session
 */
async function validateSessionCreation(userId) {
  try {
    console.log(`🔍 Validating session creation for user: ${userId}`);
    
    // Get user profile and active credits
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, is_premium, payment_status')
      .eq('id', userId)
      .single();
    
    if (profileError || !userProfile) {
      return {
        canStart: false,
        reason: 'User profile not found',
        cooldownRemaining: null,
        nextAvailable: null
      };
    }
    
    console.log(`👤 User profile: Premium: ${userProfile.is_premium}, Payment Status: ${userProfile.payment_status}`);
    
    // Check for active incomplete session
    const { data: activeSession } = await supabase
      .from('chat_sessions')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('is_complete', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (activeSession) {
      return {
        canStart: false,
        reason: 'Active session in progress',
        cooldownRemaining: null,
        nextAvailable: null,
        activeSessionId: activeSession.id
      };
    }
    
    // Check cooldown period
    const { data: lastCompletedSession } = await supabase
      .from('chat_sessions')
      .select('id, ended_at, cooldown_until, is_complete')
      .eq('user_id', userId)
      .eq('is_complete', true)
      .order('ended_at', { ascending: false })
      .limit(1)
      .single();
    
    if (lastCompletedSession && lastCompletedSession.cooldown_until) {
      const now = new Date();
      const cooldownUntil = new Date(lastCompletedSession.cooldown_until);
      
      if (now < cooldownUntil) {
        const cooldownRemaining = cooldownUntil - now;
        return {
          canStart: false,
          reason: 'Cooldown period active',
          cooldownRemaining: Math.ceil(cooldownRemaining / (1000 * 60)), // minutes
          nextAvailable: cooldownUntil.toISOString(),
          lastSessionEnded: lastCompletedSession.ended_at
        };
      }
    }
    
    // Check payment requirements
    if (userProfile.payment_status === 'paid') {
      // Premium user - check if they have paid credits
      const { data: paidCredits } = await supabase
        .from('user_credits')
        .select('id, sessions_remaining, is_active')
        .eq('user_id', userId)
        .eq('credit_type', 'paid')
        .eq('is_active', true)
        .gt('sessions_remaining', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!paidCredits) {
        return {
          canStart: false,
          reason: 'No paid credits available',
          cooldownRemaining: null,
          nextAvailable: null,
          paymentStatus: userProfile.payment_status
        };
      }
      
      console.log(`💳 Paid credits available: ${paidCredits.sessions_remaining} sessions`);
    } else {
      // Free user - check if they have free credits
      const { data: freeCredits } = await supabase
        .from('user_credits')
        .select('id, sessions_remaining, is_active')
        .eq('user_id', userId)
        .eq('credit_type', 'free')
        .eq('is_active', true)
        .gt('sessions_remaining', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!freeCredits) {
        return {
          canStart: false,
          reason: 'No free credits available',
          cooldownRemaining: null,
          nextAvailable: null,
          creditType: 'free'
        };
      }
      
      console.log(`🆓 Free credits available: ${freeCredits.sessions_remaining} sessions`);
    }
    
    // All validations passed
    return {
      canStart: true,
      reason: 'Ready to start new session',
      cooldownRemaining: null,
      nextAvailable: null,
      userProfile: userProfile
    };
    
  } catch (error) {
    console.error('❌ Session validation error:', error);
    return {
      canStart: false,
      reason: 'Validation error occurred',
      cooldownRemaining: null,
      nextAvailable: null,
      error: error.message
    };
  }
}

/**
 * Create session atomically with credit deduction
 */
async function createSessionAtomically(userId, mode, title) {
  try {
    console.log(`🏗️ Creating session atomically for user: ${userId}`);
    
    // Get user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, user_id, is_premium, payment_status')
      .eq('id', userId)
      .single();
    
    if (!userProfile) {
      return { success: false, error: 'User profile not found' };
    }
    
    const isPremium = userProfile.payment_status === 'paid';
    const cooldownDuration = isPremium ? 10 : 1440; // 10 minutes vs 30 days (in minutes)
    
    // Calculate cooldown timing
    const now = new Date();
    const cooldownUntil = new Date(now.getTime() + cooldownDuration * 60 * 1000);
    const nextSessionAvailable = cooldownUntil.toISOString();
    
    console.log(`⏰ Cooldown duration: ${cooldownDuration} minutes, until: ${cooldownUntil.toISOString()}`);
    
    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        current_mode: mode,
        title: title,
        is_complete: false,
        message_count: 0,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .select()
      .single();
    
    if (sessionError) {
      console.error('❌ Failed to create session:', sessionError);
      return { success: false, error: 'Failed to create session' };
    }
    
    console.log('✅ Session created:', session.id);
    
    // Deduct credit (free or paid)
    const creditType = isPremium ? 'paid' : 'free';
    const { data: credit, error: creditError } = await supabase
      .from('user_credits')
      .select('id, sessions_remaining')
      .eq('user_id', userId)
      .eq('credit_type', creditType)
      .eq('is_active', true)
      .gt('sessions_remaining', 0)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (creditError || !credit) {
      console.error('❌ No credits available for deduction:', creditError);
      // Rollback session creation
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', session.id);
      
      return { success: false, error: 'No credits available for deduction' };
    }
    
    // Update credit usage
    const { error: creditUpdateError } = await supabase
      .from('user_credits')
      .update({
        sessions_remaining: credit.sessions_remaining - 1,
        sessions_used: credit.sessions_used + 1,
        used_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', credit.id);
    
    if (creditUpdateError) {
      console.error('❌ Failed to update credit usage:', creditUpdateError);
      // Rollback session creation
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', session.id);
      
      return { success: false, error: 'Failed to update credit usage' };
    }
    
    console.log(`✅ Credit deducted: ${creditType}, remaining: ${credit.sessions_remaining - 1}`);
    
    // If this was the last credit, deactivate it
    if (credit.sessions_remaining <= 1) {
      await supabase
        .from('user_credits')
        .update({ is_active: false })
        .eq('id', credit.id);
      
      console.log('🔄 Credit deactivated (no sessions remaining)');
    }
    
    return {
      success: true,
      session: session,
      isPremium: isPremium,
      cooldownDuration: cooldownDuration,
      nextSessionAvailable: nextSessionAvailable,
      creditType: creditType,
      creditsRemaining: credit.sessions_remaining - 1
    };
    
  } catch (error) {
    console.error('❌ Atomic session creation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * GET endpoint for testing session creation validation
 */
export async function GET(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return Response.json({ error: 'User ID parameter required' }, { status: 400 });
  }
  
  try {
    const validation = await validateSessionCreation(userId);
    
    return Response.json({
      message: 'Session creation validation check',
      userId: userId,
      validation: validation,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return Response.json({
      error: 'Validation check failed',
      details: error.message
    }, { status: 500 });
  }
}
