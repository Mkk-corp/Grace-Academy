import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma, readContent } from '@/lib/db'

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  return token ? verifyToken(token) : null
}

export async function GET(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [bookingCount, schedules, slotRequests] = await Promise.all([
    prisma.booking.count({ where: { OR: [{ studentId: id }, { assessorId: id }] } }),
    readContent('schedules').then(v => v || {}),
    readContent('slot-requests').then(v => v || []),
  ])

  return NextResponse.json({
    bookingCount,
    hasSchedule:     Object.prototype.hasOwnProperty.call(schedules, id),
    hasSlotRequests: slotRequests.some(r => r.assessorId === id),
  })
}
