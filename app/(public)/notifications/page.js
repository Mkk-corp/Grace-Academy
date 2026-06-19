'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
  if (notif?.type === 'slot_request') return '/admin/requests'
  if (notif?.type === 'slot_request_resolved') return '/assessor'
  return null
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(true)

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  async function markRead(id) {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  async function handleClick(notif) {
    if (!notif.read) await markRead(notif.id)
    const target = getNavTarget(notif)
    if (target) router.push(target)
  }

  const GOLD = '#c9932c'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--as-bg, #0d1b24)',
      padding: '0 0 80px',
      fontFamily: 'var(--font-gotham, "Gotham", sans-serif)',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--as-surface, #10222b)',
        borderBottom: '1px solid var(--as-border, rgba(255,255,255,.07))',
        padding: '0 20px', height: 64,
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,.35)',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'none', border: '1px solid var(--as-border, rgba(255,255,255,.07))',
            color: 'var(--as-muted, rgba(241,245,249,.45))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'var(--as-text, #f1f5f9)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--as-muted, rgba(241,245,249,.45))' }}
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--as-text, #f1f5f9)', flex: 1 }}>
          Notifications
          {unreadCount > 0 && (
            <span style={{
              marginLeft: 10, padding: '1px 8px',
              background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
              borderRadius: 100, fontSize: '.68rem', fontWeight: 700, color: '#ef4444',
            }}>
              {unreadCount} new
            </span>
          )}
        </h1>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '.78rem', color: GOLD, fontWeight: 600,
              fontFamily: 'inherit', padding: '6px 10px',
              borderRadius: 8, transition: 'background .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,147,44,.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 0' }}>
        {loading ? (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" style={{ animation: 'nSpin 1s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
            </svg>
            <style>{`@keyframes nSpin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 200, height: 160 }}>
              <Image src="/images/empty-page.svg" alt="" fill style={{ objectFit: 'contain', opacity: .9 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--as-text, #f1f5f9)' }}>No notifications yet</div>
            <div style={{ fontSize: '.85rem', color: 'var(--as-muted, rgba(241,245,249,.45))', maxWidth: 300, lineHeight: 1.65 }}>
              You'll see updates here when slot change requests are submitted or resolved.
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--as-surface, #10222b)',
            border: '1px solid var(--as-border, rgba(255,255,255,.07))',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 2px 20px rgba(0,0,0,.3)',
          }}>
            {notifications.map((notif, i) => {
              const isLast = i === notifications.length - 1
              const clickable = !!getNavTarget(notif)
              return (
                <div
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '18px 20px',
                    borderBottom: isLast ? 'none' : '1px solid var(--as-border, rgba(255,255,255,.07))',
                    background: !notif.read ? 'rgba(201,147,44,.04)' : 'transparent',
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => { if (clickable) e.currentTarget.style.background = 'rgba(255,255,255,.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = !notif.read ? 'rgba(201,147,44,.04)' : 'transparent' }}
                >
                  {/* Unread dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                    background: !notif.read ? GOLD : 'transparent',
                    border: notif.read ? '1.5px solid var(--as-border, rgba(255,255,255,.07))' : 'none',
                  }} />

                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: notif.type === 'slot_request_resolved'
                      ? (notif.body?.includes('approved') ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.1)')
                      : 'rgba(201,147,44,.1)',
                    border: `1px solid ${notif.type === 'slot_request_resolved'
                      ? (notif.body?.includes('approved') ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.25)')
                      : 'rgba(201,147,44,.22)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {notif.type === 'slot_request_resolved' && notif.body?.includes('approved') ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : notif.type === 'slot_request_resolved' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: !notif.read ? 700 : 600,
                      fontSize: '.88rem',
                      color: 'var(--as-text, #f1f5f9)',
                      marginBottom: 4,
                    }}>
                      {notif.title}
                    </div>
                    <div style={{
                      fontSize: '.82rem',
                      color: 'var(--as-muted, rgba(241,245,249,.45))',
                      lineHeight: 1.6,
                      marginBottom: 6,
                    }}>
                      {notif.body}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '.72rem', color: 'rgba(201,147,44,.6)' }}>
                        {timeAgo(notif.createdAt)}
                      </span>
                      {!notif.read && (
                        <button
                          onClick={e => { e.stopPropagation(); markRead(notif.id) }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '.7rem', color: 'var(--as-muted, rgba(241,245,249,.45))',
                            fontFamily: 'inherit', padding: '1px 6px',
                            borderRadius: 5, border: '1px solid var(--as-border, rgba(255,255,255,.07))',
                            transition: 'all .12s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = GOLD; e.currentTarget.style.borderColor = 'rgba(201,147,44,.3)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--as-muted, rgba(241,245,249,.45))'; e.currentTarget.style.borderColor = 'var(--as-border, rgba(255,255,255,.07))' }}
                        >
                          Mark read
                        </button>
                      )}
                      {clickable && (
                        <span style={{ fontSize: '.7rem', color: GOLD, fontWeight: 600 }}>
                          View →
                        </span>
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
