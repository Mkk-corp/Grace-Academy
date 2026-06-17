import { NextResponse } from 'next/server'

// Marketing paths that authenticated users should bypass
const MARKETING_PATHS = ['/', '/about', '/services', '/blog', '/portfolio', '/faq', '/pricing', '/contact', '/enroll', '/live', '/certificates']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('ga-admin')?.value

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Protect student portal and profile
  if (pathname === '/portal' || pathname === '/profile') {
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from the identity/marketing website
  if (token && MARKETING_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/portal', '/profile', '/', '/about', '/services', '/blog', '/portfolio', '/faq', '/pricing', '/contact', '/enroll', '/live', '/certificates'],
}
