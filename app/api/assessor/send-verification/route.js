import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { checkLock, generateAndStoreOtp, getResendInfo } from '@/lib/otp'
import { sendVerificationEmail } from '@/lib/mailer'

export async function POST(request) {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await request.json()
  if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const lockedSeconds = checkLock(email)
  if (lockedSeconds) {
    return NextResponse.json({ error: 'locked', lockedSeconds }, { status: 429 })
  }

  const { resendCount, canResend } = getResendInfo(email)
  if (!canResend) {
    return NextResponse.json({ error: 'Too many attempts. Please wait before retrying.' }, { status: 429 })
  }

  const { otp } = generateAndStoreOtp(email, resendCount > 0 ? { resendCount } : null)

  try {
    await sendVerificationEmail(email, otp)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Verification email failed:', e)
    return NextResponse.json({ error: 'Failed to send verification email. Check your SMTP settings.' }, { status: 500 })
  }
}
