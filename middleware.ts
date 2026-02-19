import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/devices',
    '/threats',
    '/quarantine',
    '/webactivity',
    '/usbactivity',
    '/patches',
    '/users',
    '/settings',
    '/billing'
  ]

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(`/${route}`) || path === route)

  // For now, skip auth check (user can implement auth logic later)
  // This middleware sets up the structure
  if (isProtectedRoute) {
    // Future auth check here
    console.log(`Protected route accessed: ${path}`)
  }

  return NextResponse.next()
}

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
}
