import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { readContent, writeContent } from '@/lib/db'
import { sendSlotRequestNotification } from '@/lib/mailer'

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

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allRequests = await readContent('slot-requests') || []
  const sorted = [...allRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return NextResponse.json({ requests: sorted })
}

export async function PUT(req) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, action, adminNote } = body

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request: id and action (approve|reject) required' }, { status: 400 })
  }

  const allRequests = await readContent('slot-requests') || []
  const idx = allRequests.findIndex(r => r.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

  const request = allRequests[idx]
  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'Request is no longer pending' }, { status: 409 })
  }

  allRequests[idx] = {
    ...request,
    status: action === 'approve' ? 'approved' : 'rejected',
    adminNote: adminNote || null,
    resolvedAt: new Date().toISOString(),
    resolvedBy: admin.id,
    resolvedByName: admin.name,
  }

  await writeContent('slot-requests', allRequests)

  // If approved: update the assessor's schedule
  if (action === 'approve') {
    const schedules = await readContent('schedules') || {}
    schedules[request.assessorId] = {
      ...(schedules[request.assessorId] || {}),
      schedule: request.proposedSchedule,
      updatedAt: new Date().toISOString(),
      updatedByRequest: id,
    }
    await writeContent('schedules', schedules)
  }

  // Create in-app notification for the assessor
  const notifications = await readContent('notifications') || []
  notifications.push({
    id: `notif_${Date.now()}`,
    recipientType: 'user',
    recipientId: request.assessorId,
    title: action === 'approve' ? 'Schedule Change Approved' : 'Schedule Change Rejected',
    body: action === 'approve'
      ? 'Your schedule change request has been approved. Your new schedule is now active.'
      : `Your schedule change request has been rejected.${adminNote ? ` Reason: ${adminNote}` : ''}`,
    type: 'slot_request_resolved',
    meta: { requestId: id, action, adminNote: adminNote || null },
    read: false,
    createdAt: new Date().toISOString(),
  })
  await writeContent('notifications', notifications)

  // Send email to assessor
  try {
    const baseUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    if (request.assessorEmail) {
      await sendSlotRequestNotification({
        to: request.assessorEmail,
        type: action === 'approve' ? 'approved' : 'rejected',
        assessorName: request.assessorName,
        requestId: id,
        adminNote: adminNote || null,
        baseUrl,
      })
    }
  } catch (e) {
    console.error('[slot-request resolve email]', e.message)
  }

  return NextResponse.json({ success: true, request: allRequests[idx] })
}

export async function DELETE(req) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const allRequests = await readContent('slot-requests') || []
  const target = allRequests.find(r => r.id === id)
  if (!target) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  if (target.status === 'pending') {
    return NextResponse.json({ error: 'Cannot delete a pending request' }, { status: 409 })
  }

  const updated = allRequests.filter(r => r.id !== id)
  await writeContent('slot-requests', updated)

  return NextResponse.json({ success: true })
}
