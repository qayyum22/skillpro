import { initializeApp } from 'firebase/app';
import { addDoc, collection, doc, getFirestore, setDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAcKpeZTpoIWMGUKJbjSJDTpnqPHOUuYqc",
  authDomain: "ielts-68206.firebaseapp.com",
  projectId: "ielts-68206",
  storageBucket: "ielts-68206.firebasestorage.app",
  messagingSenderId: "628649416928",
  appId: "1:628649416928:web:4c0e0c801dc2da22185885",
  measurementId: "G-J6Y0W4TXMG"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();


export const firestore = getFirestore(app);