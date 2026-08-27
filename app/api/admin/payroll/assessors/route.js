import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const jar   = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  const perms = user?.role?.permissions || []
  const hasAdmin = perms.some(p => !['access_student_portal','access_assessor_portal','access_teacher_portal'].includes(p))
  return hasAdmin ? user : null
}

function currentMonthStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function staffTypeLabel(permissions) {
  const isAssessor = permissions.includes('access_assessor_portal')
  const isTeacher  = permissions.includes('access_teacher_portal')
  if (isAssessor && isTeacher) return 'Academic Consultant & Teacher'
  if (isAssessor) return 'Academic Consultant'
  if (isTeacher)  return 'Teacher'
  return 'Staff'
}

export async function GET(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') || currentMonthStr()
  const today = new Date().toLocaleDateString('en-CA')

  // Payroll settings
  const settingsRow = await prisma.siteContent.findUnique({ where: { key: 'payroll_settings' } })
  const settings = settingsRow?.data || {}
  const placementRate = parseFloat(settings.placementPayPerSession) || 0
  const speakingRate  = parseFloat(settings.speakingPayPerSession)  || 0
  const currency      = settings.currency || 'USD'

  // All staff: roles that have assessor OR teacher portal access
  const roles = await prisma.role.findMany({
    where: {
      permissions: {
        hasSome: ['access_assessor_portal', 'access_teacher_portal'],
      },
    },
    select: { id: true, permissions: true },
  })

  // Build a map of roleId → permissions for later labeling
  const rolePermMap = Object.fromEntries(roles.map(r => [r.id, r.permissions]))
  const roleIds = roles.map(r => r.id)

  const staffUsers = await prisma.user.findMany({
    where: { roleId: { in: roleIds } },
    select: { id: true, name: true, email: true, roleId: true },
    orderBy: { name: 'asc' },
  })

  // For each staff member: count sessions + check transfer
  const results = await Promise.all(staffUsers.map(async u => {
    const perms = rolePermMap[u.roleId] || []
    const isAssessor = perms.includes('access_assessor_portal')

    const [placementCount, transfer] = await Promise.all([
      // Only assessors can have placement bookings
      isAssessor
        ? prisma.booking.count({
            where: {
              assessorId: u.id,
              status: 'confirmed',
              date: { startsWith: month, lte: today },
            },
          })
        : Promise.resolve(0),
      prisma.payrollTransfer.findFirst({
        where: { assessorId: u.id, month },
        orderBy: { transferredAt: 'desc' },
      }),
    ])

    const speakingCount      = 0 // future feature
    const alreadyTransferred = !!transfer
    const rawTotal           = placementCount * placementRate + speakingCount * speakingRate
    const totalAmount        = alreadyTransferred ? 0 : rawTotal

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      staffType: staffTypeLabel(perms),
      placementCount,
      speakingCount,
      placementRate,
      speakingRate,
      totalAmount,
      rawTotal,
      currency,
      alreadyTransferred,
      transferId: transfer?.id || null,
    }
  }))

  return NextResponse.json({ assessors: results, month, currency })
}
