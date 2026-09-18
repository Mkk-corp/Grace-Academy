import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'
import { encryptId } from '@/lib/urlCrypto'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let transfers = []
  try {
    transfers = await prisma.payrollTransfer.findMany({
      orderBy: { transferredAt: 'desc' },
    })
  } catch {
    // PayrollTransfer table may not exist yet — run the pending migration in Supabase
  }

  return NextResponse.json({ transfers: transfers.map(t => ({ ...t, encId: encryptId(t.id) })) })
}
