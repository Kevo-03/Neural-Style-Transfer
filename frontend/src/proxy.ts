import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('access_token');
    const path = request.nextUrl.pathname;

    const isAuthPage = path === '/login' || path === '/signup' || path === '/';

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/library', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/signup', '/generate', '/library'],
};