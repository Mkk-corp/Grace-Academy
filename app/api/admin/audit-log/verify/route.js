import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signToken } from '@/lib/auth'

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}))
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  // Issue a short-lived audit access token (2 hours)
  const token = signToken({ audit: 1, iat: Math.floor(Date.now() / 1000) })
  const jar   = await cookies()
  jar.set('ga-audit', token, {
    httpOnly: true, sameSite: 'lax', path: '/',
    maxAge: 60 * 60 * 2,
    secure: process.env.NODE_ENV === 'production',
  })

  return NextResponse.json({ ok: true })
}
