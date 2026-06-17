import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { readData } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { checkLock, generateAndStoreOtp, getResendInfo } from '@/lib/otp'
import { sendOtpEmail } from '@/lib/mailer'

export async function POST(request) {
  const { identifier, password } = await request.json()

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Please enter your identifier and password' }, { status: 400 })
  }

  const id = identifier.toLowerCase().trim()
  const users = readData('users.json')

  const user = users.find(u =>
    u.username?.toLowerCase() === id ||
    u.email?.toLowerCase() === id ||
    u.phone?.replace(/\s+/g, '') === id.replace(/\s+/g, '')
  )

  // Admin-created users must set their own password on first login
  if (user && user.forcePasswordReset) {
    const lockedSeconds = checkLock(user.email)
    if (lockedSeconds) {
      return NextResponse.json({ error: 'locked', lockedSeconds }, { status: 429 })
    }
    const { resendCount, canResend } = getResendInfo(user.email)
    if (canResend) {
      const { otp } = generateAndStoreOtp(user.email, resendCount > 0 ? { resendCount } : null)
      try { await sendOtpEmail(user.email, otp) } catch (e) { console.error('OTP email failed:', e) }
    }
    return NextResponse.json({ forceReset: true, email: user.email })
  }

  if (!user || !user.password || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: 'Invalid credentials. Please check your details and try again.' }, { status: 401 })
  }

  const roles = readData('roles.json')
  const userRole = roles.find(r => r.id === user.roleId)
  const permissions = userRole?.permissions || []

  const hasAdminAccess    = permissions.some(p => p !== 'access_student_portal' && p !== 'access_assessor_portal')
  const isAssessor        = permissions.includes('access_assessor_portal') && !hasAdminAccess
  const redirect = hasAdminAccess ? '/admin' : isAssessor ? '/assessor' : '/portal'

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
}
