import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'

const KEY = 'payroll_settings'

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
