import { NextResponse } from 'next/server'
import { readData } from '@/lib/db'
import { checkLock, generateAndStoreOtp, getResendInfo } from '@/lib/otp'
import { sendOtpEmail } from '@/lib/mailer'

export async function POST(request) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 })
  }

  const lockedSeconds = checkLock(email)
  if (lockedSeconds) {
    return NextResponse.json({ error: 'locked', lockedSeconds }, { status: 429 })
  }

  const users = readData('users.json')
  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (!user) {
    return NextResponse.json({ error: 'Email address not found.' }, { status: 404 })
  }

  const { resendCount, canResend } = getResendInfo(email)
  if (!canResend) {
    const lockSecs = checkLock(email)
    return NextResponse.json(
      { error: 'locked', lockedSeconds: lockSecs || 900 },
      { status: 429 }
    )
  }

  const existingInfo = resendCount > 0 ? { resendCount } : null
  const { otp, locked } = generateAndStoreOtp(email, existingInfo)

  try {
    await sendOtpEmail(email, otp)
  } catch (err) {
    console.error('OTP email failed:', err)
    return NextResponse.json({ error: 'Failed to send OTP email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    resendCount: existingInfo ? existingInfo.resendCount + 1 : 0,
    locked,
  })
}
