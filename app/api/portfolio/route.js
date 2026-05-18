import { NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  return NextResponse.json(readData('portfolio.json'))
}

export async function POST(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = readData('portfolio.json')
  const newItem = { id: `proj${Date.now()}`, order: items.length + 1, ...body }
  writeData('portfolio.json', [...items, newItem])
  return NextResponse.json(newItem, { status: 201 })
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = readData('portfolio.json')
  const updated = items.map(i => i.id === body.id ? { ...i, ...body } : i)
  writeData('portfolio.json', updated)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const items = readData('portfolio.json')
  writeData('portfolio.json', items.filter(i => i.id !== id))
  return NextResponse.json({ ok: true })
}
