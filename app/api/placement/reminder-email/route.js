import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendPlacementReminderEmail } from '@/lib/mailer'

function slotMinToTime(slotMin) {
  const h    = Math.floor(slotMin / 60)
  const m    = slotMin % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export async function POST(req) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await req.json()
  if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })

  // Atomic: mark emailReminderSent only if it wasn't already sent
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.emailReminderSent) return NextResponse.json({ ok: true, skipped: true })

  await prisma.booking.update({
    where: { id: bookingId },
    data:  { emailReminderSent: true },
  })

  const timeStr   = slotMinToTime(booking.slotMin)
  const dateLabel = new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  Promise.all([
    sendPlacementReminderEmail({
      to: booking.studentEmail, role: 'student',
      studentName: booking.studentName, assessorName: booking.assessorName,
      date: dateLabel, time: timeStr, meetLink: booking.meetLink,
    }),
    sendPlacementReminderEmail({
      to: booking.assessorEmail, role: 'assessor',
      studentName: booking.studentName, assessorName: booking.assessorName,
      date: dateLabel, time: timeStr, meetLink: booking.meetLink,
    }),
  ]).catch(err => console.error('[mailer] reminder email failed:', err?.message))

  return NextResponse.json({ ok: true })
}
