import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readContent, writeContent } from '@/lib/db'
import { logAudit } from '@/lib/audit'

const DEFAULT = {
  kpis: [], story: [],
  vision: { en: '', ar: '' }, mission: { en: '', ar: '' },
  goals: [], whyUs: [], team: [],
}

export async function GET() {
  return NextResponse.json((await readContent('about')) ?? DEFAULT)
}

export async function PUT(req) {
  const token = (await cookies()).get('ga-admin')?.value
  const actor = verifyToken(token)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  await writeContent('about', body)
  logAudit({ actorId: actor.userId, actorName: actor.name, actorRole: 'admin', action: 'content.updated', entity: 'site_content', meta: { section: 'about' } })
  return NextResponse.json({ ok: true })
}
