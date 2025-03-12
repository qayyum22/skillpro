"use client"
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Check, X } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../../lib/firebase';

// Password validation regex patterns
const PASSWORD_VALIDATIONS = {
  minLength: { regex: /.{8,}/, message: 'At least 8 characters' },
  hasLowerCase: { regex: /[a-z]/, message: 'At least one lowercase letter' },
  hasUpperCase: { regex: /[A-Z]/, message: 'At least one uppercase letter' },
  hasNumber: { regex: /[0-9]/, message: 'At least one number' },
  hasSpecial: { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, message: 'At least one special character' }
};

// Google provider
const googleProvider = new GoogleAuthProvider();

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecial: false
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const router = useRouter();

  // Validate password on change
  useEffect(() => {
    // Check each validation requirement
    const validations = {
      minLength: PASSWORD_VALIDATIONS.minLength.regex.test(password),
      hasLowerCase: PASSWORD_VALIDATIONS.hasLowerCase.regex.test(password),
      hasUpperCase: PASSWORD_VALIDATIONS.hasUpperCase.regex.test(password),
      hasNumber: PASSWORD_VALIDATIONS.hasNumber.regex.test(password),
      hasSpecial: PASSWORD_VALIDATIONS.hasSpecial.regex.test(password)
    };
    
    setPasswordValidation(validations);
    
    // Check if all validations pass
    const isValid = Object.values(validations).every(Boolean);
    setIsPasswordValid(isValid);
  }, [password]);

  // Create or update user document in Firestore
  const createUserDocument = async (user: User, displayName: string | null = null) => {
    // Current timestamp for account creation
    const timestamp = new Date().toISOString();
    
    // Check if user document already exists
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update last login if user already exists
      await setDoc(userDocRef, { lastLogin: timestamp }, { merge: true });
      return;
    }

    // Use display name from Google, or provided name, or email username
    const userName = displayName || name || (user.email ? user.email.split('@')[0] : 'User');

    // Prepare user data matching the profile page structure
    const userData = {
      id: user.uid,
      name: userName,
      email: user.email,
      subscriptionPlan: {
        type: 'starter',
        fullTestRemaining: 1,
        moduleTestsRemaining: 4,
      },
      role: 'user',
      accountCreatedAt: timestamp,
      lastLogin: timestamp,
      testHistory: [], // Initialize empty test history array
      achievements: [], // Initialize empty achievements array
      studyGoals: "Complete my first test", // Default study goals
    };

    // Store user document with UID
    await setDoc(doc(firestore, 'users', user.uid), userData);

    // Also store user doc with email as key for profile page compatibility
    if (user.email) {
      await setDoc(doc(firestore, 'users', user.email), userData);
    }
  };

  // Handle email/password signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Additional validation before submission
    if (!isPasswordValid) {
      setError("Password doesn't meet all requirements");
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await createUserDocument(user);
      
      alert("User created successfully");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to create account: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Google sign in/signup
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Use Google account display name
      await createUserDocument(user, user.displayName);
      
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google sign in failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGoogleLoading(false);
    }
  };
  
  // Render validation item with icon
  const renderValidationItem = (isValid: boolean, message: string) => (
    <li className="flex items-center text-sm">
      {isValid ? 
        <Check className="h-4 w-4 text-green-500 mr-2" /> : 
        <X className="h-4 w-4 text-red-500 mr-2" />
      }
      <span className={isValid ? "text-green-700" : "text-gray-600"}>
        {message}
      </span>
    </li>
  );
  
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        
        {/* Google Sign-in Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${googleLoading ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
              </svg>
            </span>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
        
        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  password && !isPasswordValid ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
              />
              
              {showPasswordRequirements && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                  <ul className="space-y-1">
                    {renderValidationItem(passwordValidation.minLength, PASSWORD_VALIDATIONS.minLength.message)}
                    {renderValidationItem(passwordValidation.hasLowerCase, PASSWORD_VALIDATIONS.hasLowerCase.message)}
                    {renderValidationItem(passwordValidation.hasUpperCase, PASSWORD_VALIDATIONS.hasUpperCase.message)}
                    {renderValidationItem(passwordValidation.hasNumber, PASSWORD_VALIDATIONS.hasNumber.message)}
                    {renderValidationItem(passwordValidation.hasSpecial, PASSWORD_VALIDATIONS.hasSpecial.message)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading || !isPasswordValid ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;