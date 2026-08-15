import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkLock, generateAndStoreOtp, getResendInfo } from '@/lib/otp'
import { sendOtpEmail } from '@/lib/mailer'
import { logAudit } from '@/lib/audit'

export async function POST(request) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 })
  }

  const lockedSeconds = await checkLock(email)
  if (lockedSeconds) return NextResponse.json({ error: 'locked', lockedSeconds }, { status: 429 })

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })
  if (!user) return NextResponse.json({ error: 'Email address not found.' }, { status: 404 })

  const { resendCount, canResend } = await getResendInfo(email)
  if (!canResend) {
    const lockSecs = await checkLock(email)
    return NextResponse.json({ error: 'locked', lockedSeconds: lockSecs || 900 }, { status: 429 })
  }

  const existingInfo = resendCount > 0 ? { resendCount } : null
  const { otp, locked } = await generateAndStoreOtp(email, existingInfo)

  try {
    await sendOtpEmail(email, otp)
  } catch (err) {
    console.error('OTP email failed:', err)
    return NextResponse.json({ error: 'Failed to send OTP email. Please try again.' }, { status: 500 })
  }

  logAudit({ actorId: user.id, actorName: user.name, actorRole: 'user', action: 'user.password_reset_requested', entity: 'User', entityId: user.id, meta: { email } })
  return NextResponse.json({ ok: true, resendCount: existingInfo ? existingInfo.resendCount + 1 : 0, locked })
}
