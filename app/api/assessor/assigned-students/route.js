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

  const bookings = await prisma.booking.findMany({
    where: { assessorId, status: 'confirmed' },
    include: {
      student: {
        select: {
          id: true, name: true, email: true, phone: true, dob: true, gender: true,
          country: true, city: true, avatar: true,
          educationLevel: true, coursesTaken: true, expectedLevel: true,
          isEmployed: true, jobTitle: true, employer: true, createdAt: true,
        },
      },
    },
    orderBy: [{ date: 'asc' }, { slotMin: 'asc' }],
  })

  // Deduplicate students, attach their soonest upcoming session
  const studentsMap = new Map()
  bookings.forEach(b => {
    if (!studentsMap.has(b.studentId)) {
      studentsMap.set(b.studentId, {
        ...b.student,
        sessionDate: b.date,
        sessionSlotMin: b.slotMin,
        sessionMeetLink: b.meetLink,
        bookingId: b.id,
      })
    }
  })

  return NextResponse.json({ students: [...studentsMap.values()] })
}
