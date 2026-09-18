import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { encryptId } from '@/lib/urlCrypto'

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, nameEn: true, nameAr: true } } },
  })
  return NextResponse.json({ courses: courses.map(c => ({ ...c, encId: encryptId(c.id) })) })
}
