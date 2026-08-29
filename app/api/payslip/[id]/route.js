import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req, { params }) {
  const jar   = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  const perms = user?.role?.permissions || []
  const hasAdmin   = perms.some(p => !['access_student_portal','access_assessor_portal','access_teacher_portal'].includes(p))
  const isAssessor = perms.includes('access_assessor_portal') && !hasAdmin

  const { id } = await params
  let transfer = null
  try {
    transfer = await prisma.payrollTransfer.findUnique({ where: { id } })
  } catch {
    // PayrollTransfer table may not exist yet
  }
  if (!transfer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Assessors can only see their own payslips
  if (isAssessor && transfer.assessorId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Strip evidence binary from response (not needed for display)
  const { evidenceData: _, ...safe } = transfer
  return NextResponse.json({ transfer: safe })
}
