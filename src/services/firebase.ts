import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, doc, 
  getDoc, getDocs, query, where, orderBy, limit, deleteDoc,
  startAfter, DocumentData, QueryDocumentSnapshot 
} from 'firebase/firestore';
import { IELTSTest, TestFilters } from '@/types/test';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
const testsCollection = collection(db, 'tests');

export const TestService = {
  // Add a new test
  async addTest(test: Omit<IELTSTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<IELTSTest> {
    const timestamp = new Date().toISOString();
    const testWithTimestamps = {
      ...test,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    const docRef = await addDoc(testsCollection, testWithTimestamps);
    return {
      id: docRef.id,
      ...testWithTimestamps
    };
  },

  // Get a test by ID
  async getTestById(id: string): Promise<IELTSTest | null> {
    const docRef = doc(testsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as IELTSTest;
  },

  // Get tests with filtering and pagination
  async getTests(filters: TestFilters): Promise<{
    tests: IELTSTest[],
    total: number,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null
  }> {
    const { type, category, search, page, limit: pageLimit } = filters;
    
    let q = query(testsCollection, orderBy('createdAt', 'desc'));
    
    if (type) {
      q = query(q, where('type', '==', type));
    }
    
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    q = query(q, limit(pageLimit));
    
    const querySnapshot = await getDocs(q);
    const tests: IELTSTest[] = [];
    
    querySnapshot.forEach((doc) => {
      tests.push({
        id: doc.id,
        ...doc.data()
      } as IELTSTest);
    });
    
    // If search term is provided, filter the results in JS
    // Ideally, you would use a solution like Algolia for text search
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      return {
        tests: tests.filter(test => 
          test.title.toLowerCase().includes(searchLower) ||
          test.tasks.some(task => 
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower)
          )
        ),
        total: tests.length,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
      };
    }
    
    return {
      tests,
      total: tests.length,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
  },

  // Delete a test
  async deleteTest(id: string): Promise<void> {
    await deleteDoc(doc(testsCollection, id));
  },

  // Update a test
  async updateTest(id: string, updates: Partial<IELTSTest>): Promise<void> {
    const docRef = doc(testsCollection, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }
}; 