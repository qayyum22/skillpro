import { NextRequest, NextResponse } from "next/server";
import { TestService } from "@/services/firebase";
import { dummyIELTSTests } from "@/data/dummyTests";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate input
    if (!data.title || !data.tasks || data.tasks.length === 0) {
      return NextResponse.json(
        { message: 'Title and tasks are required' },
        { status: 400 }
      );
    }

    // For development, use dummy data
    if (process.env.NODE_ENV === 'development' && process.env.USE_DUMMY_DATA === 'true') {
      const newTest = {
        id: (dummyIELTSTests.length + 1).toString(),
        title: data.title,
        category: data.category || 'academic',
        type: data.type || 'writing',
        tasks: data.tasks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dummyIELTSTests.push(newTest);
      return NextResponse.json(newTest);
    } 
    
    // For production, use Firebase
    const newTest = await TestService.addTest({
      title: data.title,
      category: data.category || 'academic',
      type: data.type || 'writing',
      tasks: data.tasks
    });

    return NextResponse.json(newTest);
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
