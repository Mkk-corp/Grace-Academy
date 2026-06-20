import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma, readContent, writeContent } from '@/lib/db'

function slotMinToTime(slotMin) {
  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
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

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.reminderSent) return NextResponse.json({ ok: true, alreadySent: true })

  await prisma.booking.update({ where: { id: bookingId }, data: { reminderSent: true } })

  const timeStr = slotMinToTime(booking.slotMin)
  const dateLabel = new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const meta = { date: dateLabel, time: timeStr, bookingId }

  const notifications = (await readContent('notifications')) || []
  const mkNotif = (recipientId) => ({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    recipientType: 'user',
    recipientId,
    type: 'placement_reminder',
    title: 'Session Starting Soon',
    body: `Your placement assessment starts in 3 minutes on ${dateLabel} at ${timeStr}.`,
    meta,
    read: false,
    createdAt: new Date().toISOString(),
  })
  notifications.push(mkNotif(booking.studentId))
  notifications.push(mkNotif(booking.assessorId))
  await writeContent('notifications', notifications)

  return NextResponse.json({ ok: true })
}
