'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'

const S = {
  en: {
    title:       'Overview',
    reviews:     'Reviews',
    services:    'Services',
    portfolio:   'Portfolio Cases',
    blog:        'Blog Posts',
    faq:         'FAQ Items',
    unreadMsg:   'Unread Messages',
    recentTitle: 'Recent Messages',
    viewAll:     'View all messages →',
    noMessages:  'No messages yet.',
    badgeNew:    'NEW',
  },
  ar: {
    title:       'نظرة عامة',
    reviews:     'التقييمات',
    services:    'الخدمات',
    portfolio:   'مشاريع الأعمال',
    blog:        'مقالات المدونة',
    faq:         'أسئلة شائعة',
    unreadMsg:   'رسائل غير مقروءة',
    recentTitle: 'الرسائل الأخيرة',
    viewAll:     '← عرض جميع الرسائل',
    noMessages:  'لا توجد رسائل بعد.',
    badgeNew:    'جديد',
  },
}

export default function AdminOverviewPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/admin/overview').then(r => r.json()).then(setData)
  }, [])

  if (!data) return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-40)' }}>
      {lang === 'ar' ? 'جار التحميل…' : 'Loading…'}
    </div>
  )

  const { stats, counts, messages } = data
  const unread = messages.filter(m => !m.read).length

  const tiles = [
    { label: s.reviews,   value: stats.reviews ? `${stats.reviews.value}${stats.reviews.suffix}` : '—', color: 'var(--gold)' },
    { label: s.services,  value: counts.services },
    { label: s.portfolio, value: counts.portfolio },
    { label: s.blog,      value: counts.blogPublished },
    { label: s.faq,       value: counts.faq },
    { label: s.unreadMsg, value: unread, color: unread > 0 ? '#e8a020' : undefined },
  ]

  return (
    <>
      <div className="admin-header">
        <h1>{s.title}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {tiles.map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', padding: '24px',
            borderBottom: `3px solid ${color || 'var(--gold)'}`,
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: color || 'var(--gold)', fontFamily: 'var(--font-en)' }}>{value}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-60)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{s.recentTitle}</h2>
          {messages.length > 0 && (
            <Link href="/admin/contact" style={{ fontSize: '.78rem', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>{s.viewAll}</Link>
          )}
        </div>
        {messages.slice(0, 5).map(msg => (
          <div key={msg.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!msg.read && <span className="badge-unread">{s.badgeNew}</span>}
            <div>
              <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text)' }}>{msg.name}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-60)' }}>{msg.email} · {new Date(msg.submittedAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p style={{ color: 'var(--text-40)', fontSize: '.875rem' }}>{s.noMessages}</p>}
      </div>
    </>
  )
}
