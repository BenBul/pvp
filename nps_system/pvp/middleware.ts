import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Define protected routes
  const protectedRoutes = [
    '/profile',
    '/survey',
    '/organization',
    '/statistics',
    '/vote',
    '/qr',
    '/invite',
    '/entry'
  ]

  // Define public routes (routes that don't require authentication)
  const publicRoutes = [
    '/',
    '/login',
    '/register'
  ]

  const { pathname } = req.nextUrl

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()

    // If no session exists, redirect to login
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If user is authenticated and trying to access login/register, redirect to survey
  if (isPublicRoute && (pathname === '/login' || pathname === '/register')) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      return NextResponse.redirect(new URL('/survey', req.url))
    }
  }

  return res
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