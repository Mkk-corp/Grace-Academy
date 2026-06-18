import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return NextResponse.json({ user: null })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ user: null })

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { role: true },
  })
  if (!user) return NextResponse.json({ user: null })

  const permissions = user.role?.permissions || []
  const hasAdminAccess = permissions.some(p => !['access_student_portal', 'access_assessor_portal', 'access_teacher_portal'].includes(p))
  const isAssessor     = permissions.includes('access_assessor_portal') && !hasAdminAccess
  const isTeacher      = permissions.includes('access_teacher_portal')  && !hasAdminAccess

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name || 'Student',
      avatar: user.avatar || 'user1',
      permissions,
      hasAdminAccess,
      isAssessor,
      isTeacher,
    },
  })
}
