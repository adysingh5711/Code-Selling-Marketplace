import { NextResponse } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/'];

// List of routes that require authentication
const protectedRoutes = [
    '/listings/create',
    '/listings/user',
    '/purchases/user'
];

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Check if the route requires authentication
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.includes(pathname);

    // If the route is protected and there's no token, redirect to login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If the user is logged in and tries to access login page, redirect to home
    if (isPublicRoute && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
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