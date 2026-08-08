'use client'

import { useState, useEffect } from 'react'

function slotMinToTime(slotMin) {
  const h    = Math.floor(slotMin / 60)
  const m    = slotMin % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function isJoinable(date, slotMin) {
  const [y, mo, d] = date.split('-').map(Number)
  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const start = new Date(y, mo - 1, d, h, m, 0)
  const diffSecs = (start.getTime() - Date.now()) / 1000
  return diffSecs <= 300 && diffSecs >= -1800
}

export default function MySessions({ isAr, isDark }) {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [, setNow]              = useState(Date.now())

  useEffect(() => {
    fetch('/api/student/my-sessions')
      .then(r => r.ok ? r.json() : { sessions: [] })
      .then(d => { setSessions(d.sessions || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const border  = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'
  const surface = isDark ? '#10222b' : '#fff'
  const muted   = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const xmuted  = isDark ? 'rgba(255,255,255,.22)' : '#9ca3af'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const gold    = '#c9932c'
  const thBg    = isDark ? 'rgba(255,255,255,.02)' : '#fafafa'

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: muted }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', margin: '0 auto 14px',
        border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`,
        borderTopColor: gold, animation: 'msSpin .7s linear infinite',
      }}/>
      <style>{`@keyframes msSpin{to{transform:rotate(360deg)}}`}</style>
      {isAr ? 'جارٍ التحميل...' : 'Loading...'}
    </div>
  )

  if (sessions.length === 0) return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px',
        background: 'rgba(201,147,44,.08)', border: '1.5px dashed rgba(201,147,44,.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={gold} strokeWidth="1.8">
          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
        </svg>
      </div>
      <div style={{ fontWeight: 700, color: text, marginBottom: 6 }}>
        {isAr ? 'لا توجد جلسات بعد' : 'No sessions yet'}
      </div>
      <div style={{ fontSize: '.82rem', color: muted }}>
        {isAr ? 'ستظهر جلساتك هنا بعد حجز اختبار التحديد' : 'Your sessions will appear here once you book a placement test'}
      </div>
    </div>
  )

  const todayStr = new Date().toLocaleDateString('en-CA')
  const nowMin   = new Date().getHours() * 60 + new Date().getMinutes()

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: text, margin: '0 0 4px' }}>
          {isAr ? 'جلساتي' : 'My Sessions'}
        </h2>
        <p style={{ fontSize: '.82rem', color: muted, margin: 0 }}>
          {sessions.length} {isAr ? 'جلسة' : sessions.length === 1 ? 'session' : 'sessions'}
        </p>
      </div>

      <div style={{
        background: surface, border: `1px solid ${border}`,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: isDark ? '0 1px 4px rgba(0,0,0,.35)' : '0 1px 3px rgba(0,0,0,.07)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                {[
                  isAr ? 'النوع' : 'Type',
                  isAr ? 'التاريخ' : 'Date',
                  isAr ? 'الوقت' : 'Time',
                  isAr ? 'المستشار الأكاديمي' : 'Academic Consultant',
                  isAr ? 'الحالة' : 'Status',
                  isAr ? 'الإجراء' : 'Action',
                ].map((h, i) => (
                  <th key={i} style={{
                    padding: '12px 16px',
                    textAlign: i >= 4 ? 'center' : (isAr ? 'right' : 'left'),
                    fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', color: xmuted,
                    background: thBg, borderBottom: `1px solid ${border}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => {
                const joinable = isJoinable(s.date, s.slotMin)
                const isPast   = s.date < todayStr || (s.date === todayStr && s.slotMin < nowMin - 30)
                const rowBg    = i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,.015)' : 'rgba(0,0,0,.012)')

                return (
                  <tr key={s.id} style={{ background: rowBg }}>
                    {/* Type */}
                    <td style={{ padding: '13px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}` }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 100,
                        background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)',
                        color: gold, fontSize: '.7rem', fontWeight: 700, whiteSpace: 'nowrap',
                      }}>
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke={gold} strokeWidth="2.5">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                          <rect x="8" y="2" width="8" height="4" rx="1"/>
                        </svg>
                        {isAr ? 'اختبار التحديد' : 'Placement Test'}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '13px 16px', fontSize: '.85rem', color: text, fontWeight: 600, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}` }}>
                      {s.date}
                    </td>

                    {/* Time */}
                    <td style={{ padding: '13px 16px', fontSize: '.85rem', color: muted, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}` }}>
                      {slotMinToTime(s.slotMin)}
                    </td>

                    {/* Assessor name */}
                    <td style={{ padding: '13px 16px', fontSize: '.85rem', color: text, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}` }}>
                      {s.assessorName || '—'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '13px 16px', textAlign: 'center', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}` }}>
                      {joinable ? (
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 100,
                          background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)',
                          color: '#10b981', fontSize: '.7rem', fontWeight: 700,
                        }}>
                          {isAr ? 'جارٍ الآن' : 'Live Now'}
                        </span>
                      ) : isPast ? (
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 100,
                          background: isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6',
                          color: xmuted, fontSize: '.7rem', fontWeight: 700,
                        }}>
                          {isAr ? 'منتهية' : 'Completed'}
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 100,
                          background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.3)',
                          color: gold, fontSize: '.7rem', fontWeight: 700,
                        }}>
                          {isAr ? 'قادمة' : 'Upcoming'}
                        </span>
                      )}
                    </td>

                    {/* Join Now */}
                    <td style={{ padding: '13px 16px', textAlign: 'center', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}` }}>
                      {s.meetLink ? (
                        <a
                          href={joinable ? s.meetLink : undefined}
                          target={joinable ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          onClick={joinable ? undefined : e => e.preventDefault()}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 16px', borderRadius: 8, textDecoration: 'none',
                            background: joinable
                              ? 'linear-gradient(135deg, #c9932c, #ae6d0c)'
                              : (isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6'),
                            color: joinable ? '#fff' : xmuted,
                            fontSize: '.78rem', fontWeight: 700,
                            cursor: joinable ? 'pointer' : 'not-allowed',
                            boxShadow: joinable ? '0 2px 8px rgba(201,147,44,.35)' : 'none',
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                          </svg>
                          {isAr ? 'انضم الآن' : 'Join Now'}
                        </a>
                      ) : (
                        <span style={{ color: xmuted, fontSize: '.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
