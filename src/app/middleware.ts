import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = new URL(request.url);
    const userId = request.cookies.get('userId')?.value;
    const userRole = request.cookies.get('userRole')?.value;

    console.info(`[Middleware] Checking access: Path: ${pathname}, userId: ${userId}, userRole: ${userRole}`);

    // 🚨 Redirect to login if no session
    if (!userId || !userRole) {
        console.warn("[Middleware] No session found, redirecting to login.");
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 🚨 Restrict admin routes
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
        console.warn("[Middleware] Unauthorized access to admin route. Redirecting.");
        return NextResponse.redirect(new URL('/', request.url)); // Changed from `/`
    }

    // 🚨 Ensure dashboard route is protected
    if (pathname.startsWith('/dashboard') && !userRole) {
        console.warn("[Middleware] Unauthenticated access to dashboard. Redirecting.");
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

// 🚀 Apply middleware to protected routes only
export const config = {
    matcher: ['/admin/**', '/dashboard/**'], // Fully protect all subroutes
};
