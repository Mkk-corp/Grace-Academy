import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

  return { ...user, permissions, hasAdminAccess }
}

function buildWhereForUser(user) {
  return {
    OR: [
      { recipientType: 'user', recipientId: user.id },
      ...(user.hasAdminAccess ? [{ recipientType: 'admin' }] : []),
    ],
  }
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: buildWhereForUser(user),
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const mapped = notifications.map(n => ({
    id: n.id,
    recipientType: n.recipientType,
    recipientId: n.recipientId,
    type: n.type,
    title: n.title,
    body: n.body,
    meta: n.meta,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }))

  return NextResponse.json({ notifications: mapped, unreadCount: mapped.filter(n => !n.read).length })
}

export async function PUT(req) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, all } = body

  if (all) {
    await prisma.notification.updateMany({
      where: { ...buildWhereForUser(user), read: false },
      data: { read: true },
    })
    return NextResponse.json({ success: true })
  }

  if (id) {
    const notif = await prisma.notification.findUnique({ where: { id } })
    if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isMine =
      (notif.recipientType === 'user' && notif.recipientId === user.id) ||
      (notif.recipientType === 'admin' && user.hasAdminAccess)
    if (!isMine) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.notification.update({ where: { id }, data: { read: true } })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Provide id or all:true' }, { status: 400 })
}
