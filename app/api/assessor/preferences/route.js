import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

  const prefs = await prisma.assessorPreference.findUnique({ where: { userId: user.id } })
  return NextResponse.json(prefs ? { accent: prefs.accent, topics: prefs.topics } : { accent: 'american', topics: [] })
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

  const existing = await prisma.assessorPreference.findUnique({ where: { userId: user.id } })
  const newAccent = accent || existing?.accent || 'american'
  const newTopics = topics !== undefined ? topics : (existing?.topics || [])

  const prefs = await prisma.assessorPreference.upsert({
    where:  { userId: user.id },
    update: { accent: newAccent, topics: newTopics },
    create: { userId: user.id, accent: newAccent, topics: newTopics },
  })

  return NextResponse.json({ accent: prefs.accent, topics: prefs.topics })
}
