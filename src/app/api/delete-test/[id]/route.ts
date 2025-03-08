import { NextRequest, NextResponse } from "next/server";
import { TestService } from "@/services/firebase";
import { dummyIELTSTests } from "@/data/dummyTests";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const  params  = await context.params;
  const { id } = params;

  try {
    if (!id) {
      return NextResponse.json(
        { message: 'Test ID is required' },
        { status: 400 }
      );
    }

    // For development, use dummy data
    if (process.env.NODE_ENV === 'development' && process.env.USE_DUMMY_DATA === 'true') {
      const index = dummyIELTSTests.findIndex(test => test.id === id);
      
      if (index === -1) {
        return NextResponse.json(
          { message: 'Test not found' },
          { status: 404 }
        );
      }
      
      dummyIELTSTests.splice(index, 1);
      return NextResponse.json({ success: true });
    } 
    
    // For production, use Firebase
    await TestService.deleteTest(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 