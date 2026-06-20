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

  const userId = payload.userId
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA')
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const bookings = await prisma.booking.findMany({
    where: {
      status: 'confirmed',
      OR: [{ studentId: userId }, { assessorId: userId }],
    },
    orderBy: [{ date: 'asc' }, { slotMin: 'asc' }],
  })

  // Find the next booking that hasn't ended (session ends 30 min after start)
  const upcoming = bookings.find(b => {
    if (b.date > todayStr) return true
    if (b.date === todayStr) return b.slotMin >= nowMin - 30
    return false
  })

  if (!upcoming) return NextResponse.json({ booking: null })

  return NextResponse.json({
    booking: {
      id: upcoming.id,
      date: upcoming.date,
      slotMin: upcoming.slotMin,
      meetLink: upcoming.meetLink,
      studentName: upcoming.studentName,
      assessorName: upcoming.assessorName,
      reminderSent: upcoming.reminderSent,
    },
  })
}
