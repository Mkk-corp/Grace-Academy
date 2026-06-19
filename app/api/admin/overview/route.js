import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma, readContent } from '@/lib/db'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const perms = user.role?.permissions || []
  if (!perms.some(p => !ADMIN_ONLY_PERMS.includes(p))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [stats, services, portfolio, blog, faq, messages] = await Promise.all([
    readContent('stats').then(d => d || {}),
    readContent('services').then(d => d || []),
    readContent('portfolio').then(d => d || []),
    readContent('blog').then(d => d || []),
    readContent('faq').then(d => d || []),
    prisma.contactMessage.findMany({ orderBy: { submittedAt: 'desc' } }),
  ])

  return NextResponse.json({
    stats,
    counts: {
      services: services.length,
      portfolio: portfolio.length,
      blogPublished: blog.filter(b => b.published).length,
      faq: faq.length,
    },
    messages,
  })
}
