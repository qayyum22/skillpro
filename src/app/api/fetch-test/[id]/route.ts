import { NextRequest, NextResponse } from "next/server";
import { TestService } from "@/services/firebase";
import { dummyIELTSTests } from "@/data/dummyTests";

export async function GET(
  request: Request,
   context : { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Test ID is required' },
        { status: 400 }
      );
    }

    // For development, use dummy data
    if (process.env.NODE_ENV === 'development' && process.env.USE_DUMMY_DATA === 'true') {
      const test = dummyIELTSTests.find(test => test.id === id);
      
      if (!test) {
        return NextResponse.json(
          { message: 'Test not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(test);
    } 
    
    // For production, use Firebase
    const test = await TestService.getTestById(id);
    
    if (!test) {
      return NextResponse.json(
        { message: 'Test not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
