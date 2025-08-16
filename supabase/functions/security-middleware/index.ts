import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface SecurityMiddlewareRequest {
  userId: string
  action: string
  data?: any
  userAgent?: string
  ip?: string
}

interface RateLimitEntry {
  count: number
  lastReset: number
}

// In-memory rate limiting (for demonstration - in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth token from request
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify user with auth token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const requestData: SecurityMiddlewareRequest = await req.json()
    const { userId, action, data } = requestData

    // Validate user ID matches authenticated user
    if (userId !== user.id) {
      console.error('🚨 Security violation: userId mismatch', { requested: userId, authenticated: user.id })
      return new Response(JSON.stringify({ error: 'User ID mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Rate limiting - 100 requests per hour per user
    const rateKey = `rate_${user.id}`
    const now = Date.now()
    const hourInMs = 60 * 60 * 1000
    
    let rateEntry = rateLimitStore.get(rateKey)
    if (!rateEntry || now - rateEntry.lastReset > hourInMs) {
      rateEntry = { count: 1, lastReset: now }
    } else {
      rateEntry.count++
    }
    
    rateLimitStore.set(rateKey, rateEntry)
    
    if (rateEntry.count > 100) {
      console.error('🚨 Rate limit exceeded for user:', user.id)
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Input sanitization and validation
    const sanitizedData = sanitizeInput(data)
    
    // Content filtering - detect harmful patterns
    if (containsHarmfulContent(sanitizedData)) {
      console.error('🚨 Harmful content detected from user:', user.id)
      return new Response(JSON.stringify({ 
        error: 'Content violates terms of service' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log security event for monitoring
    console.log('🛡️ Security check passed:', {
      userId: user.id,
      action,
      timestamp: new Date().toISOString(),
      rateCount: rateEntry.count
    })

    return new Response(JSON.stringify({
      success: true,
      sanitizedData,
      rateLimitRemaining: Math.max(0, 100 - rateEntry.count)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Security middleware error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    // Remove potential script tags and dangerous patterns
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item))
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      // Sanitize keys and values
      const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '')
      if (cleanKey && cleanKey.length <= 100) {
        sanitized[cleanKey] = sanitizeInput(value)
      }
    }
    return sanitized
  }
  
  return data
}

function containsHarmfulContent(data: any): boolean {
  const harmfulPatterns = [
    /\b(suicide|kill\s+myself|end\s+it\s+all)\b/i,
    /\b(bomb|attack|weapon)\b/i,
    /<script/i,
    /javascript:/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i
  ]
  
  const textToCheck = JSON.stringify(data).toLowerCase()
  
  return harmfulPatterns.some(pattern => pattern.test(textToCheck))
}