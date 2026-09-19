import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'

export async function GET(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(request.url)

  if (searchParams.get('profile') === '1') {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, name: true, permissions: true } },
        assessorPreference: true,
        scheduleTemplate: { select: { id: true, updatedAt: true } },
        _count: {
          select: {
            bookingsAsStudent:  true,
            bookingsAsAssessor: true,
            notifications:      true,
            slotRequests:       true,
          },
        },
      },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { password, passwordHistory, ...safe } = user
    return NextResponse.json({ user: safe })
  }

  /* Deletion-impact (existing behaviour) */
  const [bookingCount, schedule, pendingRequests, payrollCount] = await Promise.all([
    prisma.booking.count({ where: { OR: [{ studentId: id }, { assessorId: id }] } }),
    prisma.scheduleTemplate.findUnique({ where: { userId: id }, select: { id: true } }),
    prisma.slotRequest.count({ where: { assessorId: id, status: 'pending' } }),
    prisma.payrollTransfer.count({ where: { assessorId: id } }),
  ])

  return NextResponse.json({
    bookingCount,
    hasSchedule:     !!schedule,
    hasSlotRequests: pendingRequests > 0,
    payrollCount,
  })
}

export async function PATCH(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const allowed = ['name', 'username', 'email', 'phone', 'bio', 'dob', 'gender', 'country', 'city',
    'nationalId', 'emergencyContact', 'educationLevel', 'coursesTaken', 'expectedLevel',
    'englishLevel', 'faculty', 'university', 'isEmployed', 'jobTitle', 'employer',
    'teachingExperience', 'teachingWhere', 'roleId', 'forcePasswordReset']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const user = await prisma.user.update({ where: { id }, data, include: { role: true } })
  const { password, passwordHistory, ...safe } = user
  return NextResponse.json({ user: safe })
}
