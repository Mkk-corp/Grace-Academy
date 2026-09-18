import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'
import { logAudit } from '@/lib/audit'

export async function GET() {
  const plans = await prisma.plan.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ plans })
}

export async function POST(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.nameEn?.trim()) return NextResponse.json({ error: 'Plan name (English) is required' }, { status: 400 })
  if (!body?.country?.trim()) return NextResponse.json({ error: 'Country is required' }, { status: 400 })

  const plan = await prisma.plan.create({ data: sanitize(body) })
  logAudit({ actorId: admin.userId, actorName: admin.name, actorRole: 'admin', action: 'pricing.created', entity: 'Plan', entityId: plan.id, meta: { nameEn: plan.nameEn } })
  return NextResponse.json({ plan }, { status: 201 })
}

export async function PUT(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const existing = await prisma.plan.findUnique({ where: { id: body.id } })
  if (!existing) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const plan = await prisma.plan.update({ where: { id: body.id }, data: sanitize(body) })
  logAudit({ actorId: admin.userId, actorName: admin.name, actorRole: 'admin', action: 'pricing.updated', entity: 'Plan', entityId: body.id, meta: { nameEn: body.nameEn } })
  return NextResponse.json({ plan })
}

export async function DELETE(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const existing = await prisma.plan.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  await prisma.plan.delete({ where: { id } })
  logAudit({ actorId: admin.userId, actorName: admin.name, actorRole: 'admin', action: 'pricing.deleted', entity: 'Plan', entityId: id })
  return NextResponse.json({ ok: true })
}

function sanitize(b) {
  return {
    nameEn    : (b.nameEn     || '').trim(),
    nameAr    : (b.nameAr     || '').trim(),
    price     : (b.price      || '').trim(),
    currency  : (b.currency   || 'USD').trim(),
    durationEn: (b.durationEn || '').trim(),
    durationAr: (b.durationAr || '').trim(),
    country   : (b.country    || '').trim(),
    visible   : b.visible !== false,
    popular   : !!b.popular,
    badgeEn   : (b.badgeEn    || '').trim(),
    badgeAr   : (b.badgeAr    || '').trim(),
    descEn    : (b.descEn     || '').trim(),
    descAr    : (b.descAr     || '').trim(),
    ctaTextEn : (b.ctaTextEn  || 'Get Started').trim(),
    ctaTextAr : (b.ctaTextAr  || 'ابدأ الآن').trim(),
    ctaUrl    : (b.ctaUrl     || '/contact').trim(),
    benefits  : Array.isArray(b.benefits) ? b.benefits.map((bf, i) => ({
      id      : bf.id || String(i),
      textEn  : (bf.textEn || '').trim(),
      textAr  : (bf.textAr || '').trim(),
      included: bf.included !== false,
    })) : [],
  }
}
