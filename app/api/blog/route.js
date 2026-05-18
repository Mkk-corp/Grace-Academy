import { NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  const token = (await cookies()).get('ga-admin')?.value
  const items = readData('blog.json')
  return NextResponse.json(verifyToken(token) ? items : items.filter(i => i.published))
}

export async function POST(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = readData('blog.json')
  const newItem = { id: `blog${Date.now()}`, order: items.length + 1, published: false, ...body }
  writeData('blog.json', [...items, newItem])
  return NextResponse.json(newItem, { status: 201 })
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = readData('blog.json')
  const updated = items.map(i => i.id === body.id ? { ...i, ...body } : i)
  writeData('blog.json', updated)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const items = readData('blog.json')
  writeData('blog.json', items.filter(i => i.id !== id))
  return NextResponse.json({ ok: true })
}
