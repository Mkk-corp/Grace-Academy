import { NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  return NextResponse.json(readData('content.json'))
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const current = readData('content.json')
  writeData('content.json', { ...current, ...body })
  return NextResponse.json({ ok: true })
}
