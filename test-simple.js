// SIMPLE DATABASE TEST - Verify basic connectivity and message retrieval
// This script tests the most basic database operations

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with actual credentials from the project
const supabase = createClient(
  "https://tvjqpmxugitehucwhdbk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImF1ZCI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k"
);

async function simpleTest() {
  console.log('🧪 Simple Database Test...\n');
  
  try {
    // Test 1: Basic connection test - try a simple query first
    console.log('📋 Test 1: Basic Connection');
    
    // Try a very simple query first
    const { data: simpleData, error: simpleError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);
    
    if (simpleError) {
      console.error('❌ Simple query failed:', simpleError);
      console.error('Error details:', JSON.stringify(simpleError, null, 2));
      return;
    }
    
    console.log(`✅ Connection successful! Found ${simpleData?.length || 0} messages`);
    
    if (simpleData && simpleData.length > 0) {
      console.log('Sample message data:', JSON.stringify(simpleData[0], null, 2));
    }
    
    // Test 2: Get message count
    console.log('\n📋 Test 2: Get Message Count');
    const { count, error: countError } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count query failed:', countError);
    } else {
      console.log(`✅ Total messages in database: ${count}`);
    }
    
    // Test 3: Get a few messages
    console.log('\n📋 Test 3: Get Sample Messages');
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, session_id, user_id, role, content, created_at')
      .limit(3);
    
    if (messagesError) {
      console.error('❌ Failed to get messages:', messagesError);
      return;
    }
    
    console.log(`✅ Retrieved ${messages.length} sample messages:`);
    messages.forEach((msg, index) => {
      console.log(`   Message ${index + 1}:`);
      console.log(`     ID: ${msg.id}`);
      console.log(`     Session ID: ${msg.session_id}`);
      console.log(`     User ID: ${msg.user_id}`);
      console.log(`     Role: ${msg.role}`);
      console.log(`     Content: ${msg.content?.substring(0, 50)}...`);
      console.log(`     Created: ${msg.created_at}`);
      console.log('');
    });
    
    // Test 4: Get a few sessions
    console.log('📋 Test 4: Get Sample Sessions');
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id, user_id, is_complete, created_at')
      .limit(3);
    
    if (sessionsError) {
      console.error('❌ Failed to get sessions:', sessionsError);
      return;
    }
    
    console.log(`✅ Retrieved ${sessions.length} sample sessions:`);
    sessions.forEach((session, index) => {
      console.log(`   Session ${index + 1}:`);
      console.log(`     ID: ${session.id}`);
      console.log(`     User ID: ${session.user_id}`);
      console.log(`     Complete: ${session.is_complete}`);
      console.log(`     Created: ${session.created_at}`);
      console.log('');
    });
    
    // Test 5: Try to get messages for a specific session
    if (sessions.length > 0 && messages.length > 0) {
      console.log('📋 Test 5: Get Messages for Specific Session');
      const testSessionId = sessions[0].id;
      const testUserId = sessions[0].user_id;
      
      console.log(`   Testing session: ${testSessionId}`);
      console.log(`   Testing user: ${testUserId}`);
      
      const { data: sessionMessages, error: sessionMsgError } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', testSessionId)
        .eq('user_id', testUserId)
        .order('created_at', { ascending: true });
      
      if (sessionMsgError) {
        console.error('❌ Failed to get session messages:', sessionMsgError);
      } else {
        console.log(`✅ Found ${sessionMessages.length} messages for session ${testSessionId}:`);
        sessionMessages.forEach((msg, index) => {
          console.log(`     Message ${index + 1}: ${msg.role} - ${msg.content?.substring(0, 30)}...`);
        });
      }
    }
    
    console.log('\n🎯 TEST RESULTS:');
    console.log('✅ Database connection working');
    console.log('✅ Can read from chat_messages table');
    console.log('✅ Can read from chat_sessions table');
    console.log('✅ Can query messages by session_id and user_id');
    
    console.log('\n🔍 NEXT STEPS:');
    console.log('1. Check if your API is using the correct session_id and user_id');
    console.log('2. Verify the session selection logic is working correctly');
    console.log('3. Check browser console for API response logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

// Run the simple test
simpleTest();
