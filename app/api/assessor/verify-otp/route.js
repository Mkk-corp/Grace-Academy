import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { verifyOtp } from '@/lib/otp'

export async function POST(request) {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, otp } = await request.json()
  if (!email || !otp) return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })

  const result = await verifyOtp(email, otp)
  if (!result.ok) {
    if (result.error === 'locked') {
      return NextResponse.json({ error: 'locked', lockedSeconds: result.lockedSeconds }, { status: 429 })
    }
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
