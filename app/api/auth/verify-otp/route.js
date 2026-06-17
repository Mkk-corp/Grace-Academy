import { NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp'

export async function POST(request) {
  const { email, otp } = await request.json()

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 })
  }

  const result = verifyOtp(email, otp.trim())
  if (!result.ok) {
    if (result.error === 'locked') {
      return NextResponse.json(
        { error: 'locked', lockedSeconds: result.lockedSeconds },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
