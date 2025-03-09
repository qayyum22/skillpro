import { NextResponse } from 'next/server';

export async function GET() {
  // Check for Firebase Admin environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    firebase: {
      projectId: projectId ? 'Set' : 'Missing',
      clientEmail: clientEmail ? 'Set' : 'Missing',
      privateKey: privateKey ? 'Set' : 'Missing',
      privateKeyLength: privateKey ? privateKey.length : 0,
      // Check if private key has the correct format
      privateKeyFormat: privateKey && 
        privateKey.includes('-----BEGIN PRIVATE KEY-----') && 
        privateKey.includes('-----END PRIVATE KEY-----') ? 'Valid' : 'Invalid'
    }
  });
} 