import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']

async function getAdminUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { role: true },
  })
  if (!user) return null
  const permissions = user.role?.permissions || []
  if (!permissions.some(p => !ADMIN_ONLY_PERMS.includes(p))) return null
  return user
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    include: {
      report: true,
      student: {
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          dob: true, gender: true, country: true, city: true,
          educationLevel: true, coursesTaken: true, expectedLevel: true,
          isEmployed: true, jobTitle: true, employer: true,
          faculty: true, university: true, englishLevel: true, bio: true,
        },
      },
      assessor: {
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          bio: true, country: true, city: true,
        },
      },
    },
    orderBy: [{ date: 'desc' }, { slotMin: 'asc' }],
  })

  return NextResponse.json({ bookings })
}
