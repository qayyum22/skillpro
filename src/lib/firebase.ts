import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();


async function createUserProfile(uid, userData) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    profile: {
      name: userData.name,
      email: userData.email,
      username: userData.username,
      // profilePicture: userData.profilePicture // Optional
    },
    subscription: {
      current: {
        plan: userData.plan || "free",
        purchaseDate: userData.purchaseDate || "",
        expiryDate: userData.expiryDate || "",
        status: "active"
      },
      history: []
    }
  });
}

// Usage
createUserProfile("userUID", { 
  name: "John Doe", 
  email: "john.doe@example.com", 
  username: "johndoe", 
  plan: "premium", 
  purchaseDate: "2024-11-12",
  expiryDate: "2025-02-11"
});


async function saveTestResult(uid, testData) {
  const resultsRef = doc(db, "results", uid);
  await setDoc(resultsRef, {
    tests: {
     [testData.date]: {
        type: testData.type,
        studentAnswers: testData.studentAnswers,
        correctAnswers: testData.correctAnswers,
        score: testData.score
      }
    }
  }, { merge: true }); // Use merge to add to existing tests object
}

// Usage
saveTestResult("userUID", {
  date: "2024-11-12",
  type: "Listening",
  studentAnswers: ["A", "B", "C", "D"],
  correctAnswers: ["A", "C", "C", "B"],
  score: 6.5
});
