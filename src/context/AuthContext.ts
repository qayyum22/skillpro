// "use client"
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import {
//   User,
//   signInWithPopup,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//   sendPasswordResetEmail,
//   signOut
// } from 'firebase/auth';
// import { auth, googleProvider, githubProvider } from '../lib/firebase';
// import { toast } from 'react-hot-toast';

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   signInWithGoogle: () => Promise<void>;
//   signInWithGithub: () => Promise<void>;
//   signInWithEmail: (email: string, password: string) => Promise<void>;
//   signUpWithEmail: (email: string, password: string) => Promise<void>;
//   resetPassword: (email: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const signInWithGoogle = async () => {
//     try {
//       await signInWithPopup(auth, googleProvider);
//       toast.success('Successfully signed in with Google!');
//     } catch (error) {
//       toast.error('Failed to sign in with Google');
//     }
//   };

//   const signInWithGithub = async () => {
//     try {
//       await signInWithPopup(auth, githubProvider);
//       toast.success('Successfully signed in with GitHub!');
//     } catch (error) {
//       toast.error('Failed to sign in with GitHub');
//     }
//   };

//   const signInWithEmail = async (email: string, password: string) => {
//     try {
//       const result = await signInWithEmailAndPassword(auth, email, password);
//       if (!result.user.emailVerified) {
//         await signOut(auth);
//         toast.error('Please verify your email before signing in');
//         return;
//       }
//       toast.success('Successfully signed in!');
//     } catch (error) {
//       toast.error('Failed to sign in');
//     }
//   };

//   const signUpWithEmail = async (email: string, password: string) => {
//     try {
//       const result = await createUserWithEmailAndPassword(auth, email, password);
//       await sendEmailVerification(result.user);
//       await signOut(auth);
//       toast.success('Verification email sent! Please check your inbox.');
//     } catch (error) {
//       toast.error('Failed to sign up');
//     }
//   };

//   const resetPassword = async (email: string) => {
//     try {
//       await sendPasswordResetEmail(auth, email);
//       toast.success('Password reset email sent!');
//     } catch (error) {
//       toast.error('Failed to send password reset email');
//     }
//   };

//   const logout = async () => {
//     try {
//       await signOut(auth);
//       toast.success('Successfully logged out!');
//     } catch (error) {
//       toast.error('Failed to log out');
//     }
//   };

//   const value = {
//     user,
//     loading,
//     signInWithGoogle,
//     signInWithGithub,
//     signInWithEmail,
//     signUpWithEmail,
//     resetPassword,
//     logout
//   };

//   return (
//       <AuthContext.Provider value={value}>
//         {!loading && children}
//       </AuthContext.Provider>
//     );
// };
