import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readContent, writeContent } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function GET() {
  return NextResponse.json(await readContent('content') || {})
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  const actor = verifyToken(token)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const current = await readContent('content') || {}
  await writeContent('content', { ...current, ...body })
  logAudit({ actorId: actor.userId, actorName: actor.name, actorRole: 'admin', action: 'content.updated', entity: 'site_content', meta: { sections: Object.keys(body) } })
  return NextResponse.json({ ok: true })
}
