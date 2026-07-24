'use client'

import { useState, useEffect, useRef } from 'react'

function slotMinToTime(slotMin) {
  const h    = Math.floor(slotMin / 60)
  const m    = slotMin % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatCountdown(secs) {
  if (secs <= 0) return ''
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (d > 0) return `${d}d ${h}h ${String(m).padStart(2,'0')}m`
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function UpcomingSession({ isAr, isDark }) {
  const [booking, setBooking]   = useState(null)
  const [secsLeft, setSecsLeft] = useState(null)
  const [status, setStatus]     = useState('upcoming') // 'upcoming' | 'soon' | 'now' | 'ended'
  const [canJoin, setCanJoin]   = useState(false)
  const reminderFiredRef        = useRef(false)
  const emailReminderFiredRef   = useRef(false)

  useEffect(() => {
    fetch('/api/placement/upcoming')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.booking) setBooking(d.booking) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!booking) return

    const [y, mo, d] = booking.date.split('-').map(Number)
    const h = Math.floor(booking.slotMin / 60)
    const m = booking.slotMin % 60
    const sessionStart = new Date(y, mo - 1, d, h, m, 0)

    const tick = () => {
      const diff = Math.floor((sessionStart.getTime() - Date.now()) / 1000)
      setSecsLeft(diff)

      if (diff > 300) {
        setStatus('upcoming')
        setCanJoin(false)
      } else if (diff > 0) {
        setStatus('soon')
        setCanJoin(true)
        // 5-min email reminder
        if (!emailReminderFiredRef.current && !booking.emailReminderSent) {
          emailReminderFiredRef.current = true
          fetch('/api/placement/reminder-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id }),
          }).catch(() => {})
        }
        // 3-min in-app reminder
        if (diff <= 180 && !reminderFiredRef.current && !booking.reminderSent) {
          reminderFiredRef.current = true
          fetch('/api/placement/reminder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id }),
          }).catch(() => {})
        }
      } else if (diff >= -1800) {
        setStatus('now')
        setCanJoin(true)
      } else {
        setStatus('ended')
        setCanJoin(false)
      }
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [booking])

  if (!booking || status === 'ended') return null

  const gold      = '#c9932c'
  const isNow     = status === 'now'
  const isSoon    = status === 'soon'
  const accentClr = isNow ? '#10b981' : gold
  const borderClr = (isNow || isSoon)
    ? `rgba(${isNow ? '16,185,129' : '201,147,44'},.4)`
    : (isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb')

  const timeLabel = slotMinToTime(booking.slotMin)
  const dateLabel = new Date(booking.date + 'T12:00:00').toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  const statusLabel = isNow
    ? (isAr ? 'جلسة جارية الآن' : 'SESSION IN PROGRESS')
    : isSoon
    ? (isAr ? 'تبدأ خلال دقائق' : 'STARTING SOON')
    : (isAr ? 'الجلسة القادمة' : 'UPCOMING SESSION')

  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,.04)' : '#fff',
      border: `1.5px solid ${borderClr}`,
      borderRadius: 14, padding: '18px 20px', marginBottom: 20,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.35)' : '0 1px 8px rgba(0,0,0,.07)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `rgba(${isNow ? '16,185,129' : '201,147,44'},.1)`,
          border: `1px solid rgba(${isNow ? '16,185,129' : '201,147,44'},.3)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={accentClr} strokeWidth="1.8">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
        </div>
        <div>
          <div style={{
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em',
            color: accentClr, marginBottom: 3,
          }}>
            {statusLabel}
          </div>
          <div style={{ fontSize: '.92rem', fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827' }}>
            {dateLabel} — {timeLabel}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {status !== 'now' && secsLeft !== null && secsLeft > 0 && (
          <div style={{
            fontVariantNumeric: 'tabular-nums',
            fontSize: isSoon ? '1.1rem' : '.92rem',
            fontWeight: 800,
            color: isSoon ? gold : isDark ? 'rgba(255,255,255,.55)' : '#6b7280',
            fontFamily: 'monospace',
          }}>
            {formatCountdown(secsLeft)}
          </div>
        )}

        {booking.meetLink ? (
          <a
            href={canJoin ? booking.meetLink : undefined}
            target={canJoin ? '_blank' : undefined}
            rel="noopener noreferrer"
            onClick={canJoin ? undefined : e => e.preventDefault()}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 9, textDecoration: 'none',
              background: canJoin ? '#1a73e8' : (isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6'),
              color: canJoin ? '#fff' : (isDark ? 'rgba(255,255,255,.22)' : '#9ca3af'),
              fontWeight: 700, fontSize: '.82rem',
              cursor: canJoin ? 'pointer' : 'not-allowed',
              transition: 'all .15s',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            {isAr ? 'انضم' : 'Join'}
          </a>
        ) : null}
      </div>
    </div>
  )
}
