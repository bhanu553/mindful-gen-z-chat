
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tvjqpmxugitehucwhdbk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k';

console.log('🔧 Middleware initialized with:', {
  supabaseUrl,
  supabaseKeyLength: supabaseKey?.length || 0,
  supabaseKeyPrefix: supabaseKey?.substring(0, 20) + '...'
});

const supabase = createClient(supabaseUrl, supabaseKey);

export async function authenticateUser(req) {
  console.log('🔐 authenticateUser called');
  
  const authHeader = req.headers.authorization;
  console.log('🔐 Auth header present:', !!authHeader);
  console.log('🔐 Auth header format:', authHeader?.substring(0, 20) + '...' || 'none');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ Missing or invalid authorization header');
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const token = authHeader.substring(7);
  console.log('🔐 Token extracted, length:', token.length);
  console.log('🔐 Token preview:', token.substring(0, 20) + '...');
  
  try {
    console.log('🔐 Calling supabase.auth.getUser...');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log('🔐 Supabase auth response:', {
      user: user ? { id: user.id, email: user.email } : null,
      error: error ? { message: error.message, status: error.status } : null
    });
    
    if (error) {
      console.error('❌ Supabase auth error:', JSON.stringify(error, null, 2));
      return { error: 'Invalid or expired token', status: 401, details: error };
    }
    
    if (!user) {
      console.error('❌ No user returned from Supabase');
      return { error: 'Invalid or expired token', status: 401 };
    }
    
    console.log('✅ User authenticated successfully:', { id: user.id, email: user.email });
    return { user, supabase };
  } catch (error) {
    console.error('❌ Authentication exception:', error);
    console.error('❌ Exception stack:', error.stack);
    return { error: 'Authentication failed', status: 500, exception: error.message };
  }
}

export function setCorsHeaders(res) {
  console.log('🌐 Setting CORS headers');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
