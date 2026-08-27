'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const GOLD = '#c9932c'

const CARDS = [
  {
    id: 'topics',
    href: '/admin/datacenter/topics',
    iconEn: 'Topics',
    labelEn: 'Conversation Topics',
    labelAr: 'مواضيع المحادثة',
    descEn: 'Manage topics assessors can select when working with students',
    descAr: 'إدارة المواضيع التي يختارها المستشارون للحديث عنها مع الطلاب',
    color: '#3b82f6',
    statEn: (n) => `${n} topic${n !== 1 ? 's' : ''}`,
    statAr: (n) => `${n} موضوع`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    fetchCount: () => fetch('/api/topics').then(r => r.json()).then(d => (d.topics || []).length),
  },
  {
    id: 'payment-methods',
    href: '/admin/datacenter/payment-methods',
    labelEn: 'Payment Methods',
    labelAr: 'طرق الدفع',
    descEn: 'Configure available payment methods used for payroll transfers',
    descAr: 'إدارة طرق الدفع المستخدمة في تحويل الرواتب',
    color: '#10b981',
    statEn: (n) => `${n} method${n !== 1 ? 's' : ''}`,
    statAr: (n) => `${n} طريقة دفع`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    fetchCount: () => fetch('/api/admin/payment-methods').then(r => r.json()).then(d => (d.methods || []).length),
  },
]

export default function DataCenterPage() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const router    = useRouter()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'
  const [counts, setCounts] = useState({})

  useEffect(() => {
    CARDS.forEach(card => {
      card.fetchCount().then(n => setCounts(prev => ({ ...prev, [card.id]: n }))).catch(() => {})
    })
  }, [])

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>{isAr ? 'مركز البيانات' : 'Data Center'}</h1>
          <div style={{ fontSize: '.8rem', color: 'var(--text-60)', marginTop: 2 }}>
            {isAr ? 'إدارة بيانات المنصة والإعدادات' : 'Manage platform data and configuration'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginTop: 8 }}>
        {CARDS.map(card => {
          const count = counts[card.id]
          return (
            <button
              key={card.id}
              onClick={() => router.push(card.href)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'block',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: isDark ? '0 2px 12px rgba(0,0,0,.22)' : '0 1px 6px rgba(0,0,0,.06)',
                transition: 'transform .16s, box-shadow .16s, border-color .16s',
                textAlign: isAr ? 'right' : 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = isDark ? '0 8px 32px rgba(0,0,0,.35)' : '0 8px 28px rgba(0,0,0,.11)'
                e.currentTarget.style.borderColor = card.color + '55'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = isDark ? '0 2px 12px rgba(0,0,0,.22)' : '0 1px 6px rgba(0,0,0,.06)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Color accent bar */}
              <div style={{ height: 4, background: `linear-gradient(90deg, ${card.color}, ${card.color}80)` }}/>

              <div style={{ padding: '28px 28px 24px' }}>
                {/* Icon + arrow row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: card.color + '14',
                    border: `1.5px solid ${card.color}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: card.color, flexShrink: 0,
                  }}>
                    {card.icon}
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-40)" strokeWidth="2.2" width="14" height="14"
                      style={{ transform: isAr ? 'rotate(180deg)' : 'none' }}>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </div>

                {/* Label + desc */}
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)', marginBottom: 6 }}>
                  {isAr ? card.labelAr : card.labelEn}
                </div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-60)', lineHeight: 1.55, marginBottom: 20 }}>
                  {isAr ? card.descAr : card.descEn}
                </div>

                {/* Count chip */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px', borderRadius: 100,
                  background: card.color + '12',
                  border: `1px solid ${card.color}28`,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: card.color }}/>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: card.color }}>
                    {count === undefined
                      ? (isAr ? 'جارٍ التحميل…' : 'Loading…')
                      : (isAr ? card.statAr(count) : card.statEn(count))}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
