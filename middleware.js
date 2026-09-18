import { NextResponse } from 'next/server'

// Decode JWT payload without signature verification (for routing decisions only).
// Real verification happens in each API route via verifyToken().
function decodeToken(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b64))
  } catch {
    return null
  }
}

function isAdmin(p)    { return p && (p.roleId === 'r_admin'    || p.adm === 1) }
function isAssessor(p) { return p && (p.roleId === 'r_assessor' || p.asr === 1) }
function isTeacher(p)  { return p && (p.roleId === 'r_teacher'  || p.tch === 1) }

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token   = request.cookies.get('ga-admin')?.value
  const payload  = token ? decodeToken(token) : null
  const authed   = !!payload

  const url  = p => new URL(p, request.url)

  // ── /admin/* ─────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!authed || !isAdmin(payload))
      return NextResponse.redirect(url('/login'))
  }

  // ── /assessor/* ──────────────────────────────────────────────────
  if (pathname.startsWith('/assessor')) {
    if (!authed) return NextResponse.redirect(url('/login'))
    if (!isAdmin(payload) && !isAssessor(payload))
      return NextResponse.redirect(url('/login'))
  }

  // ── /teacher/* ───────────────────────────────────────────────────
  if (pathname.startsWith('/teacher')) {
    if (!authed) return NextResponse.redirect(url('/login'))
    if (!isAdmin(payload) && !isTeacher(payload))
      return NextResponse.redirect(url('/login'))
  }

  // ── /portal/* ────────────────────────────────────────────────────
  if (pathname.startsWith('/portal')) {
    if (!authed) return NextResponse.redirect(url('/login'))
    // Redirect non-students to their correct portal
    if (isAdmin(payload))    return NextResponse.redirect(url('/admin'))
    if (isAssessor(payload)) return NextResponse.redirect(url('/assessor'))
    if (isTeacher(payload))  return NextResponse.redirect(url('/teacher'))
  }

  // ── /profile/* & /notifications/* ───────────────────────────────
  if (pathname.startsWith('/profile') || pathname.startsWith('/notifications')) {
    if (!authed) return NextResponse.redirect(url('/login'))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/assessor/:path*',
    '/teacher/:path*',
    '/portal/:path*',
    '/profile/:path*',
    '/notifications/:path*',
  ],
}
