import { initializeApp } from 'firebase/app';
import { addDoc, collection, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAcat-Y5T9O53cBqCXPLXw-zX0RgkIYhRo",
  authDomain: "testprephaven.firebaseapp.com",
  projectId: "testprephaven",
  storageBucket: "testprephaven.firebasestorage.app",
  messagingSenderId: "957041134518",
  appId: "1:957041134518:web:1723c428812b69698c8f17"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);



export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();



export const firestore = getFirestore(app);
export const storage = getStorage(app);



