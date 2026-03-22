import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;

        // Decode the payload (second part of the JWT)
        const payload = JSON.parse(atob(parts[1]));

        if (!payload.exp) return true;

        // exp is in seconds, Date.now() is in milliseconds
        return Date.now() >= payload.exp * 1000;
    } catch {
        // If decoding fails, treat as expired
        return true;
    }
}

export function proxy(request: NextRequest) {
    const token = request.cookies.get('access_token');
    const path = request.nextUrl.pathname;

    const isAuthPage = path === '/login' || path === '/signup' || path === '/';
    const isValidToken = token && !isTokenExpired(token.value);

    if (!isValidToken && !isAuthPage) {
        const response = NextResponse.redirect(new URL('/', request.url));

        // Clear the expired cookie so the user doesn't get stuck in a redirect loop
        if (token && !isValidToken) {
            response.cookies.delete('access_token');
        }

        return response;
    }

    if (isValidToken && isAuthPage) {
        return NextResponse.redirect(new URL('/library', request.url));
    }

    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
}

export const config = {
    matcher: ['/', '/login', '/signup', '/generate', '/library'],
};