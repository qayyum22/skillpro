// import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { TestService } from "@/services/firebase";
import { dummyIELTSTests } from "@/data/dummyTests";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    // For development, use dummy data
    if (process.env.NODE_ENV === 'development' && process.env.USE_DUMMY_DATA === 'true') {
      let filteredTests = [...dummyIELTSTests];

      // Apply filters
      if (type) {
        filteredTests = filteredTests.filter(test => test.type === type);
      }

      if (category) {
        filteredTests = filteredTests.filter(test => test.category === category);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredTests = filteredTests.filter(test => 
          test.title.toLowerCase().includes(searchLower) ||
          test.tasks.some(task => 
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower)
          )
        );
      }

      // Sort by creation date
      filteredTests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Pagination
      const start = (page - 1) * limit;
      const paginatedTests = filteredTests.slice(start, start + limit);

      return NextResponse.json({
        data: paginatedTests,
        total: filteredTests.length,
        page,
        limit
      });
    }
    
    // For production, use Firebase
    const result = await TestService.getTests({
      type: type as any,
      category: category as any,
      search,
      page,
      limit
    });

    return NextResponse.json({
      data: result.tests,
      total: result.total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
