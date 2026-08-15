import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(request) {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  const payload = token ? verifyToken(token) : null
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null

  if (payload?.userId) {
    logAudit({ actorId: payload.userId, actorName: payload.name, actorRole: payload.role || 'user', action: 'logout', entity: 'User', entityId: payload.userId, ip })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('ga-admin', '', { maxAge: 0, path: '/' })
  return response
}
