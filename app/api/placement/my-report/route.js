import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

function isCompleted(date, slotMin) {
  const [y, mo, d] = date.split('-').map(Number)
  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const start = new Date(y, mo - 1, d, h, m, 0)
  return Date.now() - start.getTime() > 30 * 60 * 1000
}

// Returns the student's placement status + report (if any).
// status: 'none' | 'booked' | 'report_pending' | 'report_ready'
export async function GET() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { studentId: payload.userId, status: 'confirmed' },
    include: { report: true },
    orderBy: [{ date: 'desc' }, { slotMin: 'desc' }],
  })

  if (bookings.length === 0) {
    return NextResponse.json({ status: 'none', booking: null, report: null })
  }

  // A submitted report is always ready — regardless of the time threshold
  const withReport = bookings.find(b => !!b.report)
  if (withReport) {
    return NextResponse.json({ status: 'report_ready', booking: withReport, report: withReport.report })
  }

  // No report yet — use the 30-min threshold to distinguish pending vs upcoming
  const completed = bookings.filter(b => isCompleted(b.date, b.slotMin))
  if (completed.length > 0) {
    return NextResponse.json({ status: 'report_pending', booking: completed[0], report: null })
  }

  const upcoming = bookings.find(b => !isCompleted(b.date, b.slotMin))
  if (upcoming) {
    return NextResponse.json({ status: 'booked', booking: upcoming, report: null })
  }

  return NextResponse.json({ status: 'none', booking: null, report: null })
}
