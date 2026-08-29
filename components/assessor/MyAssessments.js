'use client'

import { useState, useEffect, useRef } from 'react'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import TableToolbar from '@/components/ui/TableToolbar'

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

function sessionEndedMs(date, slotMin) {
  const [y, mo, d] = date.split('-').map(Number)
  const h = Math.floor(slotMin / 60)
  const m = slotMin % 60
  const end = new Date(y, mo - 1, d, h, m + 30, 0)
  return Date.now() - end.getTime()
}

/* ─── Recording Modal ───────────────────────────────────────────────────── */
function RecordingModal({ booking, onClose, onSaved, isAr, isDark }) {
  const [link,    setLink]    = useState(booking.recordingLink || '')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const gold  = '#c9932c'
  const text  = isDark ? '#f1f5f9'  : '#111827'
  const muted = isDark ? 'rgba(241,245,249,.6)' : '#6b7280'
  const bg    = isDark ? '#10222b'  : '#fff'
  const surf2 = isDark ? '#0a1820'  : '#f9fafb'
  const bord  = isDark ? 'rgba(255,255,255,.09)' : 'rgba(28,36,51,.09)'

  async function save() {
    if (!link.trim()) { setError(isAr ? 'الرجاء إدخال الرابط' : 'Please enter a link'); return }
    try { new URL(link.trim()) } catch {
      setError(isAr ? 'الرجاء إدخال رابط صحيح' : 'Please enter a valid URL'); return
    }
    setSaving(true); setError('')
    try {
      const res  = await fetch('/api/assessor/assessments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, recordingLink: link.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save'); return }
      onSaved(booking.id, data.recordingLink)
    } catch {
      setError(isAr ? 'خطأ في الاتصال' : 'Connection error')
    } finally {
      setSaving(false)
    }
  }

  const isAutoPrompt = !booking.recordingLink

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        animation: 'recFadeIn .18s ease',
      }}
    >
      <style>{`@keyframes recFadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}`}</style>
      <div style={{
        background: bg, borderRadius: 20, width: '100%', maxWidth: 500,
        boxShadow: isDark ? '0 24px 80px rgba(0,0,0,.6)' : '0 24px 60px rgba(0,0,0,.15)',
        border: `1px solid ${bord}`, overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          background: isAutoPrompt
            ? (isDark ? 'rgba(201,147,44,.1)' : 'rgba(201,147,44,.06)')
            : surf2,
          borderBottom: `1px solid ${bord}`,
          padding: '20px 24px',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(201,147,44,.15)', border: '1.5px solid rgba(201,147,44,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: gold, marginBottom: 4 }}>
              {isAr ? 'اكتملت الجلسة' : 'SESSION COMPLETED'}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: text, marginBottom: 3 }}>
              {isAr ? 'أضف رابط التسجيل' : 'Add Recording Link'}
            </div>
            <div style={{ fontSize: '.8rem', color: muted }}>
              {booking.studentName} · {booking.date} · {slotMinToTime(booking.slotMin)}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: muted,
            padding: 4, lineHeight: 0, borderRadius: 6, flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 20px' }}>
          {isAutoPrompt && (
            <div style={{
              background: isDark ? 'rgba(201,147,44,.07)' : 'rgba(201,147,44,.05)',
              border: '1px solid rgba(201,147,44,.2)', borderRadius: 10,
              padding: '11px 14px', marginBottom: 18, fontSize: '.82rem', color: muted, lineHeight: 1.5,
            }}>
              {isAr
                ? 'لقد اكتملت جلسة التقييم. يُرجى إضافة رابط التسجيل حتى يتمكن الطالب من مراجعة الجلسة.'
                : 'The assessment session has ended. Please add the recording link so the student can review their session.'}
            </div>
          )}

          <label style={{
            display: 'block', fontSize: '.72rem', fontWeight: 700,
            letterSpacing: '.08em', textTransform: 'uppercase', color: muted, marginBottom: 8,
          }}>
            {isAr ? 'رابط التسجيل' : 'Recording Link'}
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', display: 'flex', alignItems: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <input
              ref={inputRef}
              type="url"
              value={link}
              onChange={e => { setLink(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="https://..."
              style={{
                width: '100%', padding: '11px 12px 11px 36px',
                background: surf2, border: `1.5px solid ${error ? '#ef4444' : bord}`,
                borderRadius: 10, color: text, fontSize: '.88rem',
                fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s',
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = gold }}
              onBlur={e => { if (!error) e.target.style.borderColor = bord }}
            />
          </div>
          {error && (
            <div style={{ fontSize: '.78rem', color: '#ef4444', marginTop: 6, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{
              padding: '9px 20px', borderRadius: 10, border: `1px solid ${bord}`,
              background: 'none', color: muted, fontSize: '.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {isAr ? 'لاحقاً' : 'Later'}
            </button>
            <button onClick={save} disabled={saving} style={{
              padding: '9px 24px', borderRadius: 10, border: 'none',
              background: saving ? (isDark ? 'rgba(255,255,255,.08)' : '#f3f4f6') : gold,
              color: saving ? muted : '#fff', fontSize: '.85rem', fontWeight: 700,
              cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
              boxShadow: saving ? 'none' : '0 3px 14px rgba(201,147,44,.4)',
              transition: 'all .15s',
            }}>
              {saving
                ? (isAr ? 'جارٍ الحفظ…' : 'Saving…')
                : (isAr ? 'حفظ الرابط' : 'Save Link')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function MyAssessments({ isAr, isDark }) {
  const [assessments,    setAssessments]    = useState([])
  const [loading,        setLoading]        = useState(true)
  const [now,            setNow]            = useState(Date.now())
  const [recordingModal, setRecordingModal] = useState(null)
  const [page, setPage]                     = useState(1)
  const [dateFrom, setDateFrom]             = useState('')
  const [dateTo, setDateTo]                 = useState('')
  const autoPromptedRef = useRef(false)

  useEffect(() => {
    fetch('/api/assessor/assessments')
      .then(r => r.ok ? r.json() : { assessments: [] })
      .then(d => {
        const list = d.assessments || []
        setAssessments(list)
        setLoading(false)
        // Auto-prompt for sessions that ended within the last 24 hours with no recording link
        if (!autoPromptedRef.current) {
          const prompt = list.find(a => {
            const ms = sessionEndedMs(a.date, a.slotMin)
            return ms > 0 && ms < 24 * 60 * 60 * 1000 && !a.recordingLink
          })
          if (prompt) { setRecordingModal(prompt); autoPromptedRef.current = true }
        }
      })
      .catch(() => setLoading(false))
  }, [])

  // Refresh joinable state every 30 seconds
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  function handleSaved(bookingId, newLink) {
    setAssessments(prev => prev.map(a => a.id === bookingId ? { ...a, recordingLink: newLink } : a))
    setRecordingModal(null)
  }

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
        borderTopColor: gold, animation: 'maSpin .7s linear infinite',
      }}/>
      <style>{`@keyframes maSpin{to{transform:rotate(360deg)}}`}</style>
      {isAr ? 'جارٍ التحميل...' : 'Loading...'}
    </div>
  )

  if (assessments.length === 0) return (
    <div style={{ padding: '28px 24px' }}>
      <EmptyState
        isAdmin={false}
        title={isAr ? 'لا توجد جلسات بعد' : 'No sessions yet'}
        description={isAr ? 'ستظهر الجلسات هنا بعد حجزها.' : 'Sessions will appear here once they are booked.'}
      />
    </div>
  )

  const todayStr = new Date().toLocaleDateString('en-CA')

  const filteredAssessments = assessments.filter(a => {
    if (dateFrom && a.date < dateFrom) return false
    if (dateTo   && a.date > dateTo)   return false
    return true
  })

  const maExportCols = [
    { header: 'Date',      value: r => r.date },
    { header: 'Time',      value: r => slotMinToTime(r.slotMin) },
    { header: 'Student',   value: r => r.studentName || '' },
    { header: 'Status',    value: r => r.date < todayStr ? 'Completed' : 'Upcoming' },
    { header: 'Recording', value: r => r.recordingLink || '' },
  ]

  return (
    <>
      {recordingModal && (
        <RecordingModal
          booking={recordingModal}
          onClose={() => setRecordingModal(null)}
          onSaved={handleSaved}
          isAr={isAr}
          isDark={isDark}
        />
      )}

      <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: text, margin: '0 0 4px' }}>
            {isAr ? 'جلساتي' : 'My Sessions'}
          </h2>
          <p style={{ fontSize: '.82rem', color: muted, margin: 0 }}>
            {assessments.length} {isAr ? 'جلسة' : assessments.length === 1 ? 'session' : 'sessions'}
          </p>
        </div>

        <TableToolbar
          isDark={isDark} isAr={isAr}
          dateFrom={dateFrom} dateTo={dateTo}
          onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1) }}
          exportData={filteredAssessments}
          exportCols={maExportCols}
          exportFilename="my-assessments"
          exportTitle="My Assessment Sessions"
        />

        <div style={{
          background: surface, border: `1px solid ${border}`,
          borderRadius: 14, overflow: 'hidden',
          boxShadow: isDark ? '0 1px 4px rgba(0,0,0,.35)' : '0 1px 3px rgba(0,0,0,.07)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
              <thead>
                <tr>
                  {[
                    isAr ? 'النوع'    : 'Type',
                    isAr ? 'التاريخ'  : 'Date',
                    isAr ? 'الوقت'    : 'Time',
                    isAr ? 'الطالب'   : 'Student',
                    isAr ? 'الحالة'   : 'Status',
                    isAr ? 'الانضمام' : 'Join',
                    isAr ? 'التسجيل'  : 'Recording',
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
                {filteredAssessments.slice((page-1)*25, page*25).map((a, i) => {
                  const joinable = isJoinable(a.date, a.slotMin)
                  const isPast   = a.date < todayStr || (a.date === todayStr && a.slotMin < new Date().getHours() * 60 + new Date().getMinutes() - 30)
                  const rowBg    = i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,.015)' : 'rgba(0,0,0,.012)')
                  const cellBorder = `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}`

                  return (
                    <tr key={a.id} style={{ background: rowBg }}>
                      {/* Type badge */}
                      <td style={{ padding: '13px 16px', borderBottom: cellBorder }}>
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

                      <td style={{ padding: '13px 16px', fontSize: '.85rem', color: text, fontWeight: 600, borderBottom: cellBorder }}>
                        {a.date}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '.85rem', color: muted, borderBottom: cellBorder }}>
                        {slotMinToTime(a.slotMin)}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '.85rem', color: text, borderBottom: cellBorder }}>
                        {a.studentName}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '13px 16px', textAlign: 'center', borderBottom: cellBorder }}>
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

                      {/* Join */}
                      <td style={{ padding: '13px 16px', textAlign: 'center', borderBottom: cellBorder }}>
                        {a.meetLink ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <a
                              href={joinable ? a.meetLink : undefined}
                              target={joinable ? '_blank' : undefined}
                              rel="noopener noreferrer"
                              onClick={joinable ? undefined : e => e.preventDefault()}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
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
                              {isAr ? 'انضم' : 'Join'}
                            </a>
                            {joinable && (
                              <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.08em', color: gold }}>
                                {isAr ? 'أنت المضيف' : 'YOU ARE THE HOST'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: xmuted, fontSize: '.8rem' }}>—</span>
                        )}
                      </td>

                      {/* Recording */}
                      <td style={{ padding: '13px 16px', textAlign: 'center', borderBottom: cellBorder }}>
                        {a.recordingLink ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <a
                              href={a.recordingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '5px 12px', borderRadius: 8, textDecoration: 'none',
                                background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)',
                                color: '#8b5cf6', fontSize: '.75rem', fontWeight: 700,
                              }}
                            >
                              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                              </svg>
                              {isAr ? 'عرض التسجيل' : 'View'}
                            </a>
                            {isPast && (
                              <button
                                onClick={() => setRecordingModal(a)}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  fontSize: '.68rem', color: xmuted, fontFamily: 'inherit',
                                  textDecoration: 'underline', padding: 0,
                                }}
                              >
                                {isAr ? 'تعديل' : 'Edit'}
                              </button>
                            )}
                          </div>
                        ) : isPast ? (
                          <button
                            onClick={() => setRecordingModal(a)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 12px', borderRadius: 8,
                              background: isDark ? 'rgba(201,147,44,.08)' : 'rgba(201,147,44,.07)',
                              border: '1px dashed rgba(201,147,44,.35)',
                              color: gold, fontSize: '.75rem', fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            {isAr ? 'أضف رابطاً' : 'Add Link'}
                          </button>
                        ) : (
                          <span style={{ color: xmuted, fontSize: '.78rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination page={page} total={filteredAssessments.length} onChange={setPage} isDark={isDark} />
      </div>
    </>
  )
}
