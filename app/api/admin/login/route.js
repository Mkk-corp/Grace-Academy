import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

export async function POST(request) {
  const { password } = await request.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }
  const token = signToken({ role: 'admin' })
  const response = NextResponse.json({ ok: true })
  response.cookies.set('ga-admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return response
}
