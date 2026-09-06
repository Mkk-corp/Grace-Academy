import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req, { params }) {
  const { id } = await params
  const course = await prisma.course.findUnique({
    where: { id },
    include: { category: { select: { id: true, nameEn: true, nameAr: true } } },
  })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  return NextResponse.json({ course })
}
