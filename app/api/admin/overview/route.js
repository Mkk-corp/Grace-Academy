import { NextResponse } from 'next/server'
import { prisma, readContent } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
