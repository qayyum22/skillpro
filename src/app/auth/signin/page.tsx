// "use client";
// import React, { useState } from 'react';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth, firestore } from '../../../lib/firebase';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { LogIn } from 'lucide-react';
// import { doc, getDoc, setDoc } from 'firebase/firestore';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // 🔹 Fetch user role from Firestore
//       const userDoc = doc(firestore, 'users', user.uid);
//       let userSnapshot = await getDoc(userDoc);

//       let userRole = "user"; // Default role if not found

//       if (!userSnapshot.exists()) {
//         console.warn("User not found in Firestore, adding default role...");
//         await setDoc(userDoc, { role: userRole, email: user.email });
//       } else {
//         userRole = userSnapshot.data()?.role || "user";
//       }

//       // 🔹 Send to API for secure cookie storage
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId: user.uid, userRole }),
//       });

//       if (!response.ok) {
//         console.error("Failed to set auth cookie:", await response.text());
//         setError("Login successful, but session couldn't be saved.");
//         return;
//       }

//       router.push('/dashboard');
//     } catch (err: any) {
//       console.error("Login error:", err.message);
//       setError(err.message || 'Invalid email or password');
//     }
//   };

//   return (
//     <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
//         <form className="space-y-6" onSubmit={handleSubmit}>
//           {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

//           <div className="rounded-md shadow-sm">
//             <input
//               id="email-address"
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-3 py-2 border rounded-t-md text-gray-900"
//               placeholder="Email address"
//             />
//             <input
//               id="password"
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 border rounded-b-md text-gray-900"
//               placeholder="Password"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
//           >
//             <LogIn className="inline-block h-5 w-5 mr-2" />
//             Sign in
//           </button>

//           <div className="text-sm text-center">
//             <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500">
//               Don't have an account? Sign up
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;


"use client";
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../../../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // const handleSubmit = async (e: React.FormEvent) => {

  //   e.preventDefault();
  //   try {
  //     const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //     const user = userCredential.user;

  //     // Fetch user role from Firestore
  //     const userDoc = doc(firestore, 'users', user.uid);
  //     let userSnapshot = await getDoc(userDoc);

  //     let userRole = "user"; // Default role if not found

  //     if (userSnapshot.exists()) {
  //       userRole = userSnapshot.data()?.role || "user";
  //     }
  //     else {
  //       console.warn("User not found in Firestore, adding default role...");
  //       await setDoc(userDoc, { role: userRole, email: user.email });
  //     }

  //     console.log(`Fetched Role from Firestore: ${userRole}`);


  //     // Set user ID and role in cookies
  //     Cookies.set('userId', user.uid, { expires: 7, path: '/' });
  //     Cookies.set('userRole', userRole, { expires: 7, path: '/' });

  //     if(userRole === "admin") {
  //       router.push('/admin/home');
  //     } else {
  //       router.push('/dashboard');
  //     }
      

  //   } catch (err: any) {
  //     console.error("Login error:", err.message);
  //     setError(err.message || 'Invalid email or password');
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // 🔍 Fetch user data from Firestore
      const userDoc = doc(firestore, 'users', email);
      const userSnapshot = await getDoc(userDoc);
  
      if (!userSnapshot.exists()) {
        alert("User does not exist in Firestore.");
        return;
      }
      
      console.log(userSnapshot.data());
      const userRole = userSnapshot.data()?.role;
  
      // 🔍 Debug: Log the entire document data
      console.log("Firestore Document Data:", userSnapshot.data());
      console.log(`Extracted Role from Firestore: ${userRole}`);
  
      // 🔍 Debug: Log before setting cookies
      console.log(`Storing in cookies -> userId: ${user.uid}, userRole: ${userRole}`);
  
      // ✅ Store user ID and role in cookies
      Cookies.set('userId', user.uid, { expires: 7, path: '/' });
      Cookies.set('userRole', userRole, { expires: 7, path: '/' });
  
      // 🔄 Redirect based on role
      userRole === "admin" ? router.push('/admin/home') : router.push('/dashboard');
  
    } catch (err: any) {
      console.error("Login error:", err.message);
      setError(err.message || 'Invalid email or password');
    }
  };

  
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

          <div className="rounded-md shadow-sm">
            <input
              id="email-address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-t-md text-gray-900"
              placeholder="Email address"
            />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-b-md text-gray-900"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <LogIn className="inline-block h-5 w-5 mr-2" />
            Sign in
          </button>

          <div className="text-sm text-center">
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500">
              Don't have an account `&apos;` Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
