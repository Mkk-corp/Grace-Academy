import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendPayslipEmail } from '@/lib/mailer'

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

function monthLabel(monthStr) {
  const [y, m] = monthStr.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export async function POST(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    assessorId, paymentMethod,
    evidenceData, evidenceName,
    month: reqMonth,
  } = body

  if (!assessorId || !paymentMethod) {
    return NextResponse.json({ error: 'assessorId and paymentMethod required' }, { status: 400 })
  }

  const month = reqMonth || currentMonthStr()
  const today = new Date().toLocaleDateString('en-CA')

  // Get assessor
  const assessor = await prisma.user.findUnique({ where: { id: assessorId }, select: { id: true, name: true, email: true } })
  if (!assessor) return NextResponse.json({ error: 'Assessor not found' }, { status: 404 })

  // Payroll settings
  const settingsRow = await prisma.siteContent.findUnique({ where: { key: 'payroll_settings' } })
  const settings = settingsRow?.data || {}
  const placementRate = parseFloat(settings.placementPayPerSession) || 0
  const speakingRate  = parseFloat(settings.speakingPayPerSession)  || 0
  const currency      = settings.currency || 'USD'

  // Count sessions
  const placementCount = await prisma.booking.count({
    where: {
      assessorId,
      status: 'confirmed',
      date: { startsWith: month, lte: today },
    },
  })
  const speakingCount = 0

  const totalAmount = placementCount * placementRate + speakingCount * speakingRate

  // Create transfer record
  const transfer = await prisma.payrollTransfer.create({
    data: {
      assessorId,
      assessorName: assessor.name,
      assessorEmail: assessor.email,
      month,
      placementCount,
      speakingCount,
      placementRate,
      speakingRate,
      totalAmount,
      currency,
      paymentMethod,
      evidenceData:  evidenceData  || null,
      evidenceName:  evidenceName  || null,
      transferredById:   admin.id,
      transferredByName: admin.name,
    },
  })

  // Send payslip email (non-blocking)
  sendPayslipEmail({
    to: assessor.email,
    assessorName: assessor.name,
    month: monthLabel(month),
    placementCount,
    speakingCount,
    placementRate,
    speakingRate,
    totalAmount,
    currency,
    paymentMethod,
    transferId: transfer.id,
    transferredAt: transfer.transferredAt,
  }).catch(err => console.error('[payroll email]', err))

  return NextResponse.json({ ok: true, transfer })
}
