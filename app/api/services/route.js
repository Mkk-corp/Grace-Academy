import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readContent, writeContent } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await readContent('services') || [])
}

export async function POST(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = await readContent('services') || []
  const newItem = { id: `svc${Date.now()}`, order: items.length + 1, ...body }
  await writeContent('services', [...items, newItem])
  return NextResponse.json(newItem, { status: 201 })
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = await readContent('services') || []
  await writeContent('services', items.map(i => i.id === body.id ? { ...i, ...body } : i))
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const items = await readContent('services') || []
  await writeContent('services', items.filter(i => i.id !== id))
  return NextResponse.json({ ok: true })
}
