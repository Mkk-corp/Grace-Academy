import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

async function getAuthPayload() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const p = verifyToken(token)
  return p?.userId ? p : null
}

// A session is "completed" if its start time is more than 30 minutes in the past
function isCompleted(date, slotMin) {
  const [y, mo, d] = date.split('-').map(Number)
  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const start = new Date(y, mo - 1, d, h, m, 0)
  return Date.now() - start.getTime() > 30 * 60 * 1000
}

export async function GET() {
  const payload = await getAuthPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { assessorId: payload.userId, status: 'confirmed' },
    include: { report: true },
    orderBy: [{ date: 'desc' }, { slotMin: 'desc' }],
  })

  const completed = bookings.filter(b => isCompleted(b.date, b.slotMin))
  const pending   = completed.filter(b => !b.report)
  const submitted = completed.filter(b =>  b.report)

  return NextResponse.json({ pending, submitted })
}

export async function POST(req) {
  const payload = await getAuthPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId, feedback, englishLevel, suggestedCourse } = await req.json()

  if (!bookingId || !feedback?.trim() || !englishLevel || !suggestedCourse?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const VALID_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  if (!VALID_LEVELS.includes(englishLevel)) {
    return NextResponse.json({ error: 'Invalid English level' }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { report: true } })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.assessorId !== payload.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (booking.report) return NextResponse.json({ error: 'Report already submitted' }, { status: 409 })
  if (!isCompleted(booking.date, booking.slotMin)) return NextResponse.json({ error: 'Session not yet completed' }, { status: 400 })

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
      englishLevel,
      suggestedCourse: suggestedCourse.trim(),
    },
  })

  logAudit({
    actorId: payload.userId, actorName: payload.name, actorRole: 'assessor',
    action: 'report.submitted', entity: 'AssessmentReport', entityId: report.id,
    meta: { studentName: booking.studentName, date: booking.date, englishLevel, suggestedCourse },
  })

  return NextResponse.json({ report }, { status: 201 })
}

export async function PUT(req) {
  const payload = await getAuthPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, feedback, englishLevel, suggestedCourse } = await req.json()
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
