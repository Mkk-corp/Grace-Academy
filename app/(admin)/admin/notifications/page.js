'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'
import { localizeNotification } from '@/lib/notificationStrings'

function timeAgo(iso, isAr) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return isAr ? 'الآن' : 'just now'
  if (m < 60) return isAr ? `منذ ${m} د` : `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return isAr ? `منذ ${h} س` : `${h}h ago`
  return isAr ? `منذ ${Math.floor(h / 24)} ي` : `${Math.floor(h / 24)}d ago`
}

const NS = {
  en: {
    title: 'Notifications', unread: 'unread',
    markAllRead: 'Mark all read', markRead: 'Mark read',
    filterAll: 'All', filterUnread: 'Unread', filterRead: 'Read',
    viewLink: 'View →',
    emptyAll: 'No notifications yet', emptyAllDesc: 'Notifications about slot change requests and system events will appear here.',
    emptyUnread: 'No unread notifications', emptyRead: 'No read notifications',
    emptyOtherDesc: 'No notifications in this category at the moment.',
    toastRead: 'All notifications marked as read',
  },
  ar: {
    title: 'الإشعارات', unread: 'غير مقروء',
    markAllRead: 'تحديد الكل كمقروء', markRead: 'تحديد كمقروء',
    filterAll: 'الكل', filterUnread: 'غير مقروء', filterRead: 'مقروء',
    viewLink: 'عرض ←',
    emptyAll: 'لا توجد إشعارات بعد', emptyAllDesc: 'ستظهر هنا الإشعارات المتعلقة بطلبات تغيير الجدول وأحداث النظام.',
    emptyUnread: 'لا توجد إشعارات غير مقروءة', emptyRead: 'لا توجد إشعارات مقروءة',
    emptyOtherDesc: 'لا توجد إشعارات في هذه الفئة حالياً.',
    toastRead: 'تم تحديد كل الإشعارات كمقروءة',
  },
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

export default function AdminNotificationsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const ns = NS[lang] || NS.en
  const FILTERS = [
    { key: 'All',    label: ns.filterAll },
    { key: 'Unread', label: ns.filterUnread },
    { key: 'Read',   label: ns.filterRead },
  ]
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
    showToast(ns.toastRead)
  }

  async function handleClick(notif) {
    if (!notif.read) await markRead(notif.id)
    const target = getNavTarget(notif)
    if (target) router.push(target)
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = filter === 'All'    ? notifications
    : filter === 'Unread' ? notifications.filter(n => !n.read)
    :                       notifications.filter(n => n.read)

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
          <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--gold)', marginBottom: 4 }}>
            {isAr ? 'النظام' : 'SYSTEM'}
          </div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {ns.title}
            {unreadCount > 0 && (
              <span style={{
                padding: '2px 10px', background: 'rgba(239,68,68,.12)',
                border: '1px solid rgba(239,68,68,.28)', borderRadius: 100,
                fontSize: '.72rem', fontWeight: 700, color: '#ef4444',
              }}>
                {unreadCount} {ns.unread}
              </span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button className="admin-btn" onClick={markAllRead}>
            {ns.markAllRead}
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(({ key, label }) => {
          const count = key === 'All'    ? notifications.length
            : key === 'Unread' ? notifications.filter(n => !n.read).length
            :                    notifications.filter(n => n.read).length
          const active = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="admin-btn"
              style={{
                background: active ? 'var(--gold)' : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-60)',
                borderColor: active ? 'var(--gold)' : 'var(--border)',
                fontWeight: active ? 700 : 500,
              }}
            >
              {label}
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
        <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-40)' }}>{isAr ? 'جارٍ التحميل…' : 'Loading…'}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === 'Unread' ? ns.emptyUnread : filter === 'Read' ? ns.emptyRead : ns.emptyAll}
          description={filter === 'All' ? ns.emptyAllDesc : ns.emptyOtherDesc}
        />
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {filtered.map((notif, i) => {
            const isLast = i === filtered.length - 1
            const clickable = !!getNavTarget(notif)
            const { title: lTitle, body: lBody } = localizeNotification(notif, lang)
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
                    {lTitle}
                  </div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-60)', lineHeight: 1.6, marginBottom: 6 }}>
                    {lBody}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.72rem', color: 'var(--text-40)' }}>{timeAgo(notif.createdAt, isAr)}</span>
                    {!notif.read && (
                      <button
                        onClick={e => { e.stopPropagation(); markRead(notif.id) }}
                        className="admin-btn"
                        style={{ padding: '2px 8px', fontSize: '.7rem' }}
                      >
                        {ns.markRead}
                      </button>
                    )}
                    {clickable && (
                      <span style={{ fontSize: '.72rem', color: '#c9932c', fontWeight: 700 }}>{ns.viewLink}</span>
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
