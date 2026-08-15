import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendPlacementEmail } from '@/lib/mailer'
import { randomBytes } from 'crypto'

const DOW_TO_KEY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function dateToDayKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return DOW_TO_KEY[d.getDay()]
}

function slotMinToTime(slotMin) {
  const h    = Math.floor(slotMin / 60)
  const m    = slotMin % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function generateMeetingUrl() {
  const roomId = randomBytes(16).toString('hex')
  return `https://meet.jit.si/grace-academy-${roomId}`
}

export async function POST(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('ga-admin')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const student = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const todayStr = new Date().toLocaleDateString('en-CA')
    const existingBooking = await prisma.booking.findFirst({
      where: { studentId: student.id, status: 'confirmed', date: { gte: todayStr } },
    })
    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a confirmed placement session.', code: 'already_booked' },
        { status: 409 },
      )
    }

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const { date, slotMin } = body
    if (!date || slotMin == null) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const slot   = Number(slotMin)
    const dayKey = dateToDayKey(date)

    const [templates, pendingRequests] = await Promise.all([
      prisma.scheduleTemplate.findMany({ select: { userId: true, schedule: true } }),
      prisma.slotRequest.findMany({ where: { status: 'pending' }, select: { assessorId: true } }),
    ])

    const pendingAssessorIds = new Set(pendingRequests.map(r => r.assessorId))

    const bookedAtSlot = await prisma.booking.findMany({
      where: { status: 'confirmed', date, slotMin: slot },
      select: { assessorId: true },
    })
    const bookedIds = new Set(bookedAtSlot.map(b => b.assessorId))

    const available = templates.filter(({ userId: assessorId, schedule }) => {
      if (pendingAssessorIds.has(assessorId)) return false
      const slots = schedule[dayKey] || []
      return slots.map(Number).includes(slot) && !bookedIds.has(assessorId)
    })

    if (available.length === 0) {
      return NextResponse.json(
        { error: 'No assessors available at this slot. Please choose a different time.', code: 'slot_unavailable' },
        { status: 409 },
      )
    }

    const chosen     = available[Math.floor(Math.random() * available.length)]
    const assessorId = chosen.userId

    const assessorUser  = await prisma.user.findUnique({ where: { id: assessorId } }).catch(() => null)
    const assessorEmail = assessorUser?.email || ''
    const assessorName  = assessorUser?.name  || 'Academic Consultant'

    const meetLink = generateMeetingUrl()

    const booking = await prisma.booking.create({
      data: {
        studentId:    student.id,
        studentName:  student.name,
        studentEmail: student.email,
        assessorId,
        assessorName,
        assessorEmail,
        date,
        dayKey,
        slotMin:   slot,
        meetLink,
        status:    'confirmed',
      },
    })

    const timeStr   = slotMinToTime(slot)
    const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    // Confirmation emails — no meet link (link is sent in the 5-min reminder instead)
    sendPlacementEmail({ to: student.email,  role: 'student',  studentName: student.name, assessorName, date: dateLabel, time: timeStr })
      .catch(err => console.error('[mailer] student placement email failed:', err?.message))
    sendPlacementEmail({ to: assessorEmail,   role: 'assessor', studentName: student.name, assessorName, date: dateLabel, time: timeStr })
      .catch(err => console.error('[mailer] assessor placement email failed:', err?.message))

    // In-app notifications — meetLink is included here so it surfaces in the notification centre
    prisma.notification.createMany({
      data: [
        {
          recipientType: 'user',
          recipientId:   assessorId,
          type:          'placement_booked',
          title:         'New Placement Assessment Booked',
          body:          `A new session with ${student.name} is confirmed for ${dateLabel} at ${timeStr}. Your meeting link is ready — it will also be sent in your reminder 5 min before.`,
          meta:          { date: dateLabel, time: timeStr, studentName: student.name, meetLink, bookingId: booking.id },
        },
        {
          recipientType: 'user',
          recipientId:   student.id,
          type:          'placement_booked',
          title:         'Placement Session Confirmed',
          body:          `Your placement assessment with ${assessorName} is confirmed for ${dateLabel} at ${timeStr}. Your meeting link will be sent in your reminder 5 min before the session.`,
          meta:          { date: dateLabel, time: timeStr, assessorName, meetLink, bookingId: booking.id },
        },
      ],
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      booking: { id: booking.id, date: dateLabel, time: timeStr },
    })
  } catch (err) {
    console.error('[placement/book] unexpected error:', err?.message)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
