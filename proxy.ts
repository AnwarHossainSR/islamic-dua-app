import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // Skip proxy for static files and API routes that don't need auth
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/cron') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Update session and get response
  const response = await updateSession(request)
  
  // Get auth tokens
  const accessToken = request.cookies.get('sb-access-token')?.value
  const isAuthenticated = !!accessToken

  // Define protected routes
  const protectedRoutes = ['/challenges', '/duas', '/activities', '/logs', '/settings', '/users', '/ai', '/missed-challenges']
  const authRoutes = ['/login', '/signup']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
