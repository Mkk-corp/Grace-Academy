import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'

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
