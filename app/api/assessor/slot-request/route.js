import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { readContent, writeContent } from '@/lib/db'
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

async function validateSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return 'Invalid schedule format'
  const raw = (await readContent('schedule_limits')) || {}
  const minDays  = raw.minDays  ?? 2
  const maxDays  = raw.maxDays  ?? 5
  const minSlots = raw.minSlots ?? 4
  const maxSlots = raw.maxSlots ?? 32
  const VALID_DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
  const activeDays = VALID_DAYS.filter(d => Array.isArray(schedule[d]) && schedule[d].length > 0)
  if (activeDays.length < minDays) return `At least ${minDays} days must have slots`
  if (activeDays.length > maxDays) return `At most ${maxDays} days can have slots`
  for (const day of activeDays) {
    if (schedule[day].length < minSlots) return `${day} must have at least ${minSlots} slots`
    if (schedule[day].length > maxSlots) return `${day} can have at most ${maxSlots} slots`
  }
  return null
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const allRequests = await readContent('slot-requests') || []
  const myRequests = allRequests
    .filter(r => r.assessorId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return NextResponse.json({ requests: myRequests })
}

export async function POST(req) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { proposedSchedule, reason } = body

  const err = await validateSchedule(proposedSchedule)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  if (!reason || !reason.trim()) {
    return NextResponse.json({ error: 'A reason is required for schedule change requests' }, { status: 400 })
  }

  const allRequests = await readContent('slot-requests') || []
  const hasPending = allRequests.some(r => r.assessorId === user.id && r.status === 'pending')
  if (hasPending) {
    return NextResponse.json({ error: 'You already have a pending request. Wait for it to be resolved before submitting a new one.' }, { status: 409 })
  }

  const schedules = await readContent('schedules') || {}
  const currentEntry = schedules[user.id]
  const currentSchedule = currentEntry?.schedule || null

  const newRequest = {
    id: `slotreq_${Date.now()}`,
    assessorId: user.id,
    assessorName: user.name,
    assessorEmail: user.email,
    currentSchedule,
    proposedSchedule,
    reason: reason.trim(),
    status: 'pending',
    adminNote: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  }

  allRequests.push(newRequest)
  await writeContent('slot-requests', allRequests)

  // Create in-app notification for admins
  const notifications = await readContent('notifications') || []
  notifications.push({
    id: `notif_${Date.now()}`,
    recipientType: 'admin',
    recipientId: null,
    title: 'New Schedule Change Request',
    body: `${user.name} has submitted a schedule change request.`,
    type: 'slot_request',
    meta: { requestId: newRequest.id, assessorId: user.id, assessorName: user.name },
    read: false,
    createdAt: new Date().toISOString(),
  })
  await writeContent('notifications', notifications)

  // Send email to all admin users
  try {
    const allUsers = await prisma.user.findMany({ include: { role: true } })
    const adminUsers = allUsers.filter(u => {
      const perms = u.role?.permissions || []
      return perms.some(p => !ADMIN_ONLY_PERMS.includes(p))
    })
    const baseUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    for (const admin of adminUsers) {
      if (admin.email) {
        await sendSlotRequestNotification({
          to: admin.email,
          type: 'new_request',
          assessorName: user.name,
          requestId: newRequest.id,
          baseUrl,
        }).catch(e => console.error('[slot-request email]', e.message))
      }
    }
  } catch (e) {
    console.error('[slot-request notify admins]', e.message)
  }

  return NextResponse.json({ request: newRequest })
}
