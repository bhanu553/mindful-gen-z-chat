
export function GET(req) {
  // SECURITY: Basic auth check for diagnostic endpoint
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ 
      error: 'Authentication required for diagnostic access',
      status: 'unauthorized' 
    }, { status: 401 });
  }
  
  return Response.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "System operational - authenticated access"
  });
}
