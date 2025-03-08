import { IELTSTest, IELTSTestType, TestFilters } from '@/types/test'; // Removed TestScores as it is not exported
import { firestore } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  query, 
  orderBy, 
  where, 
  limit, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  QueryDocumentSnapshot, 
  DocumentData,
  serverTimestamp
} from 'firebase/firestore';

// Collection references
const testsCollection = collection(firestore, 'tests');
const resultsCollection = collection(firestore, 'testResults');

// Define TestScores type if not already defined
interface TestScores {
  overall: number;
  fluency?: number;
  vocabulary?: number;
  grammar?: number;
  pronunciation?: number;
}

// Update TestResult type to include strengths and improvements if needed
interface TestResult {
  testId: string;
  userId: string;
  type: IELTSTestType;
  scores: TestScores;
  feedback: {
    strengths?: string[];
    improvements?: string[];
  };
  recordings?: {
    full?: {
      url: string;
      transcription?: string;
    };
  };
  createdAt: string;
}

export const TestService = {
  // Add a new test
  async addTest(test: Omit<IELTSTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<IELTSTest> {
    const timestamp = serverTimestamp();
    const testWithTimestamps = {
      ...test,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const docRef = await addDoc(testsCollection, testWithTimestamps);
    
    const newTest = {
      id: docRef.id,
      ...test,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return newTest;
  },

  // Get a test by ID
  async getTestById(id: string): Promise<IELTSTest | null> {
    const docRef = doc(testsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString()
    } as IELTSTest;
  },

  // Get tests with filtering and pagination
  async getTests(filters: TestFilters): Promise<{
    tests: IELTSTest[],
    total: number,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null
  }> {
    const { type, category, search, page, limit: pageLimit } = filters;
    
    try {
      // Start with a basic query
      let q = query(testsCollection);
      
      // Add type filter if specified
      if (type) {
        q = query(q, where('type', '==', type));
      }
      
      // Add category filter if specified
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      // Get all documents that match the filters
      const querySnapshot = await getDocs(q);
      let tests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as IELTSTest;
      });
      
      // Sort by createdAt in memory
      tests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Apply search filter if provided
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        tests = tests.filter(test => 
          test.title?.toLowerCase().includes(searchLower) ||
          test.tasks.some(task => 
            (task as { title?: string; description?: string }).title?.toLowerCase().includes(searchLower) ||
            (task as { description?: string }).description?.toLowerCase().includes(searchLower)
          )
        );
      }
      
      // Apply pagination
      const startIndex = (page - 1) * pageLimit;
      const paginatedTests = tests.slice(startIndex, startIndex + pageLimit);
      
      return {
        tests: paginatedTests,
        total: tests.length,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.error('Error fetching tests:', error);
      throw error;
    }
  },

  // Save test result
  async saveTestResult(result: Omit<TestResult, 'createdAt'>): Promise<TestResult> {
    const timestamp = serverTimestamp();
    const resultWithTimestamp = {
      ...result,
      createdAt: timestamp
    };
    
    const docRef = await addDoc(resultsCollection, resultWithTimestamp);
    
    return {
      ...result,
      createdAt: new Date().toISOString()
    };
  },

  // Get test results for a user
  async getUserTestResults(userId: string): Promise<TestResult[]> {
    const q = query(
      resultsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const results: TestResult[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data &&
        typeof data.testId === 'string' &&
        typeof data.userId === 'string' &&
        typeof data.type === 'string' &&
        Array.isArray(data.scores)
      ) {
        const scores: TestScores = {
          overall: data.scores[0] || 0,
          fluency: data.scores[1],
          vocabulary: data.scores[2],
          grammar: data.scores[3],
          pronunciation: data.scores[4]
        };

        const result: TestResult = {
          testId: data.testId,
          userId: data.userId,
          type: data.type as IELTSTestType,
          scores,
          feedback: {
            strengths: Array.isArray(data.feedback?.strengths) ? data.feedback.strengths : [],
            improvements: Array.isArray(data.feedback?.improvements) ? data.feedback.improvements : [],
            
          },
          recordings: {
            full: {
              url: data.recordings?.full?.url || '',
              transcription: data.recordings?.full?.transcription || ''
            }
          },
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        };

        results.push(result);
      }
    });
    
    return results;
  },

  // Delete a test
  async deleteTest(id: string): Promise<void> {
    const docRef = doc(testsCollection, id);
    await deleteDoc(docRef);
  },

  // Update a test
  async updateTest(id: string, updates: Partial<IELTSTest>): Promise<void> {
    const docRef = doc(testsCollection, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
}; 

function deleteTest(id: any, string: any) {
  throw new Error('Function not implemented.');
}
