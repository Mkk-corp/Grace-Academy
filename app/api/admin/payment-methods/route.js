import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'

const KEY = 'payment_methods'

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

export async function PATCH(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { oldName, newName } = await req.json()
  if (!oldName?.trim() || !newName?.trim()) return NextResponse.json({ error: 'Both names required' }, { status: 400 })

  const methods = await getMethods()
  if (!methods.includes(oldName.trim())) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (methods.includes(newName.trim())) return NextResponse.json({ error: 'Already exists' }, { status: 400 })

  const updated = methods.map(m => m === oldName.trim() ? newName.trim() : m)
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
