import { NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request) {
  const body = await request.json()
  const { name, email, phone, message } = body
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const submissions = readData('contact.json')
  const entry = { id: `msg${Date.now()}`, submittedAt: new Date().toISOString(), read: false, name, email, phone: phone || '', message }
  writeData('contact.json', [...submissions, entry])
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function GET() {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(readData('contact.json'))
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const items = readData('contact.json')
  const updated = items.map(i => i.id === id ? { ...i, read: true } : i)
  writeData('contact.json', updated)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const items = readData('contact.json')
  writeData('contact.json', items.filter(i => i.id !== id))
  return NextResponse.json({ ok: true })
}
