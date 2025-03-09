import { NextResponse } from 'next/server';
import { auth, firestore } from '@/lib/firebase-admin';

// This is a workaround for Next.js build process
// During build, Next.js will try to execute this route
// We need to handle the case when Firebase Admin is not initialized
const isFirebaseAdminInitialized = () => {
  try {
    // Check if auth is available
    if (!auth) return false;
    return true;
  } catch (error) {
    return false;
  }
};

export async function GET(request: Request) {
  // During build time, return a mock response
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'build') {
    console.log('Build-time execution of /api/auth/verify route - returning mock response');
    return NextResponse.json({ buildTime: true });
  }

  // Check if Firebase Admin is initialized
  if (!isFirebaseAdminInitialized()) {
    console.error('Firebase Admin SDK not initialized');
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }

  try {
    // Get the ID token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return NextResponse.json({ error: 'Unauthorized - Missing or invalid token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the ID token
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const decodedToken = await auth.verifyIdToken(idToken);
      
      try {
        // Get user's role from Firestore using admin SDK
        if (!firestore) {
          throw new Error('Firestore not initialized');
        }
        
        const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        if (!userData) {
          console.error(`User document not found for uid: ${decodedToken.uid}`);
          return NextResponse.json({ 
            error: 'User not found in database',
            uid: decodedToken.uid,
            email: decodedToken.email
          }, { status: 404 });
        }

        // Return user data with role and display name
        return NextResponse.json({
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: userData.role || 'user',
          displayName: userData.displayName || decodedToken.name || decodedToken.email?.split('@')[0] || 'User'
        });
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        // If we can't get the user document, still return basic user info
        return NextResponse.json({
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: 'user', // Default role
          displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User'
        });
      }
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Authentication verification failed' }, { status: 500 });
  }
}