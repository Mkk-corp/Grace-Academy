import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readContent, writeContent } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await readContent('content') || {})
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const current = await readContent('content') || {}
  await writeContent('content', { ...current, ...body })
  return NextResponse.json({ ok: true })
}
