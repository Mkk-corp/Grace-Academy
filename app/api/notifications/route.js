import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { readContent, writeContent } from '@/lib/db'

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

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allNotifications = await readContent('notifications') || []

  const mine = allNotifications.filter(n =>
    (n.recipientType === 'user' && n.recipientId === user.id) ||
    (n.recipientType === 'admin' && user.hasAdminAccess)
  )

  const sorted = [...mine]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30)

  const unreadCount = sorted.filter(n => !n.read).length

  return NextResponse.json({ notifications: sorted, unreadCount })
}

export async function PUT(req) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, all } = body

  const allNotifications = await readContent('notifications') || []

  if (all) {
    // Mark all notifications for this user as read
    const updated = allNotifications.map(n => {
      const isMine =
        (n.recipientType === 'user' && n.recipientId === user.id) ||
        (n.recipientType === 'admin' && user.hasAdminAccess)
      if (isMine) return { ...n, read: true }
      return n
    })
    await writeContent('notifications', updated)
    return NextResponse.json({ success: true })
  }

  if (id) {
    const updated = allNotifications.map(n => {
      if (n.id !== id) return n
      // Only mark if it belongs to this user
      const isMine =
        (n.recipientType === 'user' && n.recipientId === user.id) ||
        (n.recipientType === 'admin' && user.hasAdminAccess)
      if (!isMine) return n
      return { ...n, read: true }
    })
    await writeContent('notifications', updated)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Provide id or all:true' }, { status: 400 })
}
