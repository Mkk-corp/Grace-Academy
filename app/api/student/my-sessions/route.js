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

  const sessions = await prisma.booking.findMany({
    where: { studentId: payload.userId, status: 'confirmed' },
    orderBy: [{ date: 'asc' }, { slotMin: 'asc' }],
    select: {
      id: true,
      date: true,
      slotMin: true,
      meetLink: true,
      assessorName: true,
      studentName: true,
      status: true,
    },
  })

  return NextResponse.json({ sessions })
}
