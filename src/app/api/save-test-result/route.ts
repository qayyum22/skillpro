import { NextRequest, NextResponse } from "next/server";
import { getFirestore, collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { TestResult } from "@/types/test";

const db = getFirestore();
const resultsCollection = collection(db, 'testResults');
const usersCollection = collection(db, 'users');

export async function POST(request: Request) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { testId, scores, feedback, recordings } = data;

    if (!testId || !scores) {
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

    return NextResponse.json({
      success: true,
      resultId: resultDoc.id
    });
  } catch (error) {
    console.error('Error saving test result:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
