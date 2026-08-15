import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readContent, writeContent } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function GET() {
  const token = (await cookies()).get('ga-admin')?.value
  const items = await readContent('blog') || []
  return NextResponse.json(verifyToken(token) ? items : items.filter(i => i.published))
}

export async function POST(request) {
  const token = (await cookies()).get('ga-admin')?.value
  const actor = verifyToken(token)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = await readContent('blog') || []
  const newItem = { id: `blog${Date.now()}`, order: items.length + 1, published: false, ...body }
  await writeContent('blog', [...items, newItem])
  logAudit({ actorId: actor.userId, actorName: actor.name, actorRole: 'admin', action: 'content.created', entity: 'blog', entityId: newItem.id, meta: { title: body.titleEn || body.title } })
  return NextResponse.json(newItem, { status: 201 })
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  const actor = verifyToken(token)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = await readContent('blog') || []
  await writeContent('blog', items.map(i => i.id === body.id ? { ...i, ...body } : i))
  logAudit({ actorId: actor.userId, actorName: actor.name, actorRole: 'admin', action: 'content.updated', entity: 'blog', entityId: body.id, meta: { title: body.titleEn || body.title } })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const token = (await cookies()).get('ga-admin')?.value
  const actor = verifyToken(token)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const items = await readContent('blog') || []
  await writeContent('blog', items.filter(i => i.id !== id))
  logAudit({ actorId: actor.userId, actorName: actor.name, actorRole: 'admin', action: 'content.deleted', entity: 'blog', entityId: id })
  return NextResponse.json({ ok: true })
}
