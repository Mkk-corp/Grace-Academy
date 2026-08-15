import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readContent, writeContent } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function GET() {
  return NextResponse.json(await readContent('portfolio') || [])
}

export async function POST(request) {
  const token = (await cookies()).get('ga-admin')?.value
  const actor = verifyToken(token)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = await readContent('portfolio') || []
  const newItem = { id: `proj${Date.now()}`, order: items.length + 1, ...body }
  await writeContent('portfolio', [...items, newItem])
  logAudit({ actorId: actor.userId, actorName: actor.name, actorRole: 'admin', action: 'content.created', entity: 'portfolio', entityId: newItem.id, meta: { title: body.titleEn || body.title } })
  return NextResponse.json(newItem, { status: 201 })
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  const actor = verifyToken(token)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = await readContent('portfolio') || []
  await writeContent('portfolio', items.map(i => i.id === body.id ? { ...i, ...body } : i))
  logAudit({ actorId: actor.userId, actorName: actor.name, actorRole: 'admin', action: 'content.updated', entity: 'portfolio', entityId: body.id })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const token = (await cookies()).get('ga-admin')?.value
  const actor = verifyToken(token)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const items = await readContent('portfolio') || []
  await writeContent('portfolio', items.filter(i => i.id !== id))
  logAudit({ actorId: actor.userId, actorName: actor.name, actorRole: 'admin', action: 'content.deleted', entity: 'portfolio', entityId: id })
  return NextResponse.json({ ok: true })
}
