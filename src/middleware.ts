import { NextRequest, NextResponse } from 'next/server';
import logger, { LogLevel } from './lib/logger';

// Define patterns for known security exploits
const SUSPICIOUS_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
  /((\%3C)|<)[^\n]+((\%3E)|>)/i, // XSS
  /etc\/passwd/i, // Path traversal
  /(\%24\{)|(\$\{)/i, // Command injection
  /eval\(/i, // JavaScript evaluation
];

// Define rate limiting thresholds
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute per IP
}; 

// In-memory store for rate limiting (consider using Redis for production)
const ipRequests: Record<string, { count: number, timestamp: number }> = {};

export async function middleware(request: NextRequest) {
  // Get IP address and pathname
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const path = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Skip logging for static assets and healthchecks
  if (
    path.startsWith('/_next/') || 
    path.includes('/static/') || 
    path === '/api/health'
  ) {
    return NextResponse.next();
  }
  
  // Check for API requests
  const isApiRequest = path.startsWith('/api/');
  
  // Basic rate limiting
  if (isApiRequest) {
    // Check if this IP is already being tracked
    const now = Date.now();
    if (!ipRequests[ip]) {
      ipRequests[ip] = { count: 1, timestamp: now };
    } else {
      // Check if we're in the same time window
      if (now - ipRequests[ip].timestamp > RATE_LIMIT.windowMs) {
        // Reset for new window
        ipRequests[ip] = { count: 1, timestamp: now };
      } else {
        // Increment request count
        ipRequests[ip].count++;
        
        // Check if rate limit is exceeded
        if (ipRequests[ip].count > RATE_LIMIT.maxRequests) {
          // Log rate limit exceeded
          await logger.security(
            'Rate limit exceeded', 
            { 
              requestCount: ipRequests[ip].count,
              windowMs: RATE_LIMIT.windowMs
            },
            undefined,
            undefined,
            path,
            ip,
            userAgent
          );
          
          // Return rate limit exceeded response
          return new NextResponse(
            JSON.stringify({ error: 'Too many requests' }),
            { 
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': '60'
              }
            }
          );
        }
      }
    }
  }
  
  // Check for suspicious patterns in request
  if (isApiRequest) {
    const url = request.nextUrl.toString();
    const body = request.method !== 'GET' ? await tryReadBody(request) : '';
    const hasMatch = SUSPICIOUS_PATTERNS.some(pattern => 
      pattern.test(url) || (body && pattern.test(body))
    );
    
    if (hasMatch) {
      await logger.security(
        'Suspicious request pattern detected',
        {
          method: request.method,
          url: request.nextUrl.toString(),
          headers: Object.fromEntries(request.headers),
          body: body ? '(binary data)' : undefined
        },
        undefined,
        undefined,
        path,
        ip,
        userAgent
      );
      
      // Optionally block the request
      // return new NextResponse(
      //   JSON.stringify({ error: 'Forbidden' }),
      //   { status: 403, headers: { 'Content-Type': 'application/json' } }
      // );
    }
  }
  
  // Log the request (for API calls only to avoid excessive logging)
  if (isApiRequest) {
    await logger.info(
      `API Request: ${request.method} ${path}`,
      { 
        method: request.method,
        query: Object.fromEntries(request.nextUrl.searchParams)
      },
      undefined,
      undefined,
      path,
      ip,
      userAgent
    );
  }
  
  return NextResponse.next();
}

// Try to read request body without consuming it
async function tryReadBody(request: NextRequest): Promise<string> {
  try {
    // Clone request to avoid consuming the original
    const clonedRequest = request.clone();
    
    // Try to read as text
    const text = await clonedRequest.text();
    return text;
  } catch (e) {
    return '';
  }
}

// Configure which paths the middleware applies to
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}; 