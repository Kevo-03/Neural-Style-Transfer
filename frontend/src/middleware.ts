import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Check if the user has the secure cookie
    const token = request.cookies.get('access_token');
    const path = request.nextUrl.pathname;

    // Define which paths are for guests only
    const isAuthPage = path === '/login' || path === '/signup' || path === '/';

    // 2. THE BOUNCER LOGIC
    // If they have NO token and try to access the app -> Send to Login
    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If they HAVE a token and try to view the login/landing page -> Send to Library
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/library', request.url));
    }

    // Otherwise, let them proceed normally
    return NextResponse.next();
}

// 3. Tell Next.js which routes this middleware should protect
export const config = {
    matcher: ['/', '/login', '/signup', '/generate', '/library'],
};