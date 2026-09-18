import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ADMIN_PANEL_PERMS } from '@/lib/permissions'

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

  // Force logout: session version mismatch (skip for admins)
  const isAdmin = user.roleId === 'r_admin'
  if (!isAdmin && payload.sv !== undefined && payload.sv !== (user.sessionVersion ?? 1)) {
    const res = NextResponse.json({ user: null, forceLogout: true })
    res.cookies.set('ga-admin', '', { maxAge: 0, path: '/' })
    return res
  }

  const permissions = user.role?.permissions || []
  const hasAdminAccess = permissions.some(p => ADMIN_PANEL_PERMS.has(p))
  const isAssessor = permissions.includes('access_assessor_portal') && !hasAdminAccess
  const isTeacher  = permissions.includes('access_teacher_portal')  && !hasAdminAccess

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
