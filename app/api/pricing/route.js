import { NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  return NextResponse.json(readData('pricing.json'))
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const items = readData('pricing.json')
  const updated = items.map(i => i.id === body.id ? { ...i, ...body } : i)
  writeData('pricing.json', updated)
  return NextResponse.json({ ok: true })
}
