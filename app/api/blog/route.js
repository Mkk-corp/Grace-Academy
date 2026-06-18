import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readContent, writeContent } from '@/lib/db'

export async function GET() {
  const token = (await cookies()).get('ga-admin')?.value
  const items = await readContent('blog') || []
  return NextResponse.json(verifyToken(token) ? items : items.filter(i => i.published))
}

export async function POST(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = await readContent('blog') || []
  const newItem = { id: `blog${Date.now()}`, order: items.length + 1, published: false, ...body }
  await writeContent('blog', [...items, newItem])
  return NextResponse.json(newItem, { status: 201 })
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = await readContent('blog') || []
  await writeContent('blog', items.map(i => i.id === body.id ? { ...i, ...body } : i))
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const items = await readContent('blog') || []
  await writeContent('blog', items.filter(i => i.id !== id))
  return NextResponse.json({ ok: true })
}
