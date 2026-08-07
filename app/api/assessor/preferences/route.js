import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma, readContent, writeContent } from '@/lib/db'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  if (!user) return null
  const permissions = user.role?.permissions || []
  const hasAdminAccess = permissions.some(p => !ADMIN_ONLY_PERMS.includes(p))
  const isAssessor = permissions.includes('access_assessor_portal') && !hasAdminAccess
  return { ...user, permissions, hasAdminAccess, isAssessor }
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const allPrefs = await readContent('assessor_prefs') || {}
  const prefs = allPrefs[user.id] || { accent: 'american', topics: [] }
  return NextResponse.json(prefs)
}

export async function PUT(req) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.isAssessor && !user.hasAdminAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { accent, topics } = await req.json()

  if (accent && !['american', 'british'].includes(accent)) {
    return NextResponse.json({ error: 'Invalid accent value' }, { status: 400 })
  }
  if (topics !== undefined && !Array.isArray(topics)) {
    return NextResponse.json({ error: 'Topics must be an array' }, { status: 400 })
  }

  const allPrefs = await readContent('assessor_prefs') || {}
  const existing = allPrefs[user.id] || { accent: 'american', topics: [] }

  allPrefs[user.id] = {
    accent: accent || existing.accent,
    topics: topics !== undefined ? topics : existing.topics,
    updatedAt: new Date().toISOString(),
  }
  await writeContent('assessor_prefs', allPrefs)

  return NextResponse.json(allPrefs[user.id])
}
