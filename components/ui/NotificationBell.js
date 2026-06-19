'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function getNavTarget(notif) {
  const t = notif?.type
  if (t === 'slot_request') return '/admin/requests'
  if (t === 'slot_request_resolved') return '/assessor'
  return null
}

export default function NotificationBell({ isDark, isAr, userId }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)
  const intervalRef = useRef(null)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnread(data.unreadCount || 0)
    } catch {}
  }, [])

  useEffect(() => {
    fetch_()
    intervalRef.current = setInterval(fetch_, 60000)
    return () => clearInterval(intervalRef.current)
  }, [fetch_])

  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  async function markAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)
    } catch {}
  }

  async function markRead(id) {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  async function handleNotifClick(notif) {
    if (!notif.read) await markRead(notif.id)
    const target = getNavTarget(notif)
    if (target) router.push(target)
    setOpen(false)
  }

  // Colors
  const surface = isDark ? '#10222b' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'
  const text = isDark ? '#f1f5f9' : '#111827'
  const muted = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const xmuted = isDark ? 'rgba(255,255,255,.22)' : '#9ca3af'
  const hoverBg = isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'
  const shadow = isDark ? '0 8px 32px rgba(0,0,0,.5)' : '0 8px 32px rgba(0,0,0,.12)'
  const GOLD = '#c9932c'

  const displayed = notifications.slice(0, 10)

  return (
    <>
      <style>{`
        @keyframes nbFadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes nbBadgePop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
      `}</style>

      <div ref={dropRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Notifications"
          style={{
            position: 'relative',
            width: 36, height: 36, borderRadius: 9,
            background: 'none', border: `1px solid ${border}`,
            color: muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = text }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = muted }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: '#fff',
              borderRadius: 100, minWidth: 16, height: 16,
              fontSize: '.58rem', fontWeight: 800, lineHeight: '16px',
              textAlign: 'center', padding: '0 4px',
              animation: 'nbBadgePop .25s ease',
              border: `2px solid ${surface}`,
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            [isAr ? 'left' : 'right']: 0,
            top: 'calc(100% + 8px)',
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 14,
            width: 320,
            maxWidth: 'calc(100vw - 24px)',
            boxShadow: shadow,
            zIndex: 500,
            animation: 'nbFadeUp .18s ease',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem', color: text }}>
                  {isAr ? 'الإشعارات' : 'Notifications'}
                </span>
                {unread > 0 && (
                  <span style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)', color: '#ef4444', borderRadius: 100, padding: '1px 7px', fontSize: '.65rem', fontWeight: 700 }}>
                    {unread} {isAr ? 'جديد' : 'new'}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '.72rem', color: GOLD, fontWeight: 600, fontFamily: 'inherit', padding: '2px 6px' }}
                >
                  {isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div style={{ maxHeight: 380, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: `${border} transparent` }}>
              {displayed.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(201,147,44,.08)', border: '1px solid rgba(201,147,44,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <div style={{ fontSize: '.82rem', color: xmuted }}>{isAr ? 'لا توجد إشعارات' : 'No notifications yet'}</div>
                </div>
              ) : (
                displayed.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '12px 16px',
                      cursor: getNavTarget(notif) ? 'pointer' : 'default',
                      background: !notif.read ? (isDark ? 'rgba(201,147,44,.05)' : 'rgba(201,147,44,.03)') : 'transparent',
                      borderBottom: `1px solid ${border}`,
                      transition: 'background .12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = !notif.read ? (isDark ? 'rgba(201,147,44,.05)' : 'rgba(201,147,44,.03)') : 'transparent'}
                  >
                    {/* Unread dot */}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: !notif.read ? GOLD : 'transparent', border: notif.read ? `1.5px solid ${border}` : 'none', marginTop: 5, flexShrink: 0 }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '.82rem', fontWeight: notif.read ? 500 : 700, color: text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '.74rem', color: muted, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {notif.body}
                      </div>
                      <div style={{ fontSize: '.65rem', color: xmuted, marginTop: 4 }}>
                        {timeAgo(notif.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* View all footer */}
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '12px 16px', textDecoration: 'none',
                borderTop: `1px solid ${border}`,
                fontSize: '.78rem', fontWeight: 600, color: GOLD,
                transition: 'background .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(201,147,44,.06)' : 'rgba(201,147,44,.04)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {isAr ? 'عرض كل الإشعارات' : 'View all notifications'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
