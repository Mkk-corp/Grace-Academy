import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendSlotRequestNotification } from '@/lib/mailer'
import { logAudit } from '@/lib/audit'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']

async function getAdminUser() {
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
  if (!hasAdminAccess) return null

  return { ...user, permissions, hasAdminAccess }
}

function mapRequest(r) {
  return {
    id: r.id,
    assessorId: r.assessorId,
    assessorName: r.assessor?.name ?? '',
    assessorEmail: r.assessor?.email ?? '',
    currentSchedule: r.currentSchedule,
    proposedSchedule: r.proposedSchedule,
    reason: r.reason,
    status: r.status,
    adminNote: r.adminNote,
    resolvedById: r.resolvedById,
    resolvedByName: r.resolvedByName,
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
  }
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const requests = await prisma.slotRequest.findMany({
    include: { assessor: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ requests: requests.map(mapRequest) })
}

export async function PUT(req) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, action, adminNote } = body

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request: id and action (approve|reject) required' }, { status: 400 })
  }

  const request = await prisma.slotRequest.findUnique({
    where: { id },
    include: { assessor: { select: { name: true, email: true } } },
  })
  if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  if (request.status !== 'pending') return NextResponse.json({ error: 'Request is no longer pending' }, { status: 409 })

  const updated = await prisma.slotRequest.update({
    where: { id },
    data: {
      status: action === 'approve' ? 'approved' : 'rejected',
      adminNote: adminNote || null,
      resolvedAt: new Date(),
      resolvedById: admin.id,
      resolvedByName: admin.name,
    },
    include: { assessor: { select: { name: true, email: true } } },
  })

  if (action === 'approve') {
    await prisma.scheduleTemplate.upsert({
      where: { userId: request.assessorId },
      update: { schedule: request.proposedSchedule },
      create: { userId: request.assessorId, schedule: request.proposedSchedule },
    })

    // Check if the approved schedule now complies with current limits
    try {
      const cfg = await prisma.scheduleConfig.findUnique({ where: { id: 'default' } })
      const lim = cfg || { minDays: 2, maxDays: 5, minSlots: 4, maxSlots: 32 }
      const dm  = request.proposedSchedule || {}
      const totalSlots = Object.values(dm).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)
      const activeDays = Object.keys(dm).filter(k => Array.isArray(dm[k]) && dm[k].length > 0).length
      const compliant  = totalSlots >= lim.minSlots && totalSlots <= lim.maxSlots
                      && activeDays >= lim.minDays  && activeDays <= lim.maxDays
      if (compliant) {
        await prisma.notification.create({
          data: {
            recipientType: 'user',
            recipientId: request.assessorId,
            type: 'schedule_compliance_ok',
            title: 'Schedule Now Compliant',
            body: `Your updated schedule (${totalSlots} slots, ${activeDays} days) meets all current requirements. No further action needed.`,
            meta: { totalSlots, activeDays, ...lim },
          },
        })
      }
    } catch (e) {
      console.error('[slot-request approve] compliance check error:', e.message)
    }
  }

  await prisma.notification.create({
    data: {
      recipientType: 'user',
      recipientId: request.assessorId,
      type: 'slot_request_resolved',
      title: action === 'approve' ? 'Schedule Change Approved' : 'Schedule Change Rejected',
      body: action === 'approve'
        ? 'Your schedule change request has been approved. Your new schedule is now active.'
        : `Your schedule change request has been rejected.${adminNote ? ` Reason: ${adminNote}` : ''}`,
      meta: { requestId: id, action, adminNote: adminNote || null },
    },
  })

  try {
    const baseUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    if (request.assessor?.email) {
      await sendSlotRequestNotification({
        to: request.assessor.email,
        type: action === 'approve' ? 'approved' : 'rejected',
        assessorName: request.assessor.name,
        requestId: id,
        adminNote: adminNote || null,
        baseUrl,
      })
    }
  } catch (e) {
    console.error('[slot-request resolve email]', e.message)
  }

  logAudit({ actorId: admin.id, actorName: admin.name, actorRole: 'admin', action: `slot_request.${action}d`, entity: 'SlotRequest', entityId: id, meta: { assessorName: request.assessor?.name, assessorId: request.assessorId, adminNote: adminNote || null } })
  return NextResponse.json({ success: true, request: mapRequest(updated) })
}

export async function DELETE(req) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const target = await prisma.slotRequest.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  if (target.status === 'pending') return NextResponse.json({ error: 'Cannot delete a pending request' }, { status: 409 })

  await prisma.slotRequest.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
