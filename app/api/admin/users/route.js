import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { sendAssessorWelcomeEmail } from '@/lib/mailer'
import { logAudit } from '@/lib/audit'

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  return token ? verifyToken(token) : null
}

const SAFE_SELECT = {
  id: true, name: true, username: true, email: true, phone: true,
  roleId: true, source: true, forcePasswordReset: true,
  avatar: true, googleId: true, createdAt: true, updatedAt: true,
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const users = await prisma.user.findMany({ select: SAFE_SELECT, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(users)
}

export async function POST(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, username, email, phone, password, roleId } = await request.json()

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Username, email and password required' }, { status: 400 })
  }

  const existingEmail = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })
  if (existingEmail) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const existingUsername = await prisma.user.findFirst({
    where: { username: { equals: username, mode: 'insensitive' } },
  })
  if (existingUsername) return NextResponse.json({ error: 'Username already taken' }, { status: 409 })

  const user = await prisma.user.create({
    data: {
      name: name || username,
      username,
      email,
      phone: phone || '',
      password: hashPassword(password),
      roleId: roleId || null,
      source: 'admin',
      forcePasswordReset: true,
    },
    select: SAFE_SELECT,
  })

  // Send welcome email if the assigned role is assessor / academic consultant
  // Awaited intentionally — serverless functions cut off fire-and-forget promises after response.
  if (roleId) {
    const role = await prisma.role.findUnique({ where: { id: roleId } }).catch(() => null)
    if (role?.name?.toLowerCase().includes('assessor') || role?.name?.toLowerCase().includes('academic consultant')) {
      await sendAssessorWelcomeEmail({
        to:       email,
        name:     name || username,
        username,
        password,
      }).catch(err => console.error('[mailer] welcome email failed:', err?.message))
    }
  }

  const admin = await requireAdmin()
  logAudit({ actorId: admin?.userId, actorName: admin?.name, actorRole: 'admin', action: 'user.created', entity: 'User', entityId: user.id, meta: { name: user.name, email: user.email, roleId: user.roleId } })
  return NextResponse.json(user, { status: 201 })
}

export async function PUT(request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, email, phone, roleId, password } = await request.json()

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const data = {}
  if (name     !== undefined) data.name   = name
  if (email    !== undefined) data.email  = email
  if (phone    !== undefined) data.phone  = phone
  if (roleId   !== undefined) data.roleId = roleId
  if (password) {
    data.password = hashPassword(password)
    data.forcePasswordReset = true
  }

  const user = await prisma.user.update({ where: { id }, data, select: SAFE_SELECT })
  logAudit({ actorId: admin?.userId, actorName: admin?.name, actorRole: 'admin', action: 'user.updated', entity: 'User', entityId: id, meta: { fields: Object.keys(data), targetName: existing.name } })
  return NextResponse.json(user)
}

export async function DELETE(request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // OtpSession is keyed by email with no FK — must be deleted manually
  await prisma.otpSession.deleteMany({ where: { email: user.email } })

  // Bookings have cascades but explicit delete ensures no FK violation on old rows
  await prisma.booking.deleteMany({ where: { OR: [{ studentId: id }, { assessorId: id }] } })

  // ScheduleTemplate, SlotRequest, Notification, AssessorPreference all cascade-delete with User
  await prisma.user.delete({ where: { id } })

  logAudit({ actorId: admin?.userId, actorName: admin?.name, actorRole: 'admin', action: 'user.deleted', entity: 'User', entityId: id, meta: { name: user.name, email: user.email } })
  return NextResponse.json({ ok: true })
}
