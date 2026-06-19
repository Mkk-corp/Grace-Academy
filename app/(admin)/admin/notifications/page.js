'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EmptyState from '@/components/ui/EmptyState'

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

function NotifIcon({ type, body }) {
  const isApproved = type === 'slot_request_resolved' && body?.includes('approved')
  const isRejected = type === 'slot_request_resolved' && !body?.includes('approved')

  if (isApproved) return (
    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
  )
  if (isRejected) return (
    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </div>
  )
  return (
    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
    </div>
  )
}

const FILTERS = ['All', 'Unread', 'Read']

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState('All')
  const [toast, setToast]                 = useState(null)

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

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

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
    showToast('All notifications marked as read')
  }

  async function handleClick(notif) {
    if (!notif.read) await markRead(notif.id)
    const target = getNavTarget(notif)
    if (target) router.push(target)
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = filter === 'All' ? notifications
    : filter === 'Unread' ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read)

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#10b981', color: '#fff', padding: '12px 20px',
          borderRadius: 10, fontWeight: 600, fontSize: '.84rem',
          boxShadow: '0 8px 32px rgba(0,0,0,.2)', animation: 'adToast .2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="admin-header">
        <div>
          <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--gold)', marginBottom: 4 }}>SYSTEM</div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                padding: '2px 10px', background: 'rgba(239,68,68,.12)',
                border: '1px solid rgba(239,68,68,.28)', borderRadius: 100,
                fontSize: '.72rem', fontWeight: 700, color: '#ef4444',
              }}>
                {unreadCount} unread
              </span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button className="admin-btn" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const count = f === 'All' ? notifications.length
            : f === 'Unread' ? notifications.filter(n => !n.read).length
            : notifications.filter(n => n.read).length
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="admin-btn"
              style={{
                background: active ? 'var(--gold)' : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-60)',
                borderColor: active ? 'var(--gold)' : 'var(--border)',
                fontWeight: active ? 700 : 500,
              }}
            >
              {f}
              {count > 0 && (
                <span style={{
                  background: active ? 'rgba(255,255,255,.25)' : 'var(--accent-dim)',
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
        <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-40)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === 'Unread' ? 'No unread notifications' : filter === 'Read' ? 'No read notifications' : 'No notifications yet'}
          description={filter === 'All' ? 'Notifications about slot change requests and system events will appear here.' : `No ${filter.toLowerCase()} notifications at the moment.`}
        />
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
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
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  background: !notif.read ? 'rgba(201,147,44,.03)' : 'transparent',
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { if (clickable) e.currentTarget.style.background = 'rgba(201,147,44,.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = !notif.read ? 'rgba(201,147,44,.03)' : 'transparent' }}
              >
                {/* Unread dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 16,
                  background: !notif.read ? '#c9932c' : 'transparent',
                  border: notif.read ? '1.5px solid var(--border)' : 'none',
                }} />

                <NotifIcon type={notif.type} body={notif.body} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: notif.read ? 600 : 700, fontSize: '.9rem', color: 'var(--text)', marginBottom: 4 }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-60)', lineHeight: 1.6, marginBottom: 6 }}>
                    {notif.body}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.72rem', color: 'var(--text-40)' }}>{timeAgo(notif.createdAt)}</span>
                    {!notif.read && (
                      <button
                        onClick={e => { e.stopPropagation(); markRead(notif.id) }}
                        className="admin-btn"
                        style={{ padding: '2px 8px', fontSize: '.7rem' }}
                      >
                        Mark read
                      </button>
                    )}
                    {clickable && (
                      <span style={{ fontSize: '.72rem', color: '#c9932c', fontWeight: 700 }}>View →</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
