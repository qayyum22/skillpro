import { NextResponse } from 'next/server';
import { auth, firestore } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    // Get the ID token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Get user's role from Firestore using admin SDK
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data with role
    return NextResponse.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}