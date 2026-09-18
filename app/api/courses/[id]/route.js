import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { decryptId, encryptId } from '@/lib/urlCrypto'

export async function GET(req, { params }) {
  const { id: rawId } = await params
  const id = decryptId(rawId) || rawId
  const course = await prisma.course.findUnique({
    where: { id },
    include: { category: { select: { id: true, nameEn: true, nameAr: true } } },
  })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  return NextResponse.json({ course: { ...course, encId: encryptId(course.id) } })
}
