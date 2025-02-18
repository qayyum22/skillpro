import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, userRole } = await req.json();

    if (!userId || !userRole) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    const response = NextResponse.json({ message: 'Login successful' });

    response.cookies.set('userId', userId, { httpOnly: true, secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('userRole', userRole, { httpOnly: true, secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 });

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Error processing login' }, { status: 500 });
  }
}
