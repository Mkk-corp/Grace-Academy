import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  return token ? verifyToken(token) : null
}

export async function GET(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page      = Math.max(1, parseInt(searchParams.get('page')  || '1', 10))
  const limit     = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)))
  const actorRole = searchParams.get('actorRole') || ''
  const action    = searchParams.get('action')    || ''
  const search    = searchParams.get('search')    || ''
  const dateFrom  = searchParams.get('dateFrom')  || ''
  const dateTo    = searchParams.get('dateTo')    || ''

  const where = {}
  if (actorRole) where.actorRole = actorRole
  if (action)    where.action    = { contains: action, mode: 'insensitive' }
  if (search)    where.OR = [
    { actorName: { contains: search, mode: 'insensitive' } },
    { action:    { contains: search, mode: 'insensitive' } },
    { entity:    { contains: search, mode: 'insensitive' } },
  ]
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo)   where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({ logs, total, page, limit, pages: Math.ceil(total / limit) })
}
