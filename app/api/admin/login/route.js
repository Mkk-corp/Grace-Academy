import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { logAudit } from '@/lib/audit'

export async function POST(request) {
  const { identifier, password } = await request.json()
  if (!identifier || !password) {
    return NextResponse.json({ error: 'Identifier and password are required' }, { status: 400 })
  }

  const id = identifier.toLowerCase().trim()

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: { equals: id, mode: 'insensitive' } }, { username: { equals: id, mode: 'insensitive' } }] },
    include: { role: true },
  })

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null

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
    logAudit({ actorId: user.id, actorName: user.name, actorRole: 'admin', action: 'admin.login', entity: 'User', entityId: user.id, meta: { identifier: id }, ip })
    return response
  }

  // Fallback env-based super-admin
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
    logAudit({ actorName: id, actorRole: 'admin', action: 'admin.login', meta: { identifier: id, type: 'env_admin' }, ip })
    return response
  }

  logAudit({ actorRole: 'admin', action: 'admin.login_failed', meta: { identifier: id }, ip })
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
