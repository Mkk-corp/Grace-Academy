'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

const DAYS = [
  { key: 'sat', en: 'Saturday',  ar: 'السبت'   },
  { key: 'sun', en: 'Sunday',    ar: 'الأحد'    },
  { key: 'mon', en: 'Monday',    ar: 'الاثنين'  },
  { key: 'tue', en: 'Tuesday',   ar: 'الثلاثاء' },
  { key: 'wed', en: 'Wednesday', ar: 'الأربعاء' },
  { key: 'thu', en: 'Thursday',  ar: 'الخميس'  },
  { key: 'fri', en: 'Friday',    ar: 'الجمعة'   },
]

// 30 slots: 9:00 AM (540 min) → 11:30 PM (1410 min), 30 min each
const SLOTS = Array.from({ length: 30 }, (_, i) => 540 + i * 30)
const REQUIRED = 16

function minutesToLabel(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${min.toString().padStart(2, '0')} ${p}`
}

// ─── Playful error modal ───────────────────────────────────────────────────
function ErrorModal({ total, onClose, isAr, isDark }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const GOLD = '#c9932c'
  const diff = total - REQUIRED

  const need = REQUIRED - total

  let icon, titleEn, titleAr, bodyEn, bodyAr
  if (total === 0) {
    icon = (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
    titleEn = 'Pick Your Slots!'
    titleAr = 'اختر خاناتك!'
    bodyEn = `No slots selected yet. Pick at least ${REQUIRED} slots spread across the week to continue — you can always add more!`
    bodyAr = `لم تختر أي خانة بعد. اختر ${REQUIRED} خانة على الأقل موزعة على الأسبوع للمتابعة — يمكنك دائماً إضافة المزيد!`
  } else {
    icon = (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
    )
    titleEn = 'Almost There!'
    titleAr = 'اقتربت من الهدف!'
    bodyEn = `You have ${total} slot${total !== 1 ? 's' : ''} — just ${need} more to go! You need at least ${REQUIRED} slots to save. Keep going!`
    bodyAr = `لديك ${total} خانة — تحتاج ${need} خانة أخرى فقط! تحتاج ${REQUIRED} خانة على الأقل للحفظ. استمر!`
  }

  return createPortal(
    <>
      <style>{`
        @keyframes wsOverlayIn{from{opacity:0}to{opacity:1}}
        @keyframes wsModalIn{from{opacity:0;transform:scale(.82) translateY(24px)}to{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>
      {/* only shown when total < REQUIRED */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)',
          animation: 'wsOverlayIn .2s ease',
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div style={{
          width: '90%', maxWidth: 390,
          background: isDark ? '#0d1f2d' : '#ffffff',
          border: '2px solid rgba(201,147,44,.35)',
          borderRadius: 28, padding: '36px 28px 28px',
          textAlign: 'center',
          animation: 'wsModalIn .3s cubic-bezier(.34,1.4,.64,1) both',
          boxShadow: '0 40px 100px rgba(0,0,0,.5)',
          position: 'relative',
          direction: isAr ? 'rtl' : 'ltr',
        }}>
          {/* Close X */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14,
              ...(isAr ? { left: 14 } : { right: 14 }),
              width: 28, height: 28, borderRadius: '50%', border: 'none',
              background: isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)',
              color: isDark ? 'rgba(255,255,255,.5)' : '#9ca3af',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, lineHeight: 1, fontFamily: 'inherit',
            }}
          >×</button>

          {/* Icon badge */}
          <div style={{
            width: 76, height: 76, borderRadius: 22, margin: '0 auto 22px',
            background: 'rgba(201,147,44,.1)', border: '2px solid rgba(201,147,44,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(201,147,44,.15)',
          }}>{icon}</div>

          {/* Title */}
          <div style={{ fontSize: '1.22rem', fontWeight: 900, color: GOLD, marginBottom: 10 }}>
            {isAr ? titleAr : titleEn}
          </div>

          {/* Body */}
          <div style={{
            fontSize: '.87rem', color: isDark ? 'rgba(255,255,255,.62)' : '#4b5563',
            lineHeight: 1.7, marginBottom: 22,
          }}>
            {isAr ? bodyAr : bodyEn}
          </div>

          {/* Progress bar */}
          <div style={{
            background: isDark ? 'rgba(201,147,44,.07)' : 'rgba(201,147,44,.05)',
            border: '1.5px solid rgba(201,147,44,.2)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 22,
          }}>
            <div style={{
              fontSize: '.68rem', fontWeight: 700,
              letterSpacing: isAr ? 0 : '.1em', textTransform: 'uppercase',
              color: 'rgba(201,147,44,.55)', marginBottom: 8,
            }}>
              {isAr ? 'التقدم الحالي' : 'CURRENT PROGRESS'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 7, borderRadius: 4, background: isDark ? 'rgba(255,255,255,.08)' : '#e5e7eb', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${Math.min((total / REQUIRED) * 100, 100)}%`,
                  background: GOLD,
                  transition: 'width .4s ease',
                }} />
              </div>
              <div style={{
                fontSize: '.9rem', fontWeight: 900, flexShrink: 0,
                color: GOLD,
              }}>{total} / {REQUIRED} {isAr ? 'كحد أدنى' : 'minimum'}</div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '13px', borderRadius: 14, border: 'none',
              background: GOLD, color: '#fff', fontWeight: 700, fontSize: '.92rem',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(201,147,44,.4)',
              transition: 'opacity .15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            {isAr ? 'حسناً، سأصلح ذلك!' : "Got it, I'll fix it!"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

// ─── Day card ──────────────────────────────────────────────────────────────
function DayCard({ day, slots, onToggleSlot, onToggleDay, isAr, isDark, readOnly }) {
  const daySlots = slots || []
  const selectedCount = daySlots.length
  const allOn = SLOTS.every(s => daySlots.includes(s))
  const someOn = selectedCount > 0 && !allOn
  const GOLD = '#c9932c'
  const surface = isDark ? 'rgba(255,255,255,.03)' : '#fff'
  const border = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'

  return (
    <div style={{
      background: surface,
      border: `1px solid ${selectedCount > 0 ? (isDark ? 'rgba(201,147,44,.28)' : 'rgba(201,147,44,.3)') : border}`,
      borderRadius: 16, overflow: 'hidden', transition: 'border-color .2s',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 18px',
        background: selectedCount > 0
          ? (isDark ? 'rgba(201,147,44,.08)' : 'rgba(201,147,44,.05)')
          : (isDark ? 'rgba(255,255,255,.02)' : '#f9fafb'),
        borderBottom: `1px solid ${border}`,
        gap: 12, cursor: readOnly ? 'default' : 'pointer',
      }} onClick={() => !readOnly && onToggleDay && onToggleDay(day.key)}>
        {!readOnly && (
          <div style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
            border: `2px solid ${allOn ? GOLD : someOn ? GOLD : (isDark ? 'rgba(255,255,255,.2)' : '#d1d5db')}`,
            background: allOn ? GOLD : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'all .15s',
          }}>
            {allOn && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
            {someOn && <div style={{ width: 8, height: 2, borderRadius: 1, background: GOLD }} />}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '.92rem', color: selectedCount > 0 ? GOLD : 'var(--as-text)' }}>
            {isAr ? day.ar : day.en}
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--as-muted)', marginTop: 1 }}>
            {selectedCount === 0
              ? (isAr ? 'لا توجد خانات محددة' : 'No slots selected')
              : isAr ? `${selectedCount} خانة محددة` : `${selectedCount} slot${selectedCount > 1 ? 's' : ''} selected`}
          </div>
        </div>
        {selectedCount > 0 && (
          <div style={{ fontSize: '.68rem', fontWeight: 700, padding: '3px 10px', background: 'rgba(201,147,44,.12)', border: '1px solid rgba(201,147,44,.25)', borderRadius: 100, color: GOLD }}>
            {selectedCount}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 5, padding: '12px' }}>
        {SLOTS.map(slot => {
          const on = daySlots.includes(slot)
          return (
            <button
              key={slot}
              onClick={() => !readOnly && onToggleSlot && onToggleSlot(day.key, slot)}
              disabled={readOnly}
              style={{
                padding: '5px 3px', borderRadius: 7,
                border: `1.5px solid ${on ? GOLD : (isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb')}`,
                background: on
                  ? (isDark ? 'rgba(201,147,44,.18)' : 'rgba(201,147,44,.1)')
                  : (isDark ? 'rgba(255,255,255,.03)' : '#f9fafb'),
                color: on ? GOLD : 'var(--as-muted)',
                fontSize: '.68rem', fontWeight: on ? 700 : 500,
                cursor: readOnly ? 'default' : 'pointer',
                transition: 'all .14s', fontFamily: 'inherit',
                lineHeight: 1.2, textAlign: 'center',
              }}
              onMouseEnter={e => {
                if (!readOnly && !on) {
                  e.currentTarget.style.borderColor = 'rgba(201,147,44,.4)'
                  e.currentTarget.style.color = GOLD
                }
              }}
              onMouseLeave={e => {
                if (!readOnly && !on) {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'
                  e.currentTarget.style.color = 'var(--as-muted)'
                }
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

// ─── Read-only schedule view (locked state) ────────────────────────────────
function ScheduleReadView({ scheduleData, isAr, isDark }) {
  const GOLD = '#c9932c'
  // scheduleData is the raw day-map object (e.g. { sat: [540,570], mon: [600] })
  const activeDays = DAYS.filter(d => (scheduleData?.[d.key] || []).length > 0)

  function formatRange(slots) {
    if (!slots || slots.length === 0) return []
    const sorted = [...slots].sort((a, b) => a - b)
    const ranges = []
    let start = sorted[0], prev = sorted[0]
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === prev + 30) { prev = sorted[i] }
      else { ranges.push({ from: start, to: prev + 30 }); start = sorted[i]; prev = sorted[i] }
    }
    ranges.push({ from: start, to: prev + 30 })
    return ranges
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {activeDays.map(day => {
        const slots = scheduleData?.[day.key] || []
        const ranges = formatRange(slots)
        return (
          <div key={day.key} style={{
            background: isDark ? 'rgba(201,147,44,.05)' : 'rgba(201,147,44,.04)',
            border: '1px solid rgba(201,147,44,.2)',
            borderRadius: 12, padding: '14px 18px',
          }}>
            <div style={{ fontWeight: 700, fontSize: '.88rem', color: GOLD, marginBottom: 8 }}>
              {isAr ? day.ar : day.en}
              <span style={{ marginLeft: 8, fontSize: '.72rem', fontWeight: 600, color: 'var(--as-muted)' }}>
                ({slots.length} {isAr ? 'خانة' : 'slots'})
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ranges.map((r, i) => (
                <span key={i} style={{
                  fontSize: '.72rem', direction: 'ltr',
                  background: isDark ? 'rgba(201,147,44,.12)' : 'rgba(201,147,44,.09)',
                  border: '1px solid rgba(201,147,44,.25)',
                  borderRadius: 100, padding: '3px 10px', color: GOLD, fontWeight: 600,
                }}>
                  {minutesToLabel(r.from)} – {minutesToLabel(r.to)}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────
export default function WeeklySchedule({ user, isAr, isDark, onScheduleSaved, hideReadView = false }) {
  const [scheduleData, setScheduleData] = useState(undefined)
  const [requests, setRequests]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [schedule, setSchedule]         = useState({})
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [proposed, setProposed]         = useState({})
  const [reason, setReason]             = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [submitError, setSubmitError]   = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorModal, setErrorModal]     = useState(null) // { total: number } | null

  const GOLD = '#c9932c'

  const fetchData = useCallback(async () => {
    try {
      const [schedRes, reqRes] = await Promise.all([
        fetch('/api/assessor/schedule'),
        fetch('/api/assessor/slot-request'),
      ])
      const schedJson = await schedRes.json()
      const reqJson   = await reqRes.json()
      setScheduleData(schedJson.schedule || null)
      setRequests(reqJson.requests || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function toggleSlot(dayKey, slot, target = 'setup') {
    const setter = target === 'proposed' ? setProposed : setSchedule
    setter(prev => {
      const cur  = prev[dayKey] || []
      const next = cur.includes(slot) ? cur.filter(s => s !== slot) : [...cur, slot].sort((a, b) => a - b)
      return { ...prev, [dayKey]: next }
    })
  }

  function toggleDay(dayKey, target = 'setup') {
    const setter = target === 'proposed' ? setProposed : setSchedule
    setter(prev => {
      const cur   = prev[dayKey] || []
      const allOn = SLOTS.every(s => cur.includes(s))
      return { ...prev, [dayKey]: allOn ? [] : [...SLOTS] }
    })
  }

  function validate(sched) {
    const total = Object.values(sched).reduce((s, v) => s + (v?.length || 0), 0)
    return total >= REQUIRED ? [] : [total]
  }

  async function handleSave() {
    setError('')
    const errs = validate(schedule)
    if (errs.length > 0) {
      setErrorModal({ total: errs[0] })
      return
    }
    setSaving(true)
    try {
      const res  = await fetch('/api/assessor/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Save failed'); return }
      await fetchData()
      onScheduleSaved?.()
    } catch {
      setError(isAr ? 'حدث خطأ، حاول مجدداً' : 'An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmitRequest() {
    setSubmitError('')
    const errs = validate(proposed)
    if (errs.length > 0) {
      setErrorModal({ total: errs[0] })
      return
    }
    if (!reason.trim()) {
      setSubmitError(isAr ? 'الرجاء كتابة سبب الطلب' : 'Please provide a reason for the change')
      return
    }
    setSubmitting(true)
    try {
      const res  = await fetch('/api/assessor/slot-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposedSchedule: proposed, reason }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error || 'Submission failed'); return }
      setSubmitSuccess(true)
      setShowRequestForm(false)
      setProposed({})
      setReason('')
      await fetchData()
    } catch {
      setSubmitError(isAr ? 'حدث خطأ، حاول مجدداً' : 'An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalSlots      = Object.values(schedule).reduce((s, v) => s + (v?.length || 0), 0)
  const activeDaysCount = DAYS.filter(d => (schedule[d.key] || []).length > 0).length
  const proposedTotal   = Object.values(proposed).reduce((s, v) => s + (v?.length || 0), 0)
  const proposedDays    = DAYS.filter(d => (proposed[d.key] || []).length > 0).length
  const pendingRequest  = requests.find(r => r.status === 'pending')

  // Progress colour for stats bar
  const progressColor = totalSlots >= REQUIRED ? '#10b981' : GOLD
  const progressPct   = Math.min((totalSlots / REQUIRED) * 100, 100)

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--as-muted)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
        </svg>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const border = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'

  return (
    <>
      <style>{`
        @keyframes scFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes scSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Error modal (portal) */}
      {errorModal && (
        <ErrorModal
          total={errorModal.total}
          onClose={() => setErrorModal(null)}
          isAr={isAr}
          isDark={isDark}
        />
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 60px', animation: 'scFadeUp .28s ease' }}>

        {/* ─── Page header ─── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.14em', color: GOLD, marginBottom: 5 }}>
            {isAr ? 'إعداد الجدول الأسبوعي' : 'WEEKLY SCHEDULE SETUP'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.1rem,2vw,1.45rem)', fontWeight: 900, color: 'var(--as-text)', marginBottom: 8 }}>
            {scheduleData ? (isAr ? 'جدولي الأسبوعي' : 'My Weekly Schedule') : (isAr ? 'اختر خاناتك المتاحة' : 'Set Your Available Slots')}
          </h2>
          {!scheduleData && (
            <p style={{ fontSize: '.84rem', color: 'var(--as-muted)', lineHeight: 1.6, maxWidth: 540 }}>
              {isAr
                ? `اختر ${REQUIRED} خانة متاحة على الأقل (30 دقيقة لكل خانة) موزعة على أسبوعك — يمكنك إضافة المزيد بلا حدود. الخانات متاحة من 9:00 صباحاً حتى منتصف الليل. بعد الحفظ يصبح الجدول مقفلاً — استخدم طلب تغيير لتعديله.`
                : `Pick at least ${REQUIRED} available 30-min slots spread across your week — you can add as many as you like. Slots run 9:00 AM – 12:00 AM. Once saved, the schedule is locked — use a change request to modify it.`}
            </p>
          )}
        </div>

        {/* ─── LOCKED VIEW ─── */}
        {scheduleData && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 100, padding: '6px 16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span style={{ fontSize: '.76rem', fontWeight: 700, color: '#10b981', letterSpacing: isAr ? 0 : '.06em' }}>
                  {isAr ? 'الجدول مقفل' : 'SCHEDULE LOCKED'}
                </span>
                <span style={{ fontSize: '.68rem', color: 'rgba(16,185,129,.6)' }}>
                  {scheduleData.lockedAt ? new Date(scheduleData.lockedAt).toLocaleDateString() : ''}
                </span>
              </div>
              {!pendingRequest && !showRequestForm && (
                <button
                  onClick={() => { setShowRequestForm(true); setProposed(scheduleData.schedule || {}); setSubmitSuccess(false) }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 18px', borderRadius: 10,
                    background: GOLD, color: '#fff', border: 'none',
                    fontWeight: 700, fontSize: '.84rem', cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all .15s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  {isAr ? 'طلب تغيير الجدول' : 'Request Schedule Change'}
                </button>
              )}
            </div>

            {submitSuccess && (
              <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: '.84rem', fontWeight: 600, color: '#10b981' }}>
                  {isAr ? 'تم إرسال طلب التغيير بنجاح! سيتم مراجعته من قبل المسؤول.' : 'Change request submitted! An admin will review it shortly.'}
                </span>
              </div>
            )}

            {pendingRequest && !showRequestForm && (
              <div style={{
                background: isDark ? 'rgba(217,119,6,.08)' : 'rgba(217,119,6,.05)',
                border: '1px solid rgba(217,119,6,.3)',
                borderRadius: 14, padding: '18px 22px', marginBottom: 20,
                animation: 'scSlideDown .2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontWeight: 700, fontSize: '.88rem', color: '#d97706' }}>
                    {isAr ? 'طلب تغيير قيد المراجعة' : 'Schedule Change Request Pending'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'rgba(217,119,6,.7)' }}>
                    {new Date(pendingRequest.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--as-muted)', lineHeight: 1.6 }}>
                  {isAr ? 'السبب: ' : 'Reason: '}<em>{pendingRequest.reason}</em>
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '.78rem', color: 'var(--as-xmuted)' }}>
                  {isAr ? 'لا يمكنك تقديم طلب جديد حتى يتم حل هذا الطلب.' : 'You cannot submit a new request until this one is resolved.'}
                </p>
              </div>
            )}

            {!hideReadView && (
              <div style={{ marginBottom: showRequestForm ? 28 : 0 }}>
                <div style={{ fontSize: '.74rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: 'var(--as-xmuted)', textTransform: 'uppercase', marginBottom: 12 }}>
                  {isAr ? 'الجدول الحالي' : 'CURRENT SCHEDULE'}
                </div>
                <ScheduleReadView scheduleData={scheduleData} isAr={isAr} isDark={isDark} />
              </div>
            )}

            {/* ─── REQUEST CHANGE FORM ─── */}
            {showRequestForm && (
              <div style={{ marginTop: 32, animation: 'scSlideDown .22s ease' }}>
                <div style={{ height: 1, background: border, marginBottom: 28 }} />
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.14em', color: GOLD, marginBottom: 5 }}>
                    {isAr ? 'طلب تغيير الجدول' : 'PROPOSE NEW SCHEDULE'}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--as-text)', marginBottom: 6 }}>
                    {isAr ? 'الجدول المقترح' : 'Propose New Schedule'}
                  </h3>
                  <p style={{ fontSize: '.82rem', color: 'var(--as-muted)', maxWidth: 520, lineHeight: 1.55 }}>
                    {isAr
                      ? `اختر ${REQUIRED} خانة كجدول جديد مقترح وأضف سبباً للتغيير. سيقوم المسؤول بمراجعة طلبك.`
                      : `Propose your new ${REQUIRED}-slot schedule and explain why you need the change. An admin will review it shortly.`}
                  </p>
                </div>

                {/* Proposed stats bar */}
                <div style={{
                  position: 'sticky', top: 0, zIndex: 40,
                  background: isDark ? 'rgba(13,27,36,.94)' : 'rgba(248,250,252,.94)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}`,
                  borderRadius: 14, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
                  boxShadow: '0 4px 24px rgba(0,0,0,.09)',
                }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: 'var(--as-xmuted)', textTransform: 'uppercase' }}>
                        {isAr ? `الخانات المقترحة (${REQUIRED} كحد أدنى)` : `PROPOSED SLOTS (min ${REQUIRED})`}
                      </div>
                      <div style={{ fontSize: '.85rem', fontWeight: 900, color: proposedTotal >= REQUIRED ? '#10b981' : GOLD }}>
                        {proposedTotal} / {REQUIRED}
                      </div>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: isDark ? 'rgba(255,255,255,.06)' : '#e5e7eb', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${Math.min((proposedTotal / REQUIRED) * 100, 100)}%`,
                        background: proposedTotal >= REQUIRED ? '#10b981' : GOLD,
                        transition: 'width .25s ease, background .25s',
                      }} />
                    </div>
                  </div>
                  {proposedTotal > 0 && (
                    <button
                      onClick={() => setProposed({})}
                      style={{ padding: '7px 13px', background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb'}`, borderRadius: 9, color: 'var(--as-muted)', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
                    >
                      {isAr ? 'مسح' : 'Clear'}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {DAYS.map(day => (
                    <DayCard
                      key={day.key}
                      day={day}
                      slots={proposed[day.key]}
                      onToggleSlot={(dk, s) => toggleSlot(dk, s, 'proposed')}
                      onToggleDay={(dk) => toggleDay(dk, 'proposed')}
                      isAr={isAr}
                      isDark={isDark}
                    />
                  ))}
                </div>

                {/* Reason textarea */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: isAr ? 0 : '.08em', color: 'var(--as-muted)', marginBottom: 8 }}>
                    {isAr ? 'سبب الطلب *' : 'Reason for Change *'}
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder={isAr ? 'اكتب سبب طلب تغيير الجدول...' : 'Explain why you need to change your schedule...'}
                    rows={4}
                    style={{
                      width: '100%', resize: 'vertical',
                      background: isDark ? 'rgba(255,255,255,.05)' : '#f9fafb',
                      border: `1px solid ${submitError ? '#ef4444' : isDark ? 'rgba(255,255,255,.1)' : '#d1d5db'}`,
                      borderRadius: 10, padding: '12px 14px',
                      color: 'var(--as-text)', fontSize: '.88rem',
                      fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s',
                      lineHeight: 1.65,
                    }}
                    onFocus={e => { e.target.style.borderColor = GOLD }}
                    onBlur={e => { e.target.style.borderColor = isDark ? 'rgba(255,255,255,.1)' : '#d1d5db' }}
                  />
                  {submitError && (
                    <div style={{ fontSize: '.78rem', color: '#ef4444', marginTop: 6 }}>{submitError}</div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
                  <button
                    onClick={() => { setShowRequestForm(false); setSubmitError('') }}
                    style={{ padding: '10px 20px', background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb'}`, borderRadius: 10, color: 'var(--as-muted)', fontSize: '.84rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    disabled={submitting}
                    style={{ padding: '10px 22px', background: GOLD, color: '#fff', border: 'none', borderRadius: 10, fontSize: '.84rem', fontWeight: 700, cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit', opacity: submitting ? .7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}
                  >
                    {submitting ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>
                        {isAr ? 'جارٍ الإرسال...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        {isAr ? 'إرسال الطلب' : 'Submit Request'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── INITIAL SETUP MODE ─── */}
        {scheduleData === null && (
          <>
            {/* Sticky stats bar — no save button here */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 40,
              background: isDark ? 'rgba(13,27,36,.92)' : 'rgba(248,250,252,.92)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}`,
              borderRadius: 14, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
              boxShadow: '0 4px 24px rgba(0,0,0,.09)',
            }}>
              {/* Slot progress */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: 'var(--as-xmuted)', textTransform: 'uppercase' }}>
                    {isAr ? `الخانات (${REQUIRED} كحد أدنى)` : `SLOTS (min ${REQUIRED})`}
                  </div>
                  <div style={{ fontSize: '.9rem', fontWeight: 900, color: progressColor, lineHeight: 1 }}>
                    {totalSlots} / {REQUIRED}
                  </div>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: isDark ? 'rgba(255,255,255,.06)' : '#e5e7eb', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${progressPct}%`,
                    background: progressColor,
                    transition: 'width .25s ease, background .25s',
                  }} />
                </div>
              </div>

              <div style={{ width: 1, height: 32, background: 'var(--as-border)', flexShrink: 0 }} />

              {/* Days count */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: 'var(--as-xmuted)', textTransform: 'uppercase', marginBottom: 2 }}>
                  {isAr ? 'الأيام' : 'DAYS'}
                </div>
                <div style={{ fontSize: '.9rem', fontWeight: 900, color: activeDaysCount > 0 ? GOLD : 'var(--as-muted)', lineHeight: 1 }}>
                  {activeDaysCount}
                </div>
              </div>

              {totalSlots > 0 && (
                <button
                  onClick={() => setSchedule({})}
                  style={{ padding: '8px 14px', background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb'}`, borderRadius: 9, color: 'var(--as-muted)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb'; e.currentTarget.style.color = 'var(--as-muted)' }}
                >
                  {isAr ? 'مسح الكل' : 'Clear All'}
                </button>
              )}
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: '.84rem', color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.76rem', color: 'var(--as-muted)' }}>
                <div style={{ width: 24, height: 16, borderRadius: 4, background: isDark ? 'rgba(201,147,44,.18)' : 'rgba(201,147,44,.1)', border: `1.5px solid ${GOLD}` }} />
                {isAr ? 'متاح' : 'Available'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.76rem', color: 'var(--as-muted)' }}>
                <div style={{ width: 24, height: 16, borderRadius: 4, background: isDark ? 'rgba(255,255,255,.03)' : '#f9fafb', border: `1.5px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}` }} />
                {isAr ? 'غير متاح' : 'Unavailable'}
              </div>
              <div style={{ fontSize: '.74rem', color: 'var(--as-xmuted)' }}>
                {isAr ? '· اضغط الخانة لتفعيلها · اضغط اليوم لتحديد الكل' : '· Click slot to toggle · Click day header to select all'}
              </div>
            </div>

            {/* Day cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DAYS.map(day => (
                <DayCard
                  key={day.key}
                  day={day}
                  slots={schedule[day.key]}
                  onToggleSlot={(dk, s) => toggleSlot(dk, s, 'setup')}
                  onToggleDay={(dk) => toggleDay(dk, 'setup')}
                  isAr={isAr}
                  isDark={isDark}
                />
              ))}
            </div>

            {/* ─── Save button at bottom ─── */}
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
              {/* Slot count reminder */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: '.8rem', color: totalSlots >= REQUIRED ? '#10b981' : 'var(--as-muted)',
                fontWeight: totalSlots >= REQUIRED ? 700 : 400,
                transition: 'color .2s',
              }}>
                {totalSlots >= REQUIRED ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {isAr ? `رائع! لديك ${totalSlots} خانة — جاهز للحفظ!` : `Great! You have ${totalSlots} slots — ready to save!`}
                  </>
                ) : (
                  isAr
                    ? `${totalSlots} / ${REQUIRED} خانة — تحتاج ${REQUIRED} على الأقل`
                    : `${totalSlots} / ${REQUIRED} slots — need at least ${REQUIRED}`
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '14px 28px', borderRadius: 14, border: 'none',
                  background: totalSlots >= REQUIRED
                    ? (saving ? 'rgba(201,147,44,.7)' : GOLD)
                    : (isDark ? 'rgba(255,255,255,.08)' : '#f3f4f6'),
                  color: totalSlots >= REQUIRED ? '#fff' : (isDark ? 'rgba(255,255,255,.35)' : '#9ca3af'),
                  fontWeight: 700, fontSize: '1rem',
                  cursor: saving ? 'default' : 'pointer',
                  fontFamily: 'inherit', transition: 'all .2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  boxShadow: totalSlots >= REQUIRED ? '0 6px 24px rgba(201,147,44,.38)' : 'none',
                }}
                onMouseEnter={e => { if (totalSlots >= REQUIRED && !saving) e.currentTarget.style.opacity = '.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {saving ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>
                    {isAr ? 'جارٍ الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    {isAr ? 'حفظ الجدول' : 'Save Schedule'}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
