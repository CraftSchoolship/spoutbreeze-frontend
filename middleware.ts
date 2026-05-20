import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Helper to decode a JWT payload (no signature verification, middleware is just for routing)
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

// Helper function to check if refresh token is expired
function isRefreshTokenExpired(request: NextRequest): boolean {
  const refreshToken = request.cookies.get('refresh_token')?.value
  if (!refreshToken) return true

  const payload = decodeJwtPayload(refreshToken)
  const exp = typeof payload?.exp === 'number' ? payload.exp : null
  if (!exp) return true

  const nowInSeconds = Math.floor(Date.now() / 1000)
  return exp <= nowInSeconds
}

// Helper function to get auth status (valid / expired)
function getAuthStatus(request: NextRequest): {
  isAuthenticated: boolean
  isAccessTokenExpired: boolean
} {
  const accessToken = request.cookies.get('access_token')?.value
  if (!accessToken) {
    return { isAuthenticated: false, isAccessTokenExpired: false }
  }

  const payload = decodeJwtPayload(accessToken)
  const exp = typeof payload?.exp === 'number' ? payload.exp : null
  if (!exp) {
    return { isAuthenticated: false, isAccessTokenExpired: false }
  }

  const nowInSeconds = Math.floor(Date.now() / 1000)
  if (exp <= nowInSeconds) {
    console.log('Access token expired in middleware')
    return { isAuthenticated: false, isAccessTokenExpired: true }
  }

  return { isAuthenticated: true, isAccessTokenExpired: false }
}

// Function to refresh the access token
async function refreshAccessToken(request: NextRequest): Promise<Response | null> {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value
    if (!refreshToken) {
      console.log('No refresh token available')
      return null
    }

    console.log('Attempting to refresh access token in middleware...')
    
    const response = await fetch(`${API_URL}/api/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refresh_token=${refreshToken}`,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      console.log('Token refresh failed:', response.status)
      return null
    }

    console.log('Token refreshed successfully in middleware')
    return response

  } catch (error) {
    console.error('Error refreshing token in middleware:', error)
    return null
  }
}

// Define protected and public routes
const protectedRoutes = ['/home', '/settings', '/admin', '/my-org', '/onboarding']
const adminRoutes = ['/admin']
// /my-org is an "elevated" route for the organization-scoped admin tier. It is
// NOT in adminRoutes — that array is reserved for super-admin gating, and
// super admins are also bounced out of non-/admin routes into /admin.
const orgAdminRoutes = ['/my-org']
const authRoutes = ['/auth/callback']
const publicRoutes = ['/']

// Extract roles from a Keycloak access token payload.
// Keycloak puts realm roles under realm_access.roles and per-client roles
// under resource_access.<client_id>.roles. The backend's source of truth is
// the client role list (see extract_keycloak_roles in auth_controller.py),
// so we must read both: realm roles for legacy compatibility and every
// client's roles to match the backend.
function extractRolesFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token)
  if (!payload) return []
  const out: string[] = []
  const realmRoles = payload?.realm_access?.roles
  if (Array.isArray(realmRoles)) {
    for (const r of realmRoles) if (typeof r === 'string') out.push(r)
  }
  const resourceAccess = payload?.resource_access
  if (resourceAccess && typeof resourceAccess === 'object') {
    for (const client of Object.values(resourceAccess)) {
      const clientRoles = (client as { roles?: unknown })?.roles
      if (Array.isArray(clientRoles)) {
        for (const r of clientRoles) if (typeof r === 'string') out.push(r)
      }
    }
  }
  return out
}

function hasSuperAdminRole(request: NextRequest): boolean {
  const accessToken = request.cookies.get('access_token')?.value
  if (!accessToken) return false
  return extractRolesFromToken(accessToken).includes('super_admin')
}

function hasOrgAdminRole(request: NextRequest): boolean {
  const accessToken = request.cookies.get('access_token')?.value
  if (!accessToken) return false
  return extractRolesFromToken(accessToken).includes('admin')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { isAuthenticated: isAuth, isAccessTokenExpired } = getAuthStatus(request)
  const refreshTokenExpired = isRefreshTokenExpired(request)

  // Skip middleware for static files, API routes, and Next.js internal routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  // Handle auth callback route (allow regardless of auth state)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Handle join routes (public access for events)
  if (pathname.startsWith('/join/')) {
    return NextResponse.next()
  }

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route) || pathname === route
  )

  // Check if current path is the public home route
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  // Authentication logic
  if (isProtectedRoute) {
    // If access token is expired but refresh token is valid, attempt refresh
    if (isAccessTokenExpired && !refreshTokenExpired) {
      console.log('Access token expired, attempting refresh...')
      
      const refreshResponse = await refreshAccessToken(request)
      
      if (refreshResponse) {
        // Extract new cookies from the refresh response
        const setCookieHeaders = refreshResponse.headers.getSetCookie()
        
        // Create response and forward the new cookies
        const response = NextResponse.next()
        
        // Copy all Set-Cookie headers from the refresh response
        setCookieHeaders.forEach(cookie => {
          response.headers.append('Set-Cookie', cookie)
        })
        
        return response
      } else {
        // Refresh failed, redirect to root and only clear access token
        const redirectUrl = new URL('/', request.url)
        const response = NextResponse.redirect(redirectUrl)
        response.headers.set('x-middleware-redirect-reason', 'refresh-failed')
        
        // Only clear access token, keep refresh token for user to try again
        response.cookies.set('access_token', '', { maxAge: 0, path: '/' })
        
        return response
      }
    }

    // If both tokens are expired, redirect to root and clear both
    if (isAccessTokenExpired && refreshTokenExpired) {
      const redirectUrl = new URL('/', request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-middleware-redirect-reason', 'tokens-expired')

      // Clear both cookies only when both are expired
      response.cookies.set('access_token', '', { maxAge: 0, path: '/' })
      response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' })

      return response
    }

    // If no access token but refresh token exists, let the refresh attempt happen above
    if (!isAuth && !refreshTokenExpired) {
      return NextResponse.next()
    }

    // If no access token and no refresh token, redirect to root
    if (!isAuth) {
      const redirectUrl = new URL('/', request.url)
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
    const userIsSuperAdmin = hasSuperAdminRole(request)
    const userIsOrgAdmin = hasOrgAdminRole(request)

    // Non-super-admin trying to enter the super-admin section.
    if (isAdminRoute && !userIsSuperAdmin) {
      const redirectUrl = new URL('/home', request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-middleware-redirect-reason', 'forbidden-not-super-admin')
      return response
    }

    // Super admin is a back-office user — bounce them out of the product UI
    // (including /my-org) into the admin dashboard. They keep auth, but
    // can't browse /home, /settings, /my-org, etc.
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

    // User is authenticated, allow access to protected route
    return NextResponse.next()
  }

  if (isPublicRoute) {
    // Public route (/) accessed by authenticated user
    if (isAuth) {
      // Super admins go straight to the back office; everyone else to /home.
      const landing = hasSuperAdminRole(request) ? '/admin' : '/home'
      const redirectUrl = new URL(landing, request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('x-middleware-redirect-reason', 'already-authenticated')
      return response
    }

    // Unauthenticated (or expired) user on public route, allow access
    return NextResponse.next()
  }

  // For any other routes, just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public).*)',
  ],
}