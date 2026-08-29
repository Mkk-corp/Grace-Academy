import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  const perms = user?.role?.permissions || []
  const isAdmin = perms.some(p => !['access_student_portal', 'access_assessor_portal', 'access_teacher_portal'].includes(p))
  return isAdmin ? payload : null
}

function shape(cat) {
  return {
    id:          cat.id,
    nameEn:      cat.nameEn,
    nameAr:      cat.nameAr,
    courseCount: cat._count?.courses ?? 0,
    createdAt:   cat.createdAt,
  }
}

export async function GET() {
  const cats = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { courses: true } } },
  })
  return NextResponse.json({ categories: cats.map(shape) })
}

export async function POST(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nameEn, nameAr } = await req.json()
  if (!nameEn?.trim()) return NextResponse.json({ error: 'English name is required' }, { status: 400 })

  const dup = await prisma.category.findFirst({ where: { nameEn: { equals: nameEn.trim(), mode: 'insensitive' } } })
  if (dup) return NextResponse.json({ error: 'A category with this English name already exists' }, { status: 400 })

  const cat = await prisma.category.create({
    data: { nameEn: nameEn.trim(), nameAr: nameAr?.trim() || '' },
    include: { _count: { select: { courses: true } } },
  })
  return NextResponse.json({ category: shape(cat) }, { status: 201 })
}

export async function PATCH(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, nameEn, nameAr } = await req.json()
  if (!id)             return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
  if (!nameEn?.trim()) return NextResponse.json({ error: 'English name is required' }, { status: 400 })

  const dup = await prisma.category.findFirst({
    where: { nameEn: { equals: nameEn.trim(), mode: 'insensitive' }, NOT: { id } },
  })
  if (dup) return NextResponse.json({ error: 'A category with this English name already exists' }, { status: 400 })

  const cat = await prisma.category.update({
    where: { id },
    data:  { nameEn: nameEn.trim(), nameAr: nameAr?.trim() || '' },
    include: { _count: { select: { courses: true } } },
  })
  return NextResponse.json({ category: shape(cat) })
}

export async function DELETE(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 })

  const count = await prisma.course.count({ where: { categoryId: id } })
  if (count > 0) return NextResponse.json({ error: `Cannot delete — ${count} course${count !== 1 ? 's are' : ' is'} assigned to this category` }, { status: 400 })

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
