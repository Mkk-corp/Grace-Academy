import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

const KEY = 'payroll_settings'

async function requireAdmin() {
  const jar   = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  const perms = user?.role?.permissions || []
  if (perms.some(p => ['access_student_portal','access_assessor_portal','access_teacher_portal'].includes(p)) && !perms.some(p => !['access_student_portal','access_assessor_portal','access_teacher_portal'].includes(p))) return null
  return user
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const row = await prisma.siteContent.findUnique({ where: { key: KEY } })
  const defaults = { placementPayPerSession: '', speakingPayPerSession: '', currency: 'USD' }
  return NextResponse.json(row ? { ...defaults, ...row.data } : defaults)
}

export async function PUT(req) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = {
    placementPayPerSession: body.placementPayPerSession ?? '',
    speakingPayPerSession:  body.speakingPayPerSession  ?? '',
    currency:               body.currency               ?? 'USD',
  }

  await prisma.siteContent.upsert({
    where:  { key: KEY },
    update: { data },
    create: { key: KEY, data },
  })

  return NextResponse.json({ ok: true })
}
