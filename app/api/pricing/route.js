import { NextResponse } from 'next/server'
import { readContent, writeContent } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'
import { logAudit } from '@/lib/audit'
import { randomUUID } from 'crypto'

export async function GET() {
  const plans = await readContent('pricing') || []
  return NextResponse.json({ plans })
}

export async function POST(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.nameEn?.trim()) return NextResponse.json({ error: 'Plan name (English) is required' }, { status: 400 })

  const plans = await readContent('pricing') || []
  const plan = { id: randomUUID(), ...sanitize(body), visible: body.visible ?? true }
  await writeContent('pricing', [...plans, plan])
  logAudit({ actorId: admin.userId, actorName: admin.name, actorRole: 'admin', action: 'pricing.created', entity: 'Plan', entityId: plan.id, meta: { nameEn: plan.nameEn } })
  return NextResponse.json({ plan }, { status: 201 })
}

export async function PUT(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const plans = await readContent('pricing') || []
  const idx = plans.findIndex(p => p.id === body.id)
  if (idx === -1) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const updated = { ...plans[idx], ...sanitize(body), id: body.id }
  plans[idx] = updated
  await writeContent('pricing', plans)
  logAudit({ actorId: admin.userId, actorName: admin.name, actorRole: 'admin', action: 'pricing.updated', entity: 'Plan', entityId: body.id, meta: { nameEn: body.nameEn } })
  return NextResponse.json({ plan: updated })
}

export async function DELETE(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const plans = await readContent('pricing') || []
  const filtered = plans.filter(p => p.id !== id)
  if (filtered.length === plans.length) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  await writeContent('pricing', filtered)
  logAudit({ actorId: admin.userId, actorName: admin.name, actorRole: 'admin', action: 'pricing.deleted', entity: 'Plan', entityId: id })
  return NextResponse.json({ ok: true })
}

function sanitize(b) {
  return {
    nameEn:     (b.nameEn     || '').trim(),
    nameAr:     (b.nameAr     || '').trim(),
    price:      (b.price      || '').trim(),
    currency:   (b.currency   || '').trim(),
    durationEn: (b.durationEn || '').trim(),
    durationAr: (b.durationAr || '').trim(),
    country:    (b.country    || '').trim(),
    visible:    b.visible !== false,
    popular:    !!b.popular,
    badgeEn:    (b.badgeEn    || '').trim(),
    badgeAr:    (b.badgeAr    || '').trim(),
    descEn:     (b.descEn     || '').trim(),
    descAr:     (b.descAr     || '').trim(),
    ctaTextEn:  (b.ctaTextEn  || '').trim(),
    ctaTextAr:  (b.ctaTextAr  || '').trim(),
    ctaUrl:     (b.ctaUrl     || '').trim() || '/contact',
    benefits:   Array.isArray(b.benefits) ? b.benefits.map((bf, i) => ({
      id:       bf.id || String(i),
      textEn:   (bf.textEn || '').trim(),
      textAr:   (bf.textAr || '').trim(),
      included: bf.included !== false,
    })) : [],
  }
}
