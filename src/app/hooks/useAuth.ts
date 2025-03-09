import { useState, useEffect } from 'react';
import { auth, firestore } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  email: string | null;
  role: string;
  displayName: string | null;
}

export function useAuth(requireAdmin: boolean = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if auth is available
    if (!auth) {
      console.error('Firebase auth is not available');
      setError('Authentication service is not available');
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            // Get the ID token
            const idToken = await firebaseUser.getIdToken(true); // Force refresh token
            
            // Verify token and get user role from server
            const response = await fetch('/api/auth/verify', {
              headers: {
                Authorization: `Bearer ${idToken}`
              }
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('Auth verification failed:', response.status, errorData);
              
              // If the service is unavailable, use basic user info
              if (response.status === 503) {
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  role: 'user' // Default role
                });
                return;
              }
              
              throw new Error(errorData.error || 'Failed to verify authentication');
            }

            const userData = await response.json();
            
            // Check admin access if required
            if (requireAdmin && userData.role !== 'admin') {
              console.log('Non-admin user attempted to access admin page');
              router.replace('/dashboard');
              return;
            }

            setUser(userData);
          } catch (verifyError) {
            console.error('Token verification error:', verifyError);
            // If verification fails, try to get basic user info from Firebase
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: 'user' // Default role
            });
          }
        } else {
          setUser(null);
          if (window.location.pathname !== '/signin' && 
              window.location.pathname !== '/signup' && 
              !window.location.pathname.startsWith('/reset-password')) {
            router.replace('/signin');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
        setUser(null);
        router.replace('/signin');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, requireAdmin]);

  return { user, loading, error };
} 