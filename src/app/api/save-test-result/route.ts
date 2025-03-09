import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { TestResult } from "@/types/test";
import { firestore, auth } from "@/lib/firebase"; // Import from the centralized Firebase configuration
import logger from "@/lib/logger";

const resultsCollection = collection(firestore, 'testResults');
const usersCollection = collection(firestore, 'users');

export async function POST(request: Request) {
  try {
    const user = auth.currentUser;

    if (!user) {
      // Log unauthorized access attempt
      await logger.security(
        'Unauthorized access attempt to save-test-result',
        { headers: request.headers },
        undefined,
        undefined,
        '/api/save-test-result'
      );
      
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { testId, scores, feedback, recordings } = data;

    if (!testId || !scores) {
      // Log validation error
      await logger.warning(
        'Invalid test result submission',
        { data, missing: !testId ? 'testId' : 'scores' },
        user.uid,
        user.email || undefined,
        '/api/save-test-result'
      );
      
      return NextResponse.json(
        { message: 'Test ID and scores are required' },
        { status: 400 }
      );
    }

    // Create test result document
    const result: TestResult = {
      testId,
      userId: user.uid,
      type: 'speaking',
      scores,
      feedback,
      recordings,
      createdAt: new Date().toISOString()
    };

    // Save result to testResults collection
    const resultDoc = await addDoc(resultsCollection, result);

    // Update user's test history
    const userRef = doc(usersCollection, user.uid);
    await updateDoc(userRef, {
      completedTests: arrayUnion({
        testId,
        resultId: resultDoc.id,
        type: 'speaking',
        completedAt: result.createdAt
      })
    });

    // Log successful test submission
    await logger.info(
      'Test result saved successfully',
      { testId, resultId: resultDoc.id, type: 'speaking' },
      user.uid,
      user.email || undefined,
      '/api/save-test-result'
    );

    return NextResponse.json({
      success: true,
      resultId: resultDoc.id
    });
  } catch (error) {
    // Log detailed error information
    await logger.error(
      'Error saving test result',
      error as Error,
      { path: '/api/save-test-result' },
      auth.currentUser?.uid,
      auth.currentUser?.email || undefined,
      '/api/save-test-result'
    );
    
    console.error('Error saving test result:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
