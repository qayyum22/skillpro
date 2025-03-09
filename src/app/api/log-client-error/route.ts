import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const {
      error,
      componentStack,
      url,
      userId,
      userEmail,
    } = await request.json();
    
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Log the client-side error
    await logger.error(
      `Client Error: ${error.message}`,
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      {
        componentStack,
        url,
        userAgent,
      },
      userId,
      userEmail,
      url,
      error.stack
    );
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error logging client error:', err);
    
    // Try to log this error too
    try {
      await logger.error(
        'Failed to log client error',
        err as Error,
        { path: '/api/log-client-error' }
      );
    } catch (innerErr) {
      // Last resort if even our error logging fails
      console.error('Critical failure in error logging system:', innerErr);
    }
    
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
} 