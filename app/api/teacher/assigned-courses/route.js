import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/lib/guard'

export async function GET() {
  const payload = await requireTeacher()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = payload.userId
  const assignments = await prisma.teacherCourse.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          category: { select: { id: true, nameEn: true, nameAr: true } },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  })

  const courses = assignments.map(a => ({
    ...a.course,
    assignedAt: a.assignedAt,
  }))

  return NextResponse.json({ courses })
}
