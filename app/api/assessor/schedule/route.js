import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { readContent, writeContent } from '@/lib/db'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']

async function getAuthUser(req) {
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

function validateSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return 'Invalid schedule format'
  const VALID_DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
  const activeDays = VALID_DAYS.filter(d => Array.isArray(schedule[d]) && schedule[d].length > 0)
  if (activeDays.length < 4) return 'At least 4 days must have slots'
  for (const day of activeDays) {
    if (schedule[day].length < 4) return `${day} must have at least 4 slots`
  }
  return null
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const schedules = await readContent('schedules') || {}
  const entry = schedules[user.id] || null
  return NextResponse.json({ schedule: entry })
}

export async function POST(req) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const schedules = await readContent('schedules') || {}

  if (schedules[user.id]) {
    return NextResponse.json({ error: 'Schedule already exists. Use the change request flow to modify it.' }, { status: 409 })
  }

  const body = await req.json()
  const { schedule } = body

  const err = validateSchedule(schedule)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  schedules[user.id] = {
    schedule,
    lockedAt: new Date().toISOString(),
    assessorName: user.name,
    assessorEmail: user.email,
  }

  await writeContent('schedules', schedules)
  return NextResponse.json({ success: true, data: schedules[user.id] })
}
