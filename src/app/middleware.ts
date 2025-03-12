import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if the route starts with /admin or /dashboard
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/dashboard')) {
    // Get the user data from cookies (we'll store it as a JSON string)
    const userData = request.cookies.get('user')?.value;
    
    if (!userData) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    try {
      const user = JSON.parse(userData);
      
      // If trying to access admin and not admin role, redirect to dashboard
      if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // If there's any error parsing the user data, redirect to signin
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}
