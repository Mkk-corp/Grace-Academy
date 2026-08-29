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

  return NextResponse.json({ transfers })
}
