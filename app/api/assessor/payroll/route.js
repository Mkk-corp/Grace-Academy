import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

function currentMonthStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export async function GET(req) {
  const jar   = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') || currentMonthStr()
  const today = new Date().toLocaleDateString('en-CA')

  const settingsRow = await prisma.siteContent.findUnique({ where: { key: 'payroll_settings' } })
  const settings = settingsRow?.data || {}
  const placementRate = parseFloat(settings.placementPayPerSession) || 0
  const speakingRate  = parseFloat(settings.speakingPayPerSession)  || 0
  const currency      = settings.currency || 'USD'

  const placementCount = await prisma.booking.count({
    where: {
      assessorId: payload.userId,
      status: 'confirmed',
      date: { startsWith: month, lte: today },
    },
  })

  let transfer = null
  try {
    transfer = await prisma.payrollTransfer.findFirst({
      where: { assessorId: payload.userId, month },
      orderBy: { transferredAt: 'desc' },
    })
  } catch {
    // PayrollTransfer table may not exist yet — run the pending migration in Supabase
  }

  const speakingCount = 0
  const subtotal = placementCount * placementRate + speakingCount * speakingRate

  return NextResponse.json({
    month,
    placementCount,
    speakingCount,
    placementRate,
    speakingRate,
    subtotal,
    currency,
    alreadyTransferred: !!transfer,
    transferId: transfer?.id || null,
  })
}
