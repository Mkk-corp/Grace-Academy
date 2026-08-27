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

  // All assessors (users with access_assessor_portal permission)
  const roles = await prisma.role.findMany({
    where: { permissions: { has: 'access_assessor_portal' } },
    select: { id: true },
  })
  const roleIds = roles.map(r => r.id)

  const assessors = await prisma.user.findMany({
    where: { roleId: { in: roleIds } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  // For each assessor: count sessions in the given month
  const results = await Promise.all(assessors.map(async a => {
    const [placementCount, transfer] = await Promise.all([
      prisma.booking.count({
        where: {
          assessorId: a.id,
          status: 'confirmed',
          date: { startsWith: month, lte: today },
        },
      }),
      prisma.payrollTransfer.findFirst({
        where: { assessorId: a.id, month },
        orderBy: { transferredAt: 'desc' },
      }),
    ])

    const speakingCount = 0 // future feature
    const alreadyTransferred = !!transfer
    const totalAmount = alreadyTransferred
      ? 0
      : placementCount * placementRate + speakingCount * speakingRate

    return {
      id: a.id,
      name: a.name,
      email: a.email,
      placementCount,
      speakingCount,
      placementRate,
      speakingRate,
      totalAmount: alreadyTransferred ? 0 : totalAmount,
      rawTotal: placementCount * placementRate + speakingCount * speakingRate,
      currency,
      alreadyTransferred,
      transferId: transfer?.id || null,
    }
  }))

  return NextResponse.json({ assessors: results, month, currency })
}
