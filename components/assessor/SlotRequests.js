'use client'

import { useState, useEffect, useCallback } from 'react'

const DAYS = [
  { key: 'sat', en: 'Saturday',  ar: 'السبت'   },
  { key: 'sun', en: 'Sunday',    ar: 'الأحد'    },
  { key: 'mon', en: 'Monday',    ar: 'الاثنين'  },
  { key: 'tue', en: 'Tuesday',   ar: 'الثلاثاء' },
  { key: 'wed', en: 'Wednesday', ar: 'الأربعاء' },
  { key: 'thu', en: 'Thursday',  ar: 'الخميس'  },
  { key: 'fri', en: 'Friday',    ar: 'الجمعة'   },
]

const SLOTS = Array.from({ length: 32 }, (_, i) => 420 + i * 30)

function minutesToLabel(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${min.toString().padStart(2, '0')} ${p}`
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function StatusBadge({ status, isAr }) {
  const MAP = {
    pending:  { color: '#d97706', bg: 'rgba(217,119,6,.1)',  bd: 'rgba(217,119,6,.28)',  en: 'Pending',  ar: 'قيد المراجعة' },
    approved: { color: '#10b981', bg: 'rgba(16,185,129,.1)', bd: 'rgba(16,185,129,.28)', en: 'Approved', ar: 'مقبول' },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,.1)',  bd: 'rgba(239,68,68,.28)',  en: 'Rejected', ar: 'مرفوض' },
  }
  const cfg = MAP[status] || MAP.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      background: cfg.bg, border: `1px solid ${cfg.bd}`,
      fontSize: '.72rem', fontWeight: 700, color: cfg.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0, display: 'inline-block' }} />
      {isAr ? cfg.ar : cfg.en}
    </span>
  )
}

function ScheduleSummary({ schedule, isAr, isDark }) {
  if (!schedule) return <div style={{ fontSize: '.8rem', color: 'var(--as-muted)' }}>{isAr ? 'لا يوجد جدول' : 'No schedule'}</div>
  const activeDays = DAYS.filter(d => (schedule[d.key] || []).length > 0)
  if (activeDays.length === 0) return <div style={{ fontSize: '.8rem', color: 'var(--as-muted)' }}>{isAr ? 'لا توجد أيام' : 'No days selected'}</div>
  const GOLD = '#c9932c'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {activeDays.map(day => {
        const slots = (schedule[day.key] || []).sort((a, b) => a - b)
        return (
          <div key={day.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: '.74rem', fontWeight: 700, color: GOLD, minWidth: 70, flexShrink: 0 }}>
              {isAr ? day.ar : day.en}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {slots.map(slot => (
                <span key={slot} style={{
                  fontSize: '.65rem', direction: 'ltr',
                  background: isDark ? 'rgba(201,147,44,.1)' : 'rgba(201,147,44,.08)',
                  border: '1px solid rgba(201,147,44,.22)',
                  borderRadius: 100, padding: '1px 7px', color: GOLD, fontWeight: 600,
                }}>
                  {minutesToLabel(slot)}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DayCard({ day, slots, onToggleSlot, onToggleDay, isAr, isDark }) {
  const daySlots = slots || []
  const selectedCount = daySlots.length
  const allOn = SLOTS.every(s => daySlots.includes(s))
  const someOn = selectedCount > 0 && !allOn
  const GOLD = '#c9932c'
  const surface = isDark ? 'rgba(255,255,255,.03)' : '#fff'
  const border = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'

  return (
    <div style={{ background: surface, border: `1px solid ${selectedCount > 0 ? 'rgba(201,147,44,.28)' : border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: selectedCount > 0 ? (isDark ? 'rgba(201,147,44,.08)' : 'rgba(201,147,44,.05)') : (isDark ? 'rgba(255,255,255,.02)' : '#f9fafb'), borderBottom: `1px solid ${border}`, gap: 10, cursor: 'pointer' }}
        onClick={() => onToggleDay(day.key)}
      >
        <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${allOn ? GOLD : someOn ? GOLD : (isDark ? 'rgba(255,255,255,.2)' : '#d1d5db')}`, background: allOn ? GOLD : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
          {allOn && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
          {someOn && <div style={{ width: 7, height: 2, borderRadius: 1, background: GOLD }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '.86rem', color: selectedCount > 0 ? GOLD : 'var(--as-text)' }}>{isAr ? day.ar : day.en}</div>
          <div style={{ fontSize: '.68rem', color: 'var(--as-muted)', marginTop: 1 }}>
            {selectedCount === 0 ? (isAr ? 'لا خانات' : 'No slots') : `${selectedCount} ${isAr ? 'خانة' : 'slots'}`}
          </div>
        </div>
        {selectedCount > 0 && (
          <div style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', background: 'rgba(201,147,44,.12)', border: '1px solid rgba(201,147,44,.25)', borderRadius: 100, color: GOLD }}>{selectedCount}/{SLOTS.length}</div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', gap: 4, padding: '10px' }}>
        {SLOTS.map(slot => {
          const on = daySlots.includes(slot)
          return (
            <button
              key={slot}
              onClick={() => onToggleSlot(day.key, slot)}
              style={{
                padding: '4px 2px', borderRadius: 6,
                border: `1.5px solid ${on ? GOLD : (isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb')}`,
                background: on ? (isDark ? 'rgba(201,147,44,.18)' : 'rgba(201,147,44,.1)') : (isDark ? 'rgba(255,255,255,.03)' : '#f9fafb'),
                color: on ? GOLD : 'var(--as-muted)',
                fontSize: '.65rem', fontWeight: on ? 700 : 500,
                cursor: 'pointer', transition: 'all .14s', fontFamily: 'inherit', lineHeight: 1.2, textAlign: 'center',
              }}
            >
              {minutesToLabel(slot)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function SlotRequests({ user, isAr, isDark }) {
  const [requests, setRequests] = useState([])
  const [scheduleData, setScheduleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [proposed, setProposed] = useState({})
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [validationErrors, setValidationErrors] = useState([])
  const GOLD = '#c9932c'

  const fetchData = useCallback(async () => {
    try {
      const [schedRes, reqRes] = await Promise.all([
        fetch('/api/assessor/schedule'),
        fetch('/api/assessor/slot-request'),
      ])
      const schedJson = await schedRes.json()
      const reqJson = await reqRes.json()
      setScheduleData(schedJson.schedule || null)
      setRequests(reqJson.requests || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const pendingRequest = requests.find(r => r.status === 'pending')

  function toggleSlot(dayKey, slot) {
    setProposed(prev => {
      const cur = prev[dayKey] || []
      const next = cur.includes(slot) ? cur.filter(s => s !== slot) : [...cur, slot].sort((a, b) => a - b)
      return { ...prev, [dayKey]: next }
    })
  }

  function toggleDay(dayKey) {
    setProposed(prev => {
      const cur = prev[dayKey] || []
      const allOn = SLOTS.every(s => cur.includes(s))
      return { ...prev, [dayKey]: allOn ? [] : [...SLOTS] }
    })
  }

  function validate(sched) {
    const errs = []
    const activeDays = DAYS.filter(d => (sched[d.key] || []).length > 0)
    if (activeDays.length < 4) errs.push(isAr ? 'يجب تحديد 4 أيام على الأقل' : 'At least 4 days must have slots')
    activeDays.forEach(d => {
      if ((sched[d.key] || []).length < 4) errs.push(isAr ? `${d.ar} يحتاج 4 خانات` : `${d.en} needs at least 4 slots`)
    })
    return errs
  }

  async function handleSubmit() {
    setSubmitError('')
    const errs = validate(proposed)
    setValidationErrors(errs)
    if (errs.length > 0) return
    if (!reason.trim()) { setSubmitError(isAr ? 'الرجاء كتابة سبب الطلب' : 'Please provide a reason'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/assessor/slot-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposedSchedule: proposed, reason }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error || 'Submission failed'); return }
      setShowNewForm(false)
      setProposed({})
      setReason('')
      setValidationErrors([])
      await fetchData()
    } catch (e) {
      setSubmitError(isAr ? 'حدث خطأ، حاول مجدداً' : 'An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const border = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'
  const surface = isDark ? '#10222b' : '#fff'
  const proposedTotal = Object.values(proposed).reduce((s, v) => s + (v?.length || 0), 0)
  const proposedDays = DAYS.filter(d => (proposed[d.key] || []).length > 0).length

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--as-muted)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" style={{ animation: 'srSpin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>
        <style>{`@keyframes srSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes srFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes srSlideDown{from{opacity:0;max-height:0}to{opacity:1;max-height:9999px}}
        @keyframes srSpin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 60px', animation: 'srFadeUp .28s ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.14em', color: GOLD, marginBottom: 4 }}>
              {isAr ? 'إدارة الجدول' : 'SCHEDULE MANAGEMENT'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: 900, color: 'var(--as-text)', marginBottom: 0 }}>
              {isAr ? 'طلبات التغيير' : 'My Change Requests'}
            </h2>
          </div>
          {!pendingRequest && !showNewForm && scheduleData && (
            <button
              onClick={() => { setShowNewForm(true); setProposed(scheduleData.schedule || {}) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: GOLD, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '.84rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {isAr ? 'طلب جديد' : 'New Request'}
            </button>
          )}
        </div>

        {!scheduleData && (
          <div style={{ background: isDark ? 'rgba(255,255,255,.03)' : '#f9fafb', border: `1px dashed ${border}`, borderRadius: 14, padding: '28px', textAlign: 'center', color: 'var(--as-muted)', fontSize: '.84rem', marginBottom: 24 }}>
            {isAr ? 'يجب إعداد الجدول أولاً قبل تقديم طلبات التغيير.' : 'You must set up your schedule first before submitting change requests.'}
          </div>
        )}

        {/* New request form */}
        {showNewForm && (
          <div style={{ background: isDark ? 'rgba(201,147,44,.04)' : 'rgba(201,147,44,.03)', border: '1px solid rgba(201,147,44,.2)', borderRadius: 16, padding: '22px', marginBottom: 24, animation: 'srFadeUp .22s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--as-text)' }}>
                {isAr ? 'الجدول المقترح الجديد' : 'Propose New Schedule'}
              </div>
              <button onClick={() => { setShowNewForm(false); setSubmitError(''); setValidationErrors([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--as-muted)', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Stats bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px', background: isDark ? 'rgba(255,255,255,.04)' : '#f9fafb', borderRadius: 10, marginBottom: 16, border: `1px solid ${border}` }}>
              <span style={{ fontSize: '.72rem', color: 'var(--as-xmuted)' }}>{isAr ? 'الأيام:' : 'Days:'} <strong style={{ color: proposedDays >= 4 ? '#10b981' : 'var(--as-text)' }}>{proposedDays}</strong></span>
              <span style={{ fontSize: '.72rem', color: 'var(--as-xmuted)' }}>{isAr ? 'الخانات:' : 'Slots:'} <strong style={{ color: GOLD }}>{proposedTotal}</strong></span>
              {proposedTotal > 0 && (
                <button onClick={() => setProposed({})} style={{ marginLeft: 'auto', fontSize: '.72rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                  {isAr ? 'مسح الكل' : 'Clear all'}
                </button>
              )}
            </div>

            {validationErrors.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 14 }}>
                {validationErrors.map((e, i) => <div key={i} style={{ fontSize: '.78rem', color: '#ef4444' }}>• {e}</div>)}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {DAYS.map(day => (
                <DayCard key={day.key} day={day} slots={proposed[day.key]} onToggleSlot={toggleSlot} onToggleDay={toggleDay} isAr={isAr} isDark={isDark} />
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: isAr ? 0 : '.08em', color: 'var(--as-muted)', marginBottom: 7 }}>
                {isAr ? 'سبب الطلب *' : 'Reason for Change *'}
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={isAr ? 'اشرح سبب رغبتك في تغيير جدولك...' : 'Explain why you need to change your schedule...'}
                rows={3}
                style={{ width: '100%', resize: 'vertical', background: isDark ? 'rgba(255,255,255,.05)' : '#f9fafb', border: `1px solid ${submitError ? '#ef4444' : isDark ? 'rgba(255,255,255,.1)' : '#d1d5db'}`, borderRadius: 9, padding: '10px 13px', color: 'var(--as-text)', fontSize: '.86rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e => e.target.style.borderColor = isDark ? 'rgba(255,255,255,.1)' : '#d1d5db'}
              />
              {submitError && <div style={{ fontSize: '.76rem', color: '#ef4444', marginTop: 5 }}>{submitError}</div>}
            </div>

            <div style={{ display: 'flex', gap: 9, justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
              <button onClick={() => { setShowNewForm(false); setSubmitError(''); setValidationErrors([]) }} style={{ padding: '8px 18px', background: 'none', border: `1px solid ${border}`, borderRadius: 9, color: 'var(--as-muted)', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: '9px 20px', background: GOLD, color: '#fff', border: 'none', borderRadius: 9, fontSize: '.82rem', fontWeight: 700, cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit', opacity: submitting ? .7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}
              >
                {submitting ? (
                  <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: 'srSpin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>{isAr ? 'جارٍ الإرسال...' : 'Submitting...'}</>
                ) : (
                  <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>{isAr ? 'إرسال الطلب' : 'Submit Request'}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Requests table */}
        {requests.length === 0 ? (
          <div style={{ background: isDark ? 'rgba(255,255,255,.02)' : '#f9fafb', border: `1px dashed ${border}`, borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(201,147,44,.08)', border: '1.5px solid rgba(201,147,44,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--as-text)', marginBottom: 6 }}>{isAr ? 'لا توجد طلبات بعد' : 'No requests yet'}</div>
            <div style={{ fontSize: '.82rem', color: 'var(--as-muted)' }}>{isAr ? 'ستظهر طلبات التغيير هنا.' : 'Schedule change requests will appear here.'}</div>
          </div>
        ) : (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isDark ? 'rgba(255,255,255,.03)' : '#f9fafb' }}>
                  {[
                    isAr ? 'التاريخ' : 'Date',
                    isAr ? 'الحالة' : 'Status',
                    isAr ? 'السبب' : 'Reason',
                    '',
                  ].map((h, i) => (
                    <th key={i} style={{ padding: '12px 16px', textAlign: isAr ? 'right' : 'left', fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.08em', color: GOLD, textTransform: 'uppercase', borderBottom: `1px solid ${border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <>
                    <tr
                      key={req.id}
                      onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                      style={{ cursor: 'pointer', transition: 'background .12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.03)' : 'rgba(201,147,44,.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', borderTop: `1px solid ${border}`, fontSize: '.8rem', color: 'var(--as-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(req.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div style={{ fontSize: '.68rem', color: 'var(--as-xmuted)', marginTop: 2 }}>{timeAgo(req.createdAt)}</div>
                      </td>
                      <td style={{ padding: '14px 16px', borderTop: `1px solid ${border}` }}>
                        <StatusBadge status={req.status} isAr={isAr} />
                      </td>
                      <td style={{ padding: '14px 16px', borderTop: `1px solid ${border}`, fontSize: '.8rem', color: 'var(--as-muted)', maxWidth: 240 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.reason}</div>
                      </td>
                      <td style={{ padding: '14px 16px', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--as-xmuted)', transition: 'transform .2s', transform: expanded === req.id ? 'rotate(180deg)' : 'none' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </td>
                    </tr>

                    {/* Expanded detail */}
                    {expanded === req.id && (
                      <tr key={`${req.id}-detail`}>
                        <td colSpan={4} style={{ padding: 0, borderTop: `1px solid ${border}` }}>
                          <div style={{ padding: '20px 20px 24px', background: isDark ? 'rgba(255,255,255,.02)' : '#fafbfc', animation: 'srFadeUp .18s ease' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
                              <div>
                                <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: isAr ? 0 : '.08em', color: 'var(--as-xmuted)', marginBottom: 10 }}>
                                  {isAr ? 'الجدول الحالي' : 'CURRENT SCHEDULE'}
                                </div>
                                <ScheduleSummary schedule={req.currentSchedule} isAr={isAr} isDark={isDark} />
                              </div>
                              <div>
                                <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: isAr ? 0 : '.08em', color: 'var(--as-xmuted)', marginBottom: 10 }}>
                                  {isAr ? 'الجدول المقترح' : 'PROPOSED SCHEDULE'}
                                </div>
                                <ScheduleSummary schedule={req.proposedSchedule} isAr={isAr} isDark={isDark} />
                              </div>
                            </div>

                            {/* Reason */}
                            <div style={{ padding: '12px 14px', background: isDark ? 'rgba(255,255,255,.04)' : '#f0f2f5', borderRadius: 9, marginBottom: 12 }}>
                              <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--as-xmuted)', textTransform: 'uppercase', marginBottom: 5 }}>{isAr ? 'السبب' : 'REASON'}</div>
                              <div style={{ fontSize: '.82rem', color: 'var(--as-text)', lineHeight: 1.6 }}>{req.reason}</div>
                            </div>

                            {/* Admin note if rejected */}
                            {req.adminNote && (
                              <div style={{ padding: '12px 14px', background: req.status === 'rejected' ? 'rgba(239,68,68,.07)' : 'rgba(16,185,129,.07)', border: `1px solid ${req.status === 'rejected' ? 'rgba(239,68,68,.2)' : 'rgba(16,185,129,.2)'}`, borderRadius: 9 }}>
                                <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--as-xmuted)', textTransform: 'uppercase', marginBottom: 5 }}>{isAr ? 'ملاحظة المسؤول' : 'ADMIN NOTE'}</div>
                                <div style={{ fontSize: '.82rem', color: 'var(--as-text)', lineHeight: 1.6 }}>{req.adminNote}</div>
                              </div>
                            )}

                            {req.resolvedAt && (
                              <div style={{ marginTop: 10, fontSize: '.72rem', color: 'var(--as-xmuted)' }}>
                                {isAr ? 'تم الحل في: ' : 'Resolved: '}{new Date(req.resolvedAt).toLocaleString()}
                                {req.resolvedByName && <span> · {isAr ? 'بواسطة ' : 'by '}{req.resolvedByName}</span>}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
