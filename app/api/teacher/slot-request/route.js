import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/lib/guard'
import { sendSlotRequestNotification } from '@/lib/mailer'
import { logAudit } from '@/lib/audit'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']

const REQUIRED_TOTAL = 8
const VALID_SLOT_SET = new Set(Array.from({ length: 15 }, (_, i) => 540 + i * 60))

function validateSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return 'Invalid schedule format'
  const VALID_DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
  let total = 0
  for (const day of VALID_DAYS) {
    const slots = schedule[day]
    if (!slots) continue
    if (!Array.isArray(slots)) return 'Invalid schedule format'
    for (const slot of slots) {
      if (!VALID_SLOT_SET.has(Number(slot))) return `Invalid slot time: ${slot}. Slots must be on the hour between 9:00 AM and 11:00 PM`
    }
    total += slots.length
  }
  if (total < REQUIRED_TOTAL) return `Schedule must have at least ${REQUIRED_TOTAL} slots (currently has ${total})`
  return null
}

export async function GET() {
  const payload = await requireTeacher()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const requests = await prisma.slotRequest.findMany({
    where: { assessorId: payload.userId, requestorType: 'teacher' },
    orderBy: { createdAt: 'desc' },
  })

  const mapped = requests.map(r => ({
    id: r.id,
    assessorId: r.assessorId,
    requestorType: r.requestorType,
    currentSchedule: r.currentSchedule,
    proposedSchedule: r.proposedSchedule,
    reason: r.reason,
    status: r.status,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    resolvedByName: r.resolvedByName,
  }))

  return NextResponse.json({ requests: mapped })
}

export async function POST(req) {
  const payload = await requireTeacher()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { proposedSchedule, reason } = body

  const err = validateSchedule(proposedSchedule)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  if (!reason || !reason.trim()) {
    return NextResponse.json({ error: 'A reason is required for schedule change requests' }, { status: 400 })
  }

  const hasPending = await prisma.slotRequest.findFirst({
    where: { assessorId: payload.userId, requestorType: 'teacher', status: 'pending' },
  })
  if (hasPending) {
    return NextResponse.json(
      { error: 'You already have a pending request. Wait for it to be resolved before submitting a new one.' },
      { status: 409 },
    )
  }

  const currentTemplate = await prisma.scheduleTemplate.findUnique({
    where: { userId_type: { userId: payload.userId, type: 'teacher' } },
  })

  const request = await prisma.slotRequest.create({
    data: {
      assessorId: payload.userId,
      requestorType: 'teacher',
      currentSchedule: currentTemplate?.schedule ?? null,
      proposedSchedule,
      reason: reason.trim(),
      status: 'pending',
    },
  })

  await prisma.notification.create({
    data: {
      recipientType: 'admin',
      recipientId: null,
      type: 'slot_request',
      title: 'New Schedule Change Request',
      body: `${payload.name} (teacher) has submitted a schedule change request.`,
      meta: { requestId: request.id, assessorId: payload.userId, assessorName: payload.name, requestorType: 'teacher' },
    },
  })

  try {
    const ADMIN_ONLY_SET = new Set(ADMIN_ONLY_PERMS)
    const allUsers = await prisma.user.findMany({ include: { role: true } })
    const adminUsers = allUsers.filter(u => {
      const perms = u.role?.permissions || []
      return perms.some(p => !ADMIN_ONLY_SET.has(p))
    })
    const baseUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    for (const admin of adminUsers) {
      if (admin.email) {
        await sendSlotRequestNotification({
          to: admin.email,
          type: 'new_request',
          assessorName: payload.name,
          requestId: request.id,
          baseUrl,
        }).catch(e => console.error('[teacher slot-request email]', e.message))
      }
    }
  } catch (e) {
    console.error('[teacher slot-request notify admins]', e.message)
  }

  logAudit({
    actorId: payload.userId,
    actorName: payload.name,
    actorRole: 'teacher',
    action: 'slot_request.submitted',
    entity: 'SlotRequest',
    entityId: request.id,
    meta: { reason: request.reason, requestorType: 'teacher' },
  })

  return NextResponse.json({
    request: {
      id: request.id,
      assessorId: request.assessorId,
      requestorType: request.requestorType,
      currentSchedule: request.currentSchedule,
      proposedSchedule: request.proposedSchedule,
      reason: request.reason,
      status: request.status,
      adminNote: request.adminNote,
      createdAt: request.createdAt.toISOString(),
      resolvedAt: null,
    },
  })
}
