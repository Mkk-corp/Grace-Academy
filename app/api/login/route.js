import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

async function findUser(identifier) {
  const id = identifier.toLowerCase().trim()

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: { equals: id, mode: 'insensitive' } }, { username: { equals: id, mode: 'insensitive' } }] },
    include: { role: true },
  })
  if (user) return user

  // Phone fallback — normalize spaces
  const idNoSpaces = id.replace(/\s+/g, '')
  const candidates = await prisma.user.findMany({
    where: { phone: { not: '' } },
    include: { role: true },
  })
  return candidates.find(u => u.phone?.replace(/\s+/g, '') === idNoSpaces) || null
}

export async function POST(request) {
  try {
    const { identifier, password } = await request.json()
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Please enter your identifier and password' }, { status: 400 })
    }

    const user = await findUser(identifier)

    if (user?.forcePasswordReset) {
      // Do NOT send OTP here — the forgot-password page auto-sends it on mount
      // when redirected with ?mode=first-login, preventing double-send.
      return NextResponse.json({ forceReset: true, email: user.email })
    }

    if (!user || !user.password || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials. Please check your details and try again.' }, { status: 401 })
    }

    const permissions = user.role?.permissions || []
    const hasAdminAccess = permissions.some(p => !['access_student_portal', 'access_assessor_portal', 'access_teacher_portal'].includes(p))
    const isAssessor     = permissions.includes('access_assessor_portal') && !hasAdminAccess
    const isTeacher      = permissions.includes('access_teacher_portal')  && !hasAdminAccess
    const redirect = hasAdminAccess ? '/admin' : isAssessor ? '/assessor' : isTeacher ? '/teacher' : '/portal'

    const token = signToken({ userId: user.id, roleId: user.roleId, name: user.name })
    const response = NextResponse.json({ ok: true, redirect })
    response.cookies.set('ga-admin', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 })
  }
}
