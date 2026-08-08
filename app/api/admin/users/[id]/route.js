import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  return token ? verifyToken(token) : null
}

export async function GET(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [bookingCount, schedule, pendingRequests] = await Promise.all([
    prisma.booking.count({ where: { OR: [{ studentId: id }, { assessorId: id }] } }),
    prisma.scheduleTemplate.findUnique({ where: { userId: id }, select: { id: true } }),
    prisma.slotRequest.count({ where: { assessorId: id, status: 'pending' } }),
  ])

  return NextResponse.json({
    bookingCount,
    hasSchedule:     !!schedule,
    hasSlotRequests: pendingRequests > 0,
  })
}
