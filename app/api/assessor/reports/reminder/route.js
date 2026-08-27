import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function getAuthPayload() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const p = verifyToken(token)
  return p?.userId ? p : null
}

function isCompleted(date, slotMin) {
  const [y, mo, d] = date.split('-').map(Number)
  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const start = new Date(y, mo - 1, d, h, m, 0)
  return Date.now() - start.getTime() > 30 * 60 * 1000
}

// POST: called client-side each hour — creates a pending_report_reminder notification if needed
export async function POST() {
  const payload = await getAuthPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only remind between 01:00 and 23:59 (not at midnight)
  const hour = new Date().getHours()
  if (hour === 0) return NextResponse.json({ sent: false, count: 0 })

  const bookings = await prisma.booking.findMany({
    where: { assessorId: payload.userId, status: 'confirmed' },
    include: { report: true },
    select: { id: true, date: true, slotMin: true, report: true },
  })

  const pendingCount = bookings.filter(b => isCompleted(b.date, b.slotMin) && !b.report).length

  if (pendingCount === 0) return NextResponse.json({ sent: false, count: 0 })

  await prisma.notification.create({
    data: {
      recipientType: 'user',
      recipientId:   payload.userId,
      type:          'pending_report_reminder',
      title:         'Pending Reports Reminder',
      body:          `You have ${pendingCount} report${pendingCount !== 1 ? 's' : ''} awaiting submission. Please complete them before the end of the day.`,
      meta:          { count: pendingCount },
      read:          false,
    },
  })

  return NextResponse.json({ sent: true, count: pendingCount })
}
