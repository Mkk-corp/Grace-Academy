import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const jar   = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let transfers = []
  try {
    transfers = await prisma.payrollTransfer.findMany({
      where: { assessorId: payload.userId },
      orderBy: { transferredAt: 'desc' },
      select: {
        id: true,
        month: true,
        placementCount: true,
        speakingCount: true,
        placementRate: true,
        speakingRate: true,
        totalAmount: true,
        currency: true,
        paymentMethod: true,
        evidenceName: true,
        transferredAt: true,
      },
    })
  } catch {
    // PayrollTransfer table may not exist yet — run the pending migration in Supabase
  }

  return NextResponse.json({ transfers })
}
