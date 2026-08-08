import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']
const DEFAULTS = { minDays: 2, maxDays: 5, minSlots: 4, maxSlots: 32 }

async function getAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  if (!user) return null
  const permissions = user.role?.permissions || []
  return permissions.some(p => !ADMIN_ONLY_PERMS.includes(p)) ? user : null
}

export async function GET() {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await prisma.scheduleConfig.findUnique({ where: { id: 'default' } })
  const limits = config
    ? { minDays: config.minDays, maxDays: config.maxDays, minSlots: config.minSlots, maxSlots: config.maxSlots }
    : DEFAULTS

  return NextResponse.json({ limits })
}

export async function PUT(req) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const minDays  = parseInt(body.minDays,  10)
  const maxDays  = parseInt(body.maxDays,  10)
  const minSlots = parseInt(body.minSlots, 10)
  const maxSlots = parseInt(body.maxSlots, 10)

  if (isNaN(minDays) || isNaN(maxDays) || isNaN(minSlots) || isNaN(maxSlots)) {
    return NextResponse.json({ error: 'All values must be numbers' }, { status: 400 })
  }
  if (minDays < 1 || minDays > maxDays) return NextResponse.json({ error: 'minDays must be ≥ 1 and ≤ maxDays' }, { status: 400 })
  if (maxDays > 7)                      return NextResponse.json({ error: 'maxDays cannot exceed 7' }, { status: 400 })
  if (minSlots < 1 || minSlots > maxSlots) return NextResponse.json({ error: 'minSlots must be ≥ 1 and ≤ maxSlots' }, { status: 400 })

  const limits = { minDays, maxDays, minSlots, maxSlots }
  await prisma.scheduleConfig.upsert({
    where:  { id: 'default' },
    update: limits,
    create: { id: 'default', ...limits },
  })

  return NextResponse.json({ ok: true, limits })
}
