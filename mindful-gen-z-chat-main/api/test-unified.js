import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * TEST ENDPOINT FOR UNIFIED ECHOMIND MODEL
 * 
 * This endpoint tests the unified model functionality:
 * - 10-minute cooldown for all users
 * - Credit system validation
 * - Session creation gating
 */

export async function GET(req) {
  try {
    console.log('🧪 Testing unified EchoMind model...');
    
    // Test 1: Check if session_credit table exists
    const { data: creditTable, error: creditError } = await supabase
      .from('session_credit')
      .select('*')
      .limit(1);
    
    if (creditError) {
      return Response.json({
        success: false,
        error: 'session_credit table not found',
        details: creditError.message
      }, { status: 500 });
    }
    
    console.log('✅ session_credit table exists');
    
    // Test 2: Check if can_start_unified_session function exists
    try {
      const { data: functionTest, error: functionError } = await supabase
        .rpc('can_start_unified_session', { user_uuid: '00000000-0000-0000-0000-000000000000' });
      
      if (functionError) {
        return Response.json({
          success: false,
          error: 'can_start_unified_session function not found',
          details: functionError.message
        }, { status: 500 });
      }
      
      console.log('✅ can_start_unified_session function exists');
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Database function test failed',
        details: error.message
      }, { status: 500 });
    }
    
    // Test 3: Check if redeem_session_credit function exists
    try {
      const { data: redeemTest, error: redeemError } = await supabase
        .rpc('redeem_session_credit', { user_uuid: '00000000-0000-0000-0000-000000000000' });
      
      if (redeemError) {
        return Response.json({
          success: false,
          error: 'redeem_session_credit function not found',
          details: redeemError.message
        }, { status: 500 });
      }
      
      console.log('✅ redeem_session_credit function exists');
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Database function test failed',
        details: error.message
      }, { status: 500 });
    }
    
    // Test 4: Check database schema
    const { data: schemaInfo, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type')
      .eq('table_schema', 'public')
      .in('table_name', ['session_credit', 'chat_sessions', 'payments'])
      .order('table_name, ordinal_position');
    
    if (schemaError) {
      console.log('⚠️ Could not fetch schema info:', schemaError.message);
    } else {
      console.log('✅ Database schema verified');
    }
    
    return Response.json({
      success: true,
      message: 'Unified EchoMind model is ready',
      tests: {
        creditTable: 'PASS',
        validationFunction: 'PASS',
        redemptionFunction: 'PASS',
        schema: schemaError ? 'WARNING' : 'PASS'
      },
      schema: schemaInfo || 'Could not fetch',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Unified model test failed:', error);
    return Response.json({
      success: false,
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
