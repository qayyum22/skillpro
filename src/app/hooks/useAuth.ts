import { useState, useEffect } from 'react';
import { auth, firestore } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  email: string | null;
  role: string;
}

export function useAuth(requireAdmin: boolean = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get the ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Verify token and get user role from server
          const response = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to verify authentication');
          }

          const userData = await response.json();
          
          // Check admin access if required
          if (requireAdmin && userData.role !== 'admin') {
            router.replace('/dashboard');
            return;
          }

          setUser(userData);
        } else {
          setUser(null);
          router.replace('/signin');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
        router.replace('/signin');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, requireAdmin]);

  return { user, loading };
} 