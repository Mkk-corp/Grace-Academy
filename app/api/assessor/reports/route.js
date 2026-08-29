import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { sendAssessmentReportEmail } from '@/lib/mailer'

async function getAuthPayload() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const p = verifyToken(token)
  return p?.userId ? p : null
}

// Is it currently within the write window? (session start → midnight same day)
function isReportOpen(date, slotMin) {
  const [y, mo, d] = date.split('-').map(Number)
  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const sessionStart = new Date(y, mo - 1, d, h, m, 0)
  const midnight     = new Date(y, mo - 1, d + 1, 0, 0, 0)
  const now = Date.now()
  return now >= sessionStart.getTime() && now < midnight.getTime()
}

// Has the session started at all? (for determining if a report is overdue)
function sessionHasStarted(date, slotMin) {
  const [y, mo, d] = date.split('-').map(Number)
  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  return Date.now() >= new Date(y, mo - 1, d, h, m, 0).getTime()
}

function slotMinToTime(slotMin) {
  const h    = Math.floor(slotMin / 60)
  const m    = slotMin % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function fmtDate(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch { return dateStr }
}

export async function GET(req) {
  const payload = await getAuthPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const debug = new URL(req.url).searchParams.get('debug') === '1'

  // Fetch ALL bookings for this assessor (no status filter) for diagnostics
  const allBookings = debug
    ? await prisma.booking.findMany({
        where: { assessorId: payload.userId },
        include: { report: true },
        orderBy: [{ date: 'desc' }, { slotMin: 'desc' }],
      })
    : null

  const bookings = await prisma.booking.findMany({
    where: { assessorId: payload.userId, status: 'confirmed' },
    include: { report: true },
    orderBy: [{ date: 'desc' }, { slotMin: 'desc' }],
  })

  // pending = any session that has started and has no report (window may be open or closed)
  const pendingRaw = bookings.filter(b => !b.report && sessionHasStarted(b.date, b.slotMin))
  // attach windowOpen flag so the UI knows if the form is still writable
  const pending = pendingRaw.map(b => ({ ...b, windowOpen: isReportOpen(b.date, b.slotMin) }))

  const submitted = bookings.filter(b => b.report)

  if (debug) {
    const now = new Date()
    return NextResponse.json({
      debug: {
        userId: payload.userId,
        serverTime: now.toISOString(),
        serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        totalAllStatuses: allBookings.length,
        totalConfirmed: bookings.length,
        allBookingsSummary: allBookings.map(b => ({
          id: b.id,
          status: b.status,
          date: b.date,
          slotMin: b.slotMin,
          slotTime: slotMinToTime(b.slotMin),
          hasReport: !!b.report,
          sessionHasStarted: sessionHasStarted(b.date, b.slotMin),
          windowOpen: isReportOpen(b.date, b.slotMin),
        })),
      },
      pending,
      submitted,
    })
  }

  return NextResponse.json({ pending, submitted })
}

export async function POST(req) {
  const payload = await getAuthPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId, feedback, feedbackAr, englishLevel, suggestedCourse } = await req.json()

  if (!bookingId)                { return NextResponse.json({ error: 'Booking ID required' },                        { status: 400 }) }
  if (!feedback?.trim())         { return NextResponse.json({ error: 'English feedback is required' },               { status: 400 }) }
  if (feedback.trim().length < 50) { return NextResponse.json({ error: 'English feedback must be at least 50 characters' }, { status: 400 }) }
  if (!englishLevel)             { return NextResponse.json({ error: 'English level is required' },                  { status: 400 }) }
  if (!suggestedCourse?.trim())  { return NextResponse.json({ error: 'Suggested course is required' },               { status: 400 }) }

  const VALID_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  if (!VALID_LEVELS.includes(englishLevel)) {
    return NextResponse.json({ error: 'Invalid English level' }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { report: true } })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.assessorId !== payload.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (booking.report) return NextResponse.json({ error: 'Report already submitted' }, { status: 409 })
  if (!isReportOpen(booking.date, booking.slotMin)) return NextResponse.json({ error: 'Report window is not open for this session' }, { status: 400 })

  const report = await prisma.assessmentReport.create({
    data: {
      bookingId,
      assessorId:     booking.assessorId,
      studentId:      booking.studentId,
      studentName:    booking.studentName,
      studentEmail:   booking.studentEmail,
      assessorName:   booking.assessorName,
      date:           booking.date,
      slotMin:        booking.slotMin,
      feedback:       feedback.trim(),
      feedbackAr:     feedbackAr?.trim() || '',
      englishLevel,
      suggestedCourse: suggestedCourse.trim(),
    },
  })

  logAudit({
    actorId: payload.userId, actorName: payload.name, actorRole: 'assessor',
    action: 'report.submitted', entity: 'AssessmentReport', entityId: report.id,
    meta: { studentName: booking.studentName, date: booking.date, englishLevel, suggestedCourse },
  })

  // Send email to student (non-blocking)
  sendAssessmentReportEmail({
    to:             booking.studentEmail,
    studentName:    booking.studentName,
    assessorName:   booking.assessorName,
    date:           fmtDate(booking.date),
    englishLevel,
    suggestedCourse: suggestedCourse.trim(),
    feedbackEn:     feedback.trim(),
    feedbackAr:     feedbackAr?.trim() || '',
  }).catch(err => console.error('[mailer] report email failed:', err))

  // Create in-app notification for the assessor confirming submission
  prisma.notification.create({
    data: {
      recipientType: 'user',
      recipientId:   booking.assessorId,
      type:          'report_submitted',
      title:         'Report Submitted Successfully',
      body:          `Your assessment report for ${booking.studentName} (${englishLevel}) has been submitted and sent to the student.`,
      meta:          { level: englishLevel, course: suggestedCourse.trim(), studentName: booking.studentName },
      read:          false,
    },
  }).catch(err => console.error('[notification] report_submitted failed:', err))

  return NextResponse.json({ report }, { status: 201 })
}

export async function PUT(req) {
  const payload = await getAuthPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, feedback, feedbackAr, englishLevel, suggestedCourse } = await req.json()
  if (!id) return NextResponse.json({ error: 'Report ID required' }, { status: 400 })

  const existing = await prisma.assessmentReport.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  if (existing.assessorId !== payload.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const VALID_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  if (englishLevel && !VALID_LEVELS.includes(englishLevel)) {
    return NextResponse.json({ error: 'Invalid English level' }, { status: 400 })
  }

  const data = {}
  if (feedback?.trim())        data.feedback        = feedback.trim()
  if (feedbackAr?.trim())      data.feedbackAr      = feedbackAr.trim()
  if (englishLevel)            data.englishLevel    = englishLevel
  if (suggestedCourse?.trim()) data.suggestedCourse = suggestedCourse.trim()

  const report = await prisma.assessmentReport.update({ where: { id }, data })

  logAudit({
    actorId: payload.userId, actorName: payload.name, actorRole: 'assessor',
    action: 'report.updated', entity: 'AssessmentReport', entityId: id,
    meta: { fields: Object.keys(data) },
  })

  return NextResponse.json({ report })
}
