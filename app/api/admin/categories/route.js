import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

const KEY = 'course_categories'

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

async function getCategories() {
  const record = await prisma.siteContent.findUnique({ where: { key: KEY } })
  return record?.data?.categories || []
}

export async function GET() {
  const cats = await getCategories()
  return NextResponse.json({ categories: cats })
}

export async function POST(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { nameEn, nameAr } = await req.json()
  if (!nameEn?.trim()) return NextResponse.json({ error: 'English name is required' }, { status: 400 })
  const cats = await getCategories()
  const dup = cats.find(c => c.nameEn.toLowerCase() === nameEn.trim().toLowerCase())
  if (dup) return NextResponse.json({ error: 'A category with this English name already exists' }, { status: 400 })
  const newCat = {
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    nameEn: nameEn.trim(),
    nameAr: nameAr?.trim() || '',
    courseCount: 0,
    createdAt: new Date().toISOString(),
  }
  const updated = [...cats, newCat]
  await prisma.siteContent.upsert({
    where: { key: KEY },
    update: { data: { categories: updated } },
    create: { key: KEY, data: { categories: updated } },
  })
  return NextResponse.json({ category: newCat, categories: updated }, { status: 201 })
}

export async function PATCH(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, nameEn, nameAr } = await req.json()
  if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
  if (!nameEn?.trim()) return NextResponse.json({ error: 'English name is required' }, { status: 400 })
  const cats = await getCategories()
  const idx = cats.findIndex(c => c.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  const dup = cats.find(c => c.id !== id && c.nameEn.toLowerCase() === nameEn.trim().toLowerCase())
  if (dup) return NextResponse.json({ error: 'A category with this English name already exists' }, { status: 400 })
  cats[idx] = { ...cats[idx], nameEn: nameEn.trim(), nameAr: nameAr?.trim() || '' }
  await prisma.siteContent.upsert({
    where: { key: KEY },
    update: { data: { categories: cats } },
    create: { key: KEY, data: { categories: cats } },
  })
  return NextResponse.json({ category: cats[idx], categories: cats })
}

export async function DELETE(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
  const cats = await getCategories()
  const target = cats.find(c => c.id === id)
  if (!target) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  if (target.courseCount > 0) return NextResponse.json({ error: `Cannot delete — ${target.courseCount} course(s) are assigned to this category` }, { status: 400 })
  const updated = cats.filter(c => c.id !== id)
  await prisma.siteContent.upsert({
    where: { key: KEY },
    update: { data: { categories: updated } },
    create: { key: KEY, data: { categories: updated } },
  })
  return NextResponse.json({ ok: true, categories: updated })
}
