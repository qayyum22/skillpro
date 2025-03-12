'use client';

import { auth, firestore } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import Cookies from 'js-cookie';

// Google provider
const googleProvider = new GoogleAuthProvider();

export default function Signin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData;
      
      if (userDoc.exists()) {
        // User exists, update last login
        userData = userDoc.data();
        await setDoc(userDocRef, { lastLogin: new Date().toISOString() }, { merge: true });
      } else {
        // New user, create account
        const timestamp = new Date().toISOString();
        userData = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          subscriptionPlan: {
            type: 'starter',
            fullTestRemaining: 1,
            moduleTestsRemaining: 4,
          },
          role: 'user',
          accountCreatedAt: timestamp,
          lastLogin: timestamp,
          testHistory: [],
          achievements: [],
          studyGoals: "Complete my first test",
        };
        
        // Store user document with UID
        await setDoc(userDocRef, userData);
        
        // Also store user doc with email as key for profile page compatibility
        if (user.email) {
          await setDoc(doc(firestore, 'users', user.email), userData);
        }
      }
      
      // Store user info in cookies
      const userInfo = {
        uid: user.uid,
        email: user.email,
        role: userData.role || 'user'
      };
      
      // Set cookie to expire in 7 days
      Cookies.set('user', JSON.stringify(userInfo), { expires: 7 });
      
      // Redirect based on role
      if (userData.role === 'admin') {
        window.location.href = '/admin/home';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      // Sign in with Firebase
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user's role from Firestore
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('User data not found');
      }

      // Store user info in cookies
      const userInfo = {
        uid: user.uid,
        email: user.email,
        role: userData.role
      };
      
      // Set cookie to expire in 7 days
      Cookies.set('user', JSON.stringify(userInfo), { expires: 7 });

      // Redirect based on role
      if (userData.role === 'admin') {
        window.location.href = '/admin/home';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className={`w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${googleLoading ? 'cursor-not-allowed opacity-70' : ''}`}
        >
          <span className="mr-2">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
          </span>
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white rounded-md ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}