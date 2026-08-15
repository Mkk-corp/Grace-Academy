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

const SCHEDULE_CONFIG_DEFAULTS = { minDays: 2, maxDays: 5, minSlots: 4, maxSlots: 32 }

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [template, configRow] = await Promise.all([
    prisma.scheduleTemplate.findUnique({ where: { userId: user.id } }),
    prisma.scheduleConfig.findUnique({ where: { id: 'default' } }),
  ])

  const config = configRow
    ? { minDays: configRow.minDays, maxDays: configRow.maxDays, minSlots: configRow.minSlots, maxSlots: configRow.maxSlots }
    : SCHEDULE_CONFIG_DEFAULTS

  return NextResponse.json({ schedule: template?.schedule ?? null, config })
}

export async function POST(req) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await prisma.scheduleTemplate.findUnique({ where: { userId: user.id } })
  if (existing) {
    return NextResponse.json({ error: 'Schedule already exists. Use the change request flow to modify it.' }, { status: 409 })
  }

  const body = await req.json()
  const { schedule } = body

  const err = validateSchedule(schedule)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  const template = await prisma.scheduleTemplate.create({
    data: { userId: user.id, schedule },
  })

  return NextResponse.json({
    success: true,
    data: {
      schedule: template.schedule,
      lockedAt: template.createdAt,
      assessorName: user.name,
      assessorEmail: user.email,
    },
  })
}
