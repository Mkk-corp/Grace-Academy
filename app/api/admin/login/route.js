import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { readData } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

export async function POST(request) {
  const { identifier, password } = await request.json()

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Identifier and password are required' }, { status: 400 })
  }

  const id = identifier.toLowerCase().trim()
  const users = readData('users.json')

  const user = users.find(u =>
    u.username?.toLowerCase() === id ||
    u.email?.toLowerCase() === id ||
    u.phone?.replace(/\s+/g, '') === id.replace(/\s+/g, '')
  )

  if (user && user.password && verifyPassword(password, user.password)) {
    const token = signToken({ userId: user.id, roleId: user.roleId, name: user.name })
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

  // Fallback for env-based super-admin (ADMIN_PASSWORD + ADMIN_USER)
  const adminUser = process.env.ADMIN_USER || 'admin'
  if (
    password === process.env.ADMIN_PASSWORD &&
    (id === adminUser.toLowerCase() || id === (process.env.ADMIN_EMAIL || '').toLowerCase())
  ) {
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

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
