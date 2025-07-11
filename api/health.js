import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tvjqpmxugitehucwhdbk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    checks: {
      openai: { status: 'checking', details: null },
      supabase: { status: 'checking', details: null },
      environment: { status: 'checking', details: null }
    }
  };

  // Check environment variables
  try {
    health.checks.environment = {
      status: 'healthy',
      details: {
        openaiKeyPresent: !!OPENAI_API_KEY,
        supabaseUrlPresent: !!supabaseUrl,
        supabaseKeyPresent: !!supabaseKey,
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    };
  } catch (error) {
    health.checks.environment = {
      status: 'unhealthy',
      details: { error: error.message }
    };
  }

  // Check Supabase connection
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) throw error;
    
    health.checks.supabase = {
      status: 'healthy',
      details: { connected: true, url: supabaseUrl }
    };
  } catch (error) {
    health.checks.supabase = {
      status: 'unhealthy',
      details: { error: error.message, url: supabaseUrl }
    };
  }

  // Check OpenAI API
  if (OPENAI_API_KEY) {
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (openAIResponse.ok) {
        const models = await openAIResponse.json();
        const hasGPT4o = models.data?.some(model => model.id.includes('gpt-4o'));
        
        health.checks.openai = {
          status: 'healthy',
          details: { 
            connected: true, 
            keyValid: true,
            gpt4oAvailable: hasGPT4o
          }
        };
      } else {
        throw new Error(`OpenAI API returned ${openAIResponse.status}`);
      }
    } catch (error) {
      health.checks.openai = {
        status: 'unhealthy',
        details: { 
          connected: false, 
          error: error.message,
          keyPresent: !!OPENAI_API_KEY
        }
      };
    }
  } else {
    health.checks.openai = {
      status: 'unhealthy',
      details: { 
        connected: false, 
        error: 'OpenAI API key not configured',
        keyPresent: false
      }
    };
  }

  // Determine overall status
  const allHealthy = Object.values(health.checks).every(check => check.status === 'healthy');
  health.status = allHealthy ? 'healthy' : 'unhealthy';

  const statusCode = allHealthy ? 200 : 503;
  return res.status(statusCode).json(health);
}