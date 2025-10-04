import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: NextRequest) {
    // Skip middleware for API routes and static files
    if (request.nextUrl.pathname.startsWith('/api/') || 
        request.nextUrl.pathname.startsWith('/_next/') ||
        request.nextUrl.pathname === '/favicon.ico') {
        return NextResponse.next();
    }

    // For login, register, and verify pages, allow access
    if (request.nextUrl.pathname.startsWith("/login") || 
        request.nextUrl.pathname.startsWith("/register") ||
        request.nextUrl.pathname.startsWith("/verify")) {
        return NextResponse.next();
    }

    // For all other pages, let the components handle authentication
    // This prevents Edge Runtime issues with JWT
    return NextResponse.next();
}