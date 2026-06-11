import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper to decode a JWT payload (no signature verification — middleware is
// only for routing; the backend verifies the Firebase session cookie properly).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = atob(base64)
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// Auth status derived from the Firebase session cookie. The cookie is a JWT
// with an `exp` claim; we treat it as authenticated until it expires.
function getAuthStatus(request: NextRequest): { isAuthenticated: boolean } {
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) return { isAuthenticated: false }

  const payload = decodeJwtPayload(sessionCookie)
  const exp = typeof payload?.exp === 'number' ? payload.exp : null
  if (!exp) return { isAuthenticated: false }

  const nowInSeconds = Math.floor(Date.now() / 1000)
  return { isAuthenticated: exp > nowInSeconds }
}

// Roles are carried as a Firebase custom claim (`roles`: string[]) set by the
// backend (see AuthService.set_roles_claim). They land at the top level of the
// session cookie's JWT payload.
function extractRolesFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token)
  const roles = payload?.roles
  if (Array.isArray(roles)) {
    return roles.filter((r): r is string => typeof r === 'string')
  }
  return []
}

function getRoles(request: NextRequest): string[] {
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) return []
  return extractRolesFromToken(sessionCookie)
}

// Define protected and public routes
const protectedRoutes = ['/home', '/settings', '/admin', '/my-org', '/onboarding']
const adminRoutes = ['/admin']
// /my-org is an "elevated" route for the organization-scoped admin tier. It is
// NOT in adminRoutes — that array is reserved for super-admin gating, and
// super admins are also bounced out of non-/admin routes into /admin.
const orgAdminRoutes = ['/my-org']
// All /auth/* pages (signin, signup, forgot-password) are reachable regardless
// of auth state.
const authRoutes = ['/auth']
const publicRoutes = ['/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { isAuthenticated: isAuth } = getAuthStatus(request)

  // Skip middleware for static files, API routes, and Next.js internals.
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Auth pages — always allowed.
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Public event join routes.
  if (pathname.startsWith('/join/')) {
    return NextResponse.next()
  }

  const isProtectedRoute = protectedRoutes.some(
    route => pathname.startsWith(route) || pathname === route
  )
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  if (isProtectedRoute) {
    // No valid session → send to sign-in.
    if (!isAuth) {
      const redirectUrl = new URL('/auth/signin', request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-middleware-redirect-reason', 'unauthenticated')
      return response
    }

    const isAdminRoute = adminRoutes.some(
      route => pathname.startsWith(route) || pathname === route
    )
    const isOrgAdminRoute = orgAdminRoutes.some(
      route => pathname.startsWith(route) || pathname === route
    )
    const roles = getRoles(request)
    const userIsSuperAdmin = roles.includes('super_admin')
    const userIsOrgAdmin = roles.includes('admin')

    // Non-super-admin trying to enter the super-admin section.
    if (isAdminRoute && !userIsSuperAdmin) {
      const redirectUrl = new URL('/home', request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-middleware-redirect-reason', 'forbidden-not-super-admin')
      return response
    }

    // Super admin is a back-office user — bounce them out of the product UI
    // (including /my-org) into the admin dashboard.
    if (!isAdminRoute && userIsSuperAdmin) {
      const redirectUrl = new URL('/admin', request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-middleware-redirect-reason', 'super-admin-redirected-to-admin')
      return response
    }

    // Non-org-admin trying to enter /my-org.
    if (isOrgAdminRoute && !userIsOrgAdmin) {
      const redirectUrl = new URL('/home', request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-middleware-redirect-reason', 'forbidden-not-org-admin')
      return response
    }

    return NextResponse.next()
  }

  if (isPublicRoute) {
    // Authenticated user on the public landing page — route them onward.
    if (isAuth) {
      const landing = getRoles(request).includes('super_admin') ? '/admin' : '/home'
      const redirectUrl = new URL(landing, request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-middleware-redirect-reason', 'already-authenticated')
      return response
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public).*)',
  ],
}
