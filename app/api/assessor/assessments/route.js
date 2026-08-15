import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

async function getAssessorId() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId ? payload : null
}

export async function GET() {
  const payload = await getAssessorId()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assessments = await prisma.booking.findMany({
    where: { assessorId: payload.userId, status: 'confirmed' },
    orderBy: [{ date: 'asc' }, { slotMin: 'asc' }],
  })

  return NextResponse.json({ assessments })
}

export async function PATCH(req) {
  const payload = await getAssessorId()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, recordingLink } = await req.json()
  if (!id) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.assessorId !== payload.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const link = recordingLink?.trim() || null
  const updated = await prisma.booking.update({
    where: { id },
    data: { recordingLink: link },
  })

  logAudit({
    actorId: payload.userId, actorName: payload.name, actorRole: 'assessor',
    action: 'booking.recording_added', entity: 'Booking', entityId: id,
    meta: { studentName: booking.studentName, date: booking.date, hasLink: !!link },
  })

  return NextResponse.json({ ok: true, recordingLink: updated.recordingLink })
}
