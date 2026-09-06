import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, nameEn: true, nameAr: true } } },
  })
  return NextResponse.json({ courses })
}
