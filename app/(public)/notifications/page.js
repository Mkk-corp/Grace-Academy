'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

function timeAgo(iso, isAr) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return isAr ? 'الآن' : 'just now'
  if (m < 60) return isAr ? `منذ ${m} د` : `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return isAr ? `منذ ${h} س` : `${h}h ago`
  return isAr ? `منذ ${Math.floor(h / 24)} ي` : `${Math.floor(h / 24)}d ago`
}

function getNavTarget(notif) {
  if (notif?.type === 'slot_request') return '/admin/requests'
  if (notif?.type === 'slot_request_resolved') return '/portal'
  return null
}

const STRINGS = {
  en: {
    title: 'Notifications',
    markAllRead: 'Mark all read',
    markRead: 'Mark read',
    viewLink: 'View →',
    unread: 'unread',
    new: 'new',
    empty: 'No notifications yet',
    emptyDesc: "You'll see updates here when schedule change requests are submitted or resolved.",
    loading: 'Loading…',
    all: 'All',
    unreadTab: 'Unread',
    readTab: 'Read',
  },
  ar: {
    title: 'الإشعارات',
    markAllRead: 'تحديد الكل كمقروء',
    markRead: 'تحديد كمقروء',
    viewLink: 'عرض ←',
    unread: 'غير مقروء',
    new: 'جديد',
    empty: 'لا توجد إشعارات بعد',
    emptyDesc: 'ستظهر هنا التحديثات عند تقديم طلبات تغيير الجدول أو البت فيها.',
    loading: 'جار التحميل…',
    all: 'الكل',
    unreadTab: 'غير مقروء',
    readTab: 'مقروء',
  },
}

function NotifIcon({ type, body }) {
  const isApproved = type === 'slot_request_resolved' && body?.includes('approved')
  const isRejected = type === 'slot_request_resolved' && !body?.includes('approved')
  if (isApproved) return (
    <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
  )
  if (isRejected) return (
    <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </div>
  )
  return (
    <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const { lang, dir } = useLang()
  const { theme } = useTheme()
  const isAr = lang === 'ar'
  const isDark = theme === 'dark'
  const s = STRINGS[lang] || STRINGS.en

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState('All')

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  async function markRead(id) {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function handleClick(notif) {
    if (!notif.read) await markRead(notif.id)
    const target = getNavTarget(notif)
    if (target) router.push(target)
  }

  const GOLD = '#c9932c'
  const unreadCount = notifications.filter(n => !n.read).length

  const filtered = filter === 'All' ? notifications
    : filter === 'Unread' ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read)

  // Theme-aware CSS vars — mirrors the portal (--as-*) token pattern
  const bg      = isDark ? '#0d1b24' : '#f0f4f8'
  const surface = isDark ? '#10222b' : '#ffffff'
  const border  = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(241,245,249,.5)' : '#6b7280'
  const xmuted  = isDark ? 'rgba(241,245,249,.28)' : '#9ca3af'
  const hoverBg = isDark ? 'rgba(255,255,255,.03)' : '#f9fafb'
  const shadow  = isDark ? '0 2px 20px rgba(0,0,0,.4)' : '0 2px 20px rgba(0,0,0,.08)'

  const TABS = [
    { key: 'All',    label: s.all    },
    { key: 'Unread', label: s.unreadTab },
    { key: 'Read',   label: s.readTab },
  ]

  return (
    <div dir={dir} style={{
      minHeight: '100vh',
      background: bg,
      paddingBottom: 80,
      fontFamily: isAr ? 'var(--font-tajawal, "Tajawal", sans-serif)' : 'var(--font-gotham, "Gotham", sans-serif)',
    }}>
      <style>{`
        @keyframes notifFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes notifSpin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: surface,
        borderBottom: `1px solid ${border}`,
        padding: '0 20px', height: 64,
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: isDark ? '0 1px 4px rgba(0,0,0,.35)' : '0 1px 4px rgba(0,0,0,.06)',
      }}>
        <button
          onClick={() => router.back()}
          aria-label={isAr ? 'رجوع' : 'Go back'}
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'none', border: `1px solid ${border}`,
            color: muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = text }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = muted }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {isAr
              ? <polyline points="9 18 15 12 9 6"/>
              : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        </button>

        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: text, flex: 1 }}>
          {s.title}
          {unreadCount > 0 && (
            <span style={{
              marginInlineStart: 10, padding: '1px 8px',
              background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.28)',
              borderRadius: 100, fontSize: '.68rem', fontWeight: 700, color: '#ef4444',
            }}>
              {unreadCount} {s.new}
            </span>
          )}
        </h1>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '.78rem', color: GOLD, fontWeight: 600,
              fontFamily: 'inherit', padding: '6px 10px', borderRadius: 8,
              transition: 'background .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(201,147,44,.1)' : 'rgba(201,147,44,.07)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          >
            {s.markAllRead}
          </button>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 0', animation: 'notifFadeUp .22s ease' }}>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map(tab => {
            const count = tab.key === 'All' ? notifications.length
              : tab.key === 'Unread' ? notifications.filter(n => !n.read).length
              : notifications.filter(n => n.read).length
            const active = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 100,
                  background: active ? GOLD : surface,
                  color: active ? '#fff' : muted,
                  border: `1px solid ${active ? GOLD : border}`,
                  fontWeight: active ? 700 : 500, fontSize: '.8rem',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span style={{
                    background: active ? 'rgba(255,255,255,.25)' : isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb',
                    borderRadius: 100, padding: '1px 7px', fontSize: '.68rem',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" style={{ animation: 'notifSpin 1s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 200, height: 160 }}>
              <Image src="/images/empty-page.svg" alt="" fill style={{ objectFit: 'contain', opacity: .9 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: text }}>
              {filter === 'Unread' ? (isAr ? 'لا توجد إشعارات غير مقروءة' : 'No unread notifications')
                : filter === 'Read' ? (isAr ? 'لا توجد إشعارات مقروءة' : 'No read notifications')
                : s.empty}
            </div>
            <div style={{ fontSize: '.85rem', color: muted, maxWidth: 300, lineHeight: 1.65 }}>
              {filter === 'All' ? s.emptyDesc : ''}
            </div>
          </div>
        ) : (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden', boxShadow: shadow }}>
            {filtered.map((notif, i) => {
              const isLast = i === filtered.length - 1
              const clickable = !!getNavTarget(notif)
              return (
                <div
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '18px 20px',
                    borderBottom: isLast ? 'none' : `1px solid ${border}`,
                    background: !notif.read ? (isDark ? 'rgba(201,147,44,.04)' : 'rgba(201,147,44,.03)') : 'transparent',
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => { if (clickable) e.currentTarget.style.background = hoverBg }}
                  onMouseLeave={e => { e.currentTarget.style.background = !notif.read ? (isDark ? 'rgba(201,147,44,.04)' : 'rgba(201,147,44,.03)') : 'transparent' }}
                >
                  {/* Unread dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 17,
                    background: !notif.read ? GOLD : 'transparent',
                    border: notif.read ? `1.5px solid ${border}` : 'none',
                  }} />

                  <NotifIcon type={notif.type} body={notif.body} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: !notif.read ? 700 : 600, fontSize: '.88rem', color: text, marginBottom: 4 }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '.82rem', color: muted, lineHeight: 1.6, marginBottom: 6 }}>
                      {notif.body}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '.72rem', color: xmuted }}>
                        {timeAgo(notif.createdAt, isAr)}
                      </span>
                      {!notif.read && (
                        <button
                          onClick={e => { e.stopPropagation(); markRead(notif.id) }}
                          style={{
                            background: 'none', border: `1px solid ${border}`, cursor: 'pointer',
                            fontSize: '.7rem', color: muted, fontFamily: 'inherit',
                            padding: '1px 8px', borderRadius: 5, transition: 'all .12s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = GOLD; e.currentTarget.style.borderColor = 'rgba(201,147,44,.3)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = muted; e.currentTarget.style.borderColor = border }}
                        >
                          {s.markRead}
                        </button>
                      )}
                      {clickable && (
                        <span style={{ fontSize: '.7rem', color: GOLD, fontWeight: 600 }}>{s.viewLink}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
