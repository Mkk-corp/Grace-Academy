import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assessorId = payload.userId

  const assessments = await prisma.booking.findMany({
    where: { assessorId, status: 'confirmed' },
    orderBy: [{ date: 'asc' }, { slotMin: 'asc' }],
  })

  return NextResponse.json({ assessments })
}
