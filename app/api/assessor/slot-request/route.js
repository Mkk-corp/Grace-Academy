import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendSlotRequestNotification } from '@/lib/mailer'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { role: true },
  })
  if (!user) return null

  const permissions = user.role?.permissions || []
  const hasAdminAccess = permissions.some(p => !ADMIN_ONLY_PERMS.includes(p))
  const isAssessor = permissions.includes('access_assessor_portal') && !hasAdminAccess

  return { ...user, permissions, hasAdminAccess, isAssessor }
}

const REQUIRED_TOTAL = 16
const VALID_SLOT_SET = new Set(Array.from({ length: 30 }, (_, i) => 540 + i * 30))

function validateSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return 'Invalid schedule format'
  const VALID_DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
  let total = 0
  for (const day of VALID_DAYS) {
    const slots = schedule[day]
    if (!slots) continue
    if (!Array.isArray(slots)) return 'Invalid schedule format'
    for (const slot of slots) {
      if (!VALID_SLOT_SET.has(Number(slot))) return `Invalid slot time: ${slot}. Slots must be between 9:00 AM and 11:30 PM`
    }
    total += slots.length
  }
  if (total < REQUIRED_TOTAL) return `Schedule must have at least ${REQUIRED_TOTAL} slots (currently has ${total})`
  return null
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const requests = await prisma.slotRequest.findMany({
    where: { assessorId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const mapped = requests.map(r => ({
    id: r.id,
    assessorId: r.assessorId,
    assessorName: user.name,
    assessorEmail: user.email,
    currentSchedule: r.currentSchedule,
    proposedSchedule: r.proposedSchedule,
    reason: r.reason,
    status: r.status,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
  }))

  return NextResponse.json({ requests: mapped })
}

export async function POST(req) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { proposedSchedule, reason } = body

  const err = validateSchedule(proposedSchedule)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  if (!reason || !reason.trim()) {
    return NextResponse.json({ error: 'A reason is required for schedule change requests' }, { status: 400 })
  }

  const hasPending = await prisma.slotRequest.findFirst({
    where: { assessorId: user.id, status: 'pending' },
  })
  if (hasPending) {
    return NextResponse.json(
      { error: 'You already have a pending request. Wait for it to be resolved before submitting a new one.' },
      { status: 409 },
    )
  }

  const currentTemplate = await prisma.scheduleTemplate.findUnique({ where: { userId: user.id } })

  const request = await prisma.slotRequest.create({
    data: {
      assessorId: user.id,
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
      body: `${user.name} has submitted a schedule change request.`,
      meta: { requestId: request.id, assessorId: user.id, assessorName: user.name },
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
          assessorName: user.name,
          requestId: request.id,
          baseUrl,
        }).catch(e => console.error('[slot-request email]', e.message))
      }
    }
  } catch (e) {
    console.error('[slot-request notify admins]', e.message)
  }

  return NextResponse.json({
    request: {
      id: request.id,
      assessorId: request.assessorId,
      assessorName: user.name,
      assessorEmail: user.email,
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
