import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

const KEY = 'payment_methods'

async function requireAdmin() {
  const jar   = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  const perms = user?.role?.permissions || []
  const hasAdmin = perms.some(p => !['access_student_portal','access_assessor_portal','access_teacher_portal'].includes(p))
  return hasAdmin ? user : null
}

async function getMethods() {
  const row = await prisma.siteContent.findUnique({ where: { key: KEY } })
  return (row?.data?.methods) || []
}

export async function GET() {
  const methods = await getMethods()
  return NextResponse.json({ methods })
}

export async function POST(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const methods = await getMethods()
  if (methods.includes(name.trim())) return NextResponse.json({ error: 'Already exists' }, { status: 400 })
  const updated = [...methods, name.trim()]

  await prisma.siteContent.upsert({
    where:  { key: KEY },
    update: { data: { methods: updated } },
    create: { key: KEY, data: { methods: updated } },
  })
  return NextResponse.json({ ok: true, methods: updated })
}

export async function DELETE(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  const methods = await getMethods()
  const updated = methods.filter(m => m !== name)

  await prisma.siteContent.upsert({
    where:  { key: KEY },
    update: { data: { methods: updated } },
    create: { key: KEY, data: { methods: updated } },
  })
  return NextResponse.json({ ok: true, methods: updated })
}
