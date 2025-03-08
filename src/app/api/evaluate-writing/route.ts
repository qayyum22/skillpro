import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { testId, answers } = await request.json();
    
    if (!testId || !answers) {
      return NextResponse.json(
        { message: 'Test ID and answers are required' },
        { status: 400 }
      );
    }
    
    // In a real application, you would:
    // 1. Store the student's responses
    // 2. Either trigger automatic evaluation or queue for human review
    // 3. Return preliminary feedback if possible
    
    // This is a mock response
    const evaluation = {
      overallBand: 6.5,
      criteriaScores: {
        taskAchievement: 7,
        coherenceAndCohesion: 6,
        lexicalResource: 7,
        grammaticalRangeAndAccuracy: 6
      },
      feedback: {
        strengths: [
          "Good understanding of the task requirements",
          "Good use of vocabulary related to the topic",
          "Clear structure with introduction, body paragraphs, and conclusion"
        ],
        areasForImprovement: [
          "Some grammatical errors affecting clarity",
          "Could develop ideas more fully with examples",
          "Some issues with paragraph cohesion"
        ]
      }
    };
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error('Error evaluating writing:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 