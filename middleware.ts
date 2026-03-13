import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from './src/lib/supabase/client'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: request.headers.get('authorization') ?? '',
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Route protection based on ARCHITECTURE.md rules
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/browse',
    '/file',
    '/library',
    '/upload',
    '/manage',
    '/bookmarks',
    '/notifications',
    '/profile',
  ]

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // For admin routes, we'll let the RoleGuard component handle role-based access
  // The middleware just ensures the user is authenticated

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
