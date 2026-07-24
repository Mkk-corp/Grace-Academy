import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma, readContent, writeContent } from '@/lib/db'
import { sendPlacementEmail } from '@/lib/mailer'

const DOW_TO_KEY = ['sun','mon','tue','wed','thu','fri','sat']

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

async function refreshAccessToken(assessorUser) {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: assessorUser.googleCalendarRefreshToken,
        grant_type:    'refresh_token',
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const newToken = data.access_token
    if (!newToken) return null
    await prisma.user.update({
      where: { id: assessorUser.id },
      data:  { googleCalendarAccessToken: newToken },
    })
    return newToken
  } catch {
    return null
  }
}

async function createMeetLink({ accessToken, date, slotMin, studentEmail, assessorEmail, studentName, assessorName }) {
  const h   = Math.floor(slotMin / 60)
  const min = slotMin % 60
  const startISO = `${date}T${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:00Z`
  const endISO   = new Date(new Date(startISO).getTime() + 30 * 60 * 1000).toISOString()
  const requestId = Date.now().toString(36) + Math.random().toString(36).slice(2)

  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary:     'Grace Academy Placement Assessment',
          description: `Placement assessment — ${studentName} with ${assessorName}`,
          start: { dateTime: startISO, timeZone: 'UTC' },
          end:   { dateTime: endISO,   timeZone: 'UTC' },
          attendees: [{ email: studentEmail }, { email: assessorEmail }],
          conferenceData: {
            createRequest: {
              requestId,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      }
    )
    if (!res.ok) return { meetLink: null, calEventId: null }
    const data = await res.json()
    return {
      meetLink:   data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri || null,
      calEventId: data.id || null,
    }
  } catch {
    return { meetLink: null, calEventId: null }
  }
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

    // Prevent duplicate bookings for the same student
    const existingBooking = await prisma.booking.findFirst({
      where: { studentId: student.id, status: 'confirmed' },
    })
    if (existingBooking) {
      return NextResponse.json({ error: 'You already have a confirmed placement session.' }, { status: 409 })
    }

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const { date, slotMin } = body
    if (!date || slotMin == null) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const slot = Number(slotMin)
    const dayKey = dateToDayKey(date)

    // Load schedules
    const schedules = (await readContent('schedules')) || {}

    // Assessors already confirmed at this date + slot
    const bookedAtSlot = await prisma.booking.findMany({
      where: { status: 'confirmed', date, slotMin: slot },
      select: { assessorId: true },
    })
    const bookedIds = new Set(bookedAtSlot.map(b => b.assessorId))

    // Find available assessors
    const available = Object.entries(schedules).filter(([id, data]) => {
      const slots = data.schedule?.[dayKey] || []
      return slots.map(Number).includes(slot) && !bookedIds.has(id)
    })

    if (available.length === 0) {
      return NextResponse.json({ error: 'No assessors available at this slot. Please choose a different time.' }, { status: 409 })
    }

    // Pick randomly
    const [assessorId, assessorData] = available[Math.floor(Math.random() * available.length)]

    const assessorUser = await prisma.user.findUnique({ where: { id: assessorId } }).catch(() => null)
    const assessorEmail = assessorData.assessorEmail || assessorUser?.email || ''
    const assessorName  = assessorData.assessorName  || assessorUser?.name  || 'Academic Consultant'

    // Try to create Google Meet link (with token refresh fallback)
    let meetLink   = null
    let calEventId = null
    if (assessorUser?.googleCalendarAccessToken) {
      const meetArgs = {
        accessToken:  assessorUser.googleCalendarAccessToken,
        date, slotMin: slot,
        studentEmail: student.email,
        assessorEmail,
        studentName:  student.name,
        assessorName,
      }
      ;({ meetLink, calEventId } = await createMeetLink(meetArgs))

      if (!meetLink && assessorUser.googleCalendarRefreshToken) {
        const refreshed = await refreshAccessToken(assessorUser)
        if (refreshed) {
          ;({ meetLink, calEventId } = await createMeetLink({ ...meetArgs, accessToken: refreshed }))
        }
      }
    }

    // Save booking to database
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
        calEventId,
        status:    'confirmed',
      },
    })

    const timeStr   = slotMinToTime(slot)
    const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    // Send emails (non-fatal)
    Promise.all([
      sendPlacementEmail({ to: student.email,  role: 'student',  studentName: student.name, assessorName, date: dateLabel, time: timeStr, meetLink }),
      sendPlacementEmail({ to: assessorEmail,   role: 'assessor', studentName: student.name, assessorName, date: dateLabel, time: timeStr, meetLink }),
    ]).catch(() => {})

    // In-app notification for assessor (non-fatal)
    readContent('notifications').then(list => {
      const notifications = list || []
      const notifId = Date.now().toString(36) + 'n' + Math.random().toString(36).slice(2)
      notifications.push({
        id:            notifId,
        recipientType: 'user',
        recipientId:   assessorId,
        type:          'placement_booked',
        title:         'New Placement Assessment Booked',
        body:          `A student has booked a placement session on ${dateLabel} at ${timeStr}.`,
        meta:          { date: dateLabel, time: timeStr, studentName: student.name, meetLink, bookingId: booking.id },
        read:          false,
        createdAt:     new Date().toISOString(),
      })
      return writeContent('notifications', notifications)
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      booking: { id: booking.id, date: dateLabel, time: timeStr, meetLink },
    })
  } catch (err) {
    console.error('[placement/book] unexpected error:', err?.message)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
