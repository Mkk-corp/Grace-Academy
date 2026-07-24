import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ALLOWED_AVATARS = ['user1', 'user2', 'user3', 'user4', 'user5']

const SAFE_SELECT = {
  id: true, name: true, username: true, email: true, phone: true,
  roleId: true, source: true, avatar: true, dob: true, gender: true,
  bio: true, country: true, city: true, nationalId: true,
  emergencyContact: true, createdAt: true, updatedAt: true,
  educationLevel: true, coursesTaken: true, expectedLevel: true,
  isEmployed: true, jobTitle: true, employer: true,
  faculty: true, university: true, teachingExperience: true,
  teachingWhere: true, englishLevel: true,
  role: { select: { name: true } },
}

async function getUserId() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId || null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId }, select: SAFE_SELECT })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { role, ...rest } = user
  return NextResponse.json({ ...rest, roleName: role?.name || null })
}

export async function PUT(request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const allowed = ['name', 'username', 'phone', 'dob', 'gender', 'bio', 'country', 'city', 'nationalId', 'emergencyContact', 'avatar',
    'educationLevel', 'coursesTaken', 'expectedLevel', 'isEmployed', 'jobTitle', 'employer',
    'faculty', 'university', 'teachingExperience', 'teachingWhere', 'englishLevel']

  const updates = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (updates.avatar && !ALLOWED_AVATARS.includes(updates.avatar)) {
    return NextResponse.json({ error: 'Invalid avatar selection.' }, { status: 400 })
  }
  if (updates.name !== undefined && !updates.name.trim()) {
    return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 })
  }

  const user = await prisma.user.update({ where: { id: userId }, data: updates, select: SAFE_SELECT })
  const { role, ...rest } = user
  return NextResponse.json({ ...rest, roleName: role?.name || null })
}
