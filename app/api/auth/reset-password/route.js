import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'
import { signToken } from '@/lib/auth'
import { clearSession } from '@/lib/otp'

const COMMON_PASSWORDS = [
  'password123', 'admin123', 'welcome123', 'letmein123', 'qwerty123',
  'abc123456', 'password1', 'iloveyou1', 'sunshine1', 'monkey123',
]

const PWD_RULES = [
  { test: p => p.length >= 12,           msg: 'Password must be at least 12 characters.' },
  { test: p => /[A-Z]/.test(p),          msg: 'Password must contain at least one uppercase letter.' },
  { test: p => /[a-z]/.test(p),          msg: 'Password must contain at least one lowercase letter.' },
  { test: p => /[0-9]/.test(p),          msg: 'Password must contain at least one number.' },
  { test: p => /[^a-zA-Z0-9]/.test(p),  msg: 'Password must contain at least one special character.' },
  { test: p => !/\s/.test(p),            msg: 'Password must not contain spaces.' },
]

export async function POST(request) {
  const { email, password, confirmPassword } = await request.json()

  if (!email || !password || !confirmPassword) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 })
  }

  for (const rule of PWD_RULES) {
    if (!rule.test(password)) return NextResponse.json({ error: rule.msg }, { status: 400 })
  }

  const emailLower = email.toLowerCase()
  const emailLocal = emailLower.split('@')[0]
  if (password.toLowerCase().includes(emailLocal)) {
    return NextResponse.json({ error: 'Password must not contain your email address.' }, { status: 400 })
  }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return NextResponse.json({ error: 'Password is too common. Please choose a stronger password.' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: emailLower, mode: 'insensitive' } },
    include: { role: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

  if (user.password && verifyPassword(password, user.password)) {
    return NextResponse.json({ error: 'New password cannot be the same as your current password.' }, { status: 400 })
  }

  const history = user.passwordHistory || []
  for (const oldHash of history) {
    if (verifyPassword(password, oldHash)) {
      return NextResponse.json({ error: 'Password cannot be reused. Choose a password you have not used before.' }, { status: 400 })
    }
  }

  const newHistory = [user.password, ...history].filter(Boolean).slice(0, 5)
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { password: hashPassword(password), passwordHistory: newHistory, forcePasswordReset: false },
    include: { role: true },
  })

  await clearSession(email)

  const permissions = updated.role?.permissions || []
  const hasAdminAccess = permissions.some(p => !['access_student_portal', 'access_assessor_portal', 'access_teacher_portal'].includes(p))
  const isAssessor     = permissions.includes('access_assessor_portal') && !hasAdminAccess
  const isTeacher      = permissions.includes('access_teacher_portal')  && !hasAdminAccess
  const redirect = hasAdminAccess ? '/admin' : isAssessor ? '/assessor' : isTeacher ? '/teacher' : '/portal'

  const token = signToken({ userId: updated.id, roleId: updated.roleId, name: updated.name })
  const response = NextResponse.json({ ok: true, redirect })
  response.cookies.set('ga-admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return response
}
