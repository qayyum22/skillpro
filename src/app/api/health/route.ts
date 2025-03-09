import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'missing',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'configured' : 'missing',
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'configured' : 'missing'
    }
  });
} 