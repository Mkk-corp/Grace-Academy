import { NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/db'
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

  // Password rules
  for (const rule of PWD_RULES) {
    if (!rule.test(password)) {
      return NextResponse.json({ error: rule.msg }, { status: 400 })
    }
  }

  const emailLower = email.toLowerCase()

  // Must not contain email local-part
  const emailLocal = emailLower.split('@')[0]
  if (password.toLowerCase().includes(emailLocal)) {
    return NextResponse.json({ error: 'Password must not contain your email address.' }, { status: 400 })
  }

  // Must not be a common password
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return NextResponse.json({ error: 'Password is too common. Please choose a stronger password.' }, { status: 400 })
  }

  const users = readData('users.json')
  const idx = users.findIndex(u => u.email?.toLowerCase() === emailLower)
  if (idx === -1) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }
  const user = users[idx]

  // Must not match current password
  if (user.password && verifyPassword(password, user.password)) {
    return NextResponse.json({ error: 'New password cannot be the same as your current password.' }, { status: 400 })
  }

  // Must not match last 5 passwords
  const history = user.passwordHistory || []
  for (const oldHash of history) {
    if (verifyPassword(password, oldHash)) {
      return NextResponse.json({ error: 'Password cannot be reused. Choose a password you have not used before.' }, { status: 400 })
    }
  }

  // Build updated history (keep last 5)
  const newHistory = [user.password, ...history].filter(Boolean).slice(0, 5)
  const newHash = hashPassword(password)

  users[idx] = {
    ...user,
    password: newHash,
    passwordHistory: newHistory,
    forcePasswordReset: false,
    updatedAt: new Date().toISOString(),
  }
  writeData('users.json', users)

  // Clear OTP session
  clearSession(email)

  // Auto-login
  const roles = readData('roles.json')
  const userRole = roles.find(r => r.id === users[idx].roleId)
  const permissions = userRole?.permissions || []
  const hasAdminAccess = permissions.some(p => p !== 'access_student_portal')
  const redirect = hasAdminAccess ? '/admin' : '/portal'

  const token = signToken({ userId: users[idx].id, roleId: users[idx].roleId, name: users[idx].name })
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
