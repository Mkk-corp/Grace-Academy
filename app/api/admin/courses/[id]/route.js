import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  const perms = user?.role?.permissions || []
  const isAdmin = perms.some(p => !['access_student_portal', 'access_assessor_portal', 'access_teacher_portal'].includes(p))
  return isAdmin ? payload : null
}

function validate(body) {
  const { nameEn, descEn, marketingEn, durationSessions, needsSpeaking, speakingSessions, needsLibrary, libraryTypes } = body
  if (!nameEn?.trim())      return 'Course name (English) is required'
  if (!descEn?.trim())      return 'Description (English) is required'
  if (!marketingEn?.trim()) return 'Marketing message (English) is required'
  if (!durationSessions || Number(durationSessions) < 1) return 'Duration in sessions is required'
  if (needsSpeaking && (!speakingSessions || Number(speakingSessions) < 1)) return 'Number of speaking sessions is required when enabled'
  if (needsLibrary  && (!libraryTypes || libraryTypes.length === 0))        return 'Select at least one library type when library is enabled'
  return null
}

function buildData(body) {
  const { nameEn, nameAr, descEn, descAr, marketingEn, marketingAr, durationMonths, durationSessions, needsSpeaking, speakingSessions, needsLibrary, libraryTypes, categoryId, level } = body
  return {
    nameEn:          nameEn.trim(),
    nameAr:          nameAr?.trim()      || '',
    descEn:          descEn.trim(),
    descAr:          descAr?.trim()      || '',
    marketingEn:     marketingEn.trim(),
    marketingAr:     marketingAr?.trim() || '',
    durationMonths:  durationMonths ? Number(durationMonths) : null,
    durationSessions: Number(durationSessions),
    needsSpeaking:   !!needsSpeaking,
    speakingSessions: needsSpeaking ? Number(speakingSessions) : null,
    needsLibrary:    !!needsLibrary,
    libraryTypes:    needsLibrary ? (libraryTypes || []) : [],
    categoryId:      categoryId || null,
    level:           level || '',
  }
}

const include = { category: { select: { id: true, nameEn: true, nameAr: true } } }

export async function GET(req, { params }) {
  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id }, include })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  return NextResponse.json({ course })
}

export async function PATCH(req, { params }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const err = validate(body)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  const existing = await prisma.course.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const course = await prisma.course.update({ where: { id }, data: buildData(body), include })
  return NextResponse.json({ course })
}

export async function DELETE(req, { params }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.course.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  await prisma.course.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
