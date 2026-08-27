'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

/* ─── Helpers ─────────────────────────────────────────────────────── */
function slotMinToLabel(min) {
  const h    = Math.floor(min / 60)
  const m    = min % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function fmtDate(dateStr, isAr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch { return dateStr }
}

const LEVEL_COLORS = {
  A1: '#6b7280', A2: '#3b82f6',
  B1: '#10b981', B2: '#059669',
  C1: '#8b5cf6', C2: '#c9932c',
}
const LEVEL_NAMES_EN = {
  A1: 'Beginner', A2: 'Elementary',
  B1: 'Intermediate', B2: 'Upper-Intermediate',
  C1: 'Advanced', C2: 'Proficiency',
}
const LEVEL_NAMES_AR = {
  A1: 'مبتدئ', A2: 'مبتدئ متقدم',
  B1: 'متوسط', B2: 'فوق المتوسط',
  C1: 'متقدم', C2: 'إتقان',
}

/* ─── Main Component ──────────────────────────────────────────────── */
export default function PlacementTest({ user, isAr, isDark, onBooked }) {
  const router = useRouter()

  // 'loading' | 'none' | 'booked' | 'report_pending' | 'report_ready' | 'booking_flow'
  const [placementStatus, setPlacementStatus] = useState('loading')
  const [placementData,   setPlacementData]   = useState({ booking: null, report: null })

  // Booking flow state (only used when placementStatus === 'booking_flow')
  const [step,           setStep]           = useState('choose')
  const [slots,          setSlots]          = useState(null)
  const [slotsLoading,   setSlotsLoading]   = useState(false)
  const [selectedSlot,   setSelectedSlot]   = useState(null)
  const [booking,        setBooking]        = useState(false)
  const [bookingResult,  setBookingResult]  = useState(null)
  const [error,          setError]          = useState('')
  const [showProfilePopup,  setShowProfilePopup]  = useState(false)
  const [profileMissing,    setProfileMissing]    = useState([])
  const [bookingError,      setBookingError]      = useState(null)

  const gold    = '#c9932c'
  const text    = isDark ? '#f1f5f9'           : '#111827'
  const muted   = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const border  = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const surface = {
    background: isDark ? 'rgba(255,255,255,.04)' : '#fff',
    border:     `1px solid ${border}`,
    borderRadius: 16,
    boxShadow:  isDark ? '0 4px 20px rgba(0,0,0,.35)' : '0 1px 8px rgba(0,0,0,.07)',
  }

  // Fetch placement status on mount
  useEffect(() => {
    fetch('/api/placement/my-report')
      .then(r => r.ok ? r.json() : { status: 'none', booking: null, report: null })
      .then(data => {
        if (data.status === 'none') {
          setPlacementStatus('booking_flow')
        } else {
          setPlacementStatus(data.status)
          setPlacementData({ booking: data.booking, report: data.report })
        }
      })
      .catch(() => setPlacementStatus('booking_flow'))
  }, [])

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true)
    setError('')
    try {
      const slotsRes = await fetch('/api/placement/slots')
      if (!slotsRes.ok) throw new Error()
      const slotsData = await slotsRes.json()
      if (!slotsData) throw new Error()
      setSlots(slotsData)
    } catch {
      setError(isAr ? 'فشل تحميل المواعيد المتاحة' : 'Failed to load available slots')
    } finally {
      setSlotsLoading(false)
    }
  }, [isAr])

  function chooseType(type) {
    if (type === 'ai') { setStep('ai'); return }
    setStep('slots')
    loadSlots()
  }

  async function handleSlotClick(date, slotMin, dateLabel) {
    const pending = { date, slotMin, dateLabel }
    try {
      const profile = await fetch('/api/profile').then(r => r.ok ? r.json() : null)
      const missing = []
      if (!profile?.name?.trim())           missing.push(isAr ? 'الاسم الكامل' : 'Full Name')
      if (!profile?.dob)                    missing.push(isAr ? 'تاريخ الميلاد' : 'Date of Birth')
      if (!profile?.educationLevel?.trim()) missing.push(isAr ? 'المستوى التعليمي' : 'Education Level')
      if (missing.length > 0) {
        setProfileMissing(missing)
        setShowProfilePopup(true)
        return
      }
    } catch { /* proceed anyway */ }
    setSelectedSlot({ ...pending, timeLabel: slotMinToLabel(slotMin) })
    setStep('confirm')
  }

  async function confirmBooking() {
    setBooking(true)
    setBookingError(null)
    try {
      const res = await fetch('/api/placement/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedSlot.date, slotMin: selectedSlot.slotMin }),
      })
      let data = {}
      try { data = await res.json() } catch {}
      if (!res.ok) {
        setBookingError({ code: data.code || 'unknown', message: data.error || '' })
        return
      }
      setBookingResult(data.booking)
      setStep('done')
      onBooked?.()
    } catch {
      setBookingError({ code: 'unknown', message: '' })
    } finally {
      setBooking(false)
    }
  }

  const allSlotMins = slots ? (() => {
    const set = new Set()
    Object.values(slots.availability).forEach(dayMap => {
      Object.entries(dayMap).forEach(([k, v]) => { if (v > 0) set.add(Number(k)) })
    })
    return [...set].sort((a, b) => a - b)
  })() : []

  const now      = new Date()
  const todayStr = now.toLocaleDateString('en-CA')
  const nowMin   = now.getHours() * 60 + now.getMinutes()

  function isAvailable(date, slotMin) {
    const count = slots?.availability?.[date]?.[slotMin] || 0
    if (count === 0) return false
    if (date < todayStr) return false
    if (date === todayStr && slotMin <= nowMin + 30) return false
    return true
  }

  /* ── LOADING ─────────────────────────────────────────────────────── */
  if (placementStatus === 'loading') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`,
        borderTopColor: gold, animation: 'prSpin .7s linear infinite',
      }}/>
    </div>
  )

  /* ── BOOKED — upcoming session, no report yet ────────────────────── */
  if (placementStatus === 'booked') {
    const b = placementData.booking
    return (
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 4px' }}>
        <div style={{ ...surface, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
            background: 'rgba(16,185,129,.1)', border: '2px solid rgba(16,185,129,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style={{
            display: 'inline-block', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)',
            borderRadius: 100, padding: '4px 16px', marginBottom: 14,
          }}>
            <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', color: '#10b981' }}>
              {isAr ? 'تم الحجز' : 'SESSION CONFIRMED'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: text, margin: '0 0 8px' }}>
            {isAr ? 'لديك جلسة تقييم محجوزة' : 'Your Assessment is Booked'}
          </h2>
          <p style={{ fontSize: '.88rem', color: muted, margin: '0 0 28px', lineHeight: 1.65 }}>
            {isAr
              ? 'لا يمكن حجز أكثر من جلسة في وقت واحد. سيُرسَل إليك تقرير التقييم بعد انتهاء الجلسة.'
              : 'You can only hold one session at a time. Your assessment report will be sent after the session is complete.'}
          </p>

          {/* Session details card */}
          <div style={{
            background: isDark ? 'rgba(255,255,255,.04)' : '#f9fafb',
            border: `1px solid ${border}`,
            borderRadius: 12, padding: '20px 24px',
            marginBottom: 8, textAlign: isAr ? 'right' : 'left',
          }}>
            {[
              { labelEn: 'DATE',      labelAr: 'التاريخ',    value: fmtDate(b.date, isAr) },
              { labelEn: 'TIME',      labelAr: 'الوقت',      value: `${slotMinToLabel(b.slotMin)} (UTC)` },
              { labelEn: 'ASSESSOR',  labelAr: 'المستشار',   value: b.assessorName },
              { labelEn: 'DURATION',  labelAr: 'المدة',      value: isAr ? '٣٠ دقيقة' : '30 minutes' },
            ].map((row, i, arr) => (
              <div key={row.labelEn}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em', color: muted }}>
                    {isAr ? row.labelAr : row.labelEn}
                  </span>
                  <span style={{ fontSize: '.88rem', fontWeight: 600, color: text }}>{row.value}</span>
                </div>
                {i < arr.length - 1 && <div style={{ height: 1, background: border }}/>}
              </div>
            ))}
          </div>

          <p style={{ fontSize: '.78rem', color: muted, margin: 0 }}>
            {isAr
              ? 'ستتلقى رابط الاجتماع قبل ٥ دقائق من بدء الجلسة عبر البريد الإلكتروني والإشعارات.'
              : 'You will receive your meeting link 5 minutes before the session starts via email and notifications.'}
          </p>
        </div>
      </div>
    )
  }

  /* ── REPORT PENDING — session done, assessor hasn't submitted yet ── */
  if (placementStatus === 'report_pending') {
    const b = placementData.booking
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '0 4px' }}>
        <div style={{ ...surface, padding: '48px 40px' }}>
          <div style={{ width: 200, height: 200, margin: '0 auto 20px', position: 'relative' }}>
            <Image src="/images/report.svg" alt="Report in progress" fill style={{ objectFit: 'contain' }} />
          </div>

          <div style={{
            display: 'inline-block',
            background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)',
            borderRadius: 100, padding: '5px 18px', marginBottom: 16,
          }}>
            <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', color: gold }}>
              {isAr ? 'قيد الكتابة' : 'IN PROGRESS'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: text, margin: '0 0 10px' }}>
            {isAr ? 'التقرير قيد الكتابة' : 'Report Writing is in Progress'}
          </h2>
          <p style={{ fontSize: '.9rem', color: muted, margin: '0 auto 28px', lineHeight: 1.7, maxWidth: 400 }}>
            {isAr
              ? 'أكمل مستشارك الأكاديمي جلستك بتاريخ ' + fmtDate(b.date, true) + '. يعمل حالياً على كتابة تقرير تقييمك. ستتلقى إشعاراً فور اكتماله.'
              : `Your academic consultant completed your session on ${fmtDate(b.date, false)}. They are currently writing your assessment report. You will be notified as soon as it is ready.`}
          </p>

          {/* Assessor info */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', borderRadius: 100,
            background: isDark ? 'rgba(255,255,255,.04)' : '#f9fafb',
            border: `1px solid ${border}`,
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={gold} strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ fontSize: '.83rem', color: muted }}>
              {isAr ? 'المستشار:' : 'Assessor:'}{' '}
              <strong style={{ color: text }}>{b.assessorName}</strong>
            </span>
          </div>
        </div>
      </div>
    )
  }

  /* ── REPORT READY — session done + report submitted ──────────────── */
  if (placementStatus === 'report_ready') {
    const report = placementData.report
    const b      = placementData.booking
    const lvlColor = LEVEL_COLORS[report.englishLevel] || gold
    const lvlNameEn = LEVEL_NAMES_EN[report.englishLevel] || ''
    const lvlNameAr = LEVEL_NAMES_AR[report.englishLevel] || ''

    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 4px' }}>
        {/* Result header */}
        <div style={{ ...surface, padding: '32px 36px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)',
            borderRadius: 100, padding: '5px 18px', marginBottom: 16,
          }}>
            <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', color: '#10b981' }}>
              {isAr ? '✓ التقرير جاهز' : '✓ REPORT READY'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: text, margin: '0 0 6px' }}>
            {isAr ? 'نتائج تقييمك' : 'Your Placement Assessment Results'}
          </h2>
          <p style={{ fontSize: '.84rem', color: muted, margin: '0 0 24px' }}>
            {isAr
              ? `بتاريخ ${fmtDate(b.date, true)} — المستشار: ${report.assessorName}`
              : `Session on ${fmtDate(b.date, false)} — Assessed by ${report.assessorName}`}
          </p>

          {/* Level + course chips */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Level chip */}
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              padding: '14px 28px',
              background: `${lvlColor}18`, border: `2px solid ${lvlColor}55`,
              borderRadius: 14,
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: lvlColor, lineHeight: 1 }}>
                {report.englishLevel}
              </span>
              <span style={{ fontSize: '.75rem', color: lvlColor, opacity: .8, marginTop: 4, fontWeight: 600 }}>
                {isAr ? lvlNameAr : lvlNameEn}
              </span>
            </div>

            {/* Suggested course chip */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: isDark ? 'rgba(59,130,246,.1)' : 'rgba(59,130,246,.07)',
              border: '1px solid rgba(59,130,246,.22)',
              maxWidth: 280, textAlign: isAr ? 'right' : 'left',
            }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <div>
                <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em', color: 'rgba(59,130,246,.7)', marginBottom: 2 }}>
                  {isAr ? 'الكورس المقترح' : 'SUGGESTED COURSE'}
                </div>
                <div style={{ fontSize: '.84rem', fontWeight: 700, color: '#3b82f6', lineHeight: 1.3 }}>
                  {report.suggestedCourse}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* English feedback */}
          <div style={{ ...surface, padding: '24px 28px' }}>
            <div style={{
              fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em',
              color: muted, marginBottom: 12, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 4, background: isDark ? 'rgba(255,255,255,.07)' : '#f3f4f6', textAlign: 'center', lineHeight: '20px', fontSize: '.6rem', color: gold, fontWeight: 900 }}>EN</span>
              Assessor Feedback — English
            </div>
            <p style={{
              fontSize: '.88rem', color: text, lineHeight: 1.85,
              margin: 0, whiteSpace: 'pre-wrap', direction: 'ltr', textAlign: 'left',
            }}>
              {report.feedback}
            </p>
          </div>

          {/* Arabic feedback */}
          {report.feedbackAr && (
            <div style={{ ...surface, padding: '24px 28px', borderColor: isDark ? 'rgba(201,147,44,.15)' : 'rgba(201,147,44,.18)' }}>
              <div style={{
                fontSize: '.65rem', fontWeight: 700, letterSpacing: '.06em',
                color: muted, marginBottom: 12, textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 7,
                direction: 'rtl',
              }}>
                <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 4, background: isDark ? 'rgba(201,147,44,.12)' : 'rgba(201,147,44,.08)', textAlign: 'center', lineHeight: '20px', fontSize: '.6rem', color: gold, fontWeight: 900 }}>AR</span>
                تقييم المستشار — العربية
              </div>
              <p style={{
                fontSize: '.88rem', color: text, lineHeight: 1.9,
                margin: 0, whiteSpace: 'pre-wrap', direction: 'rtl', textAlign: 'right',
              }}>
                {report.feedbackAr}
              </p>
            </div>
          )}

          {/* Submitted date */}
          <p style={{ fontSize: '.75rem', color: muted, textAlign: 'center', margin: 0 }}>
            {isAr
              ? `أُرسل التقرير في ${new Date(report.submittedAt).toLocaleDateString('ar-SA', { day: '2-digit', month: 'long', year: 'numeric' })}`
              : `Report submitted on ${new Date(report.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`}
          </p>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════════════
     BOOKING FLOW — only shown when student has never booked
  ══════════════════════════════════════════════════════════════════ */

  /* ── CHOOSE ──────────────────────────────────────────────────────── */
  if (step === 'choose') return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)',
          borderRadius: 100, padding: '4px 16px', marginBottom: 14,
        }}>
          <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', color: gold }}>
            {isAr ? 'الخطوة الأولى' : 'STEP 1 OF 2'}
          </span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: text, margin: '0 0 8px', lineHeight: 1.2 }}>
          {isAr ? 'اختبار تحديد المستوى' : 'Placement Assessment'}
        </h2>
        <p style={{ fontSize: '.92rem', color: muted, margin: 0 }}>
          {isAr ? 'اختر طريقة إجراء اختبار تحديد مستواك' : "Choose how you'd like to take your placement test"}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* AI Card */}
        <div
          onClick={() => chooseType('ai')}
          style={{ ...surface, padding: 32, cursor: 'pointer', textAlign: 'center', transition: 'all .18s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,147,44,.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,147,44,.15)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(0,0,0,.35)' : '0 1px 8px rgba(0,0,0,.07)' }}
        >
          <div style={{ width: 140, height: 140, margin: '0 auto 20px', position: 'relative' }}>
            <Image src="/images/ai-assessor.svg" alt="AI Academic Consultant" fill style={{ objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'inline-block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.3)', color: gold, borderRadius: 100, padding: '3px 12px', marginBottom: 10 }}>
            {isAr ? 'ذكاء اصطناعي' : 'AI POWERED'}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: text, margin: '0 0 8px' }}>
            {isAr ? 'المستشار الأكاديمي الذكي' : 'AI Academic Consultant'}
          </h3>
          <p style={{ fontSize: '.82rem', color: muted, lineHeight: 1.6, margin: 0 }}>
            {isAr ? 'خضّ اختبارك باستخدام نظامنا المدعوم بالذكاء الاصطناعي. متاح على مدار الساعة.' : 'Take your test with our AI-powered system. Available 24/7 at your own pace.'}
          </p>
          <div style={{ marginTop: 20, fontSize: '.8rem', fontWeight: 600, color: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {isAr ? 'ابدأ الاختبار' : 'Start Test'}
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={gold} strokeWidth="2"><polyline points={isAr ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/></svg>
          </div>
        </div>

        {/* Human Teacher Card */}
        <div
          onClick={() => chooseType('human')}
          style={{ ...surface, padding: 32, cursor: 'pointer', textAlign: 'center', transition: 'all .18s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,147,44,.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,147,44,.15)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(0,0,0,.35)' : '0 1px 8px rgba(0,0,0,.07)' }}
        >
          <div style={{ width: 140, height: 140, margin: '0 auto 20px', position: 'relative' }}>
            <Image src="/images/human-teacher.svg" alt="Human Academic Consultant" fill style={{ objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'inline-block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.3)', color: gold, borderRadius: 100, padding: '3px 12px', marginBottom: 10 }}>
            {isAr ? 'معلم بشري' : 'HUMAN TEACHER'}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: text, margin: '0 0 8px' }}>
            {isAr ? 'المستشار الأكاديمي البشري' : 'Human Academic Consultant'}
          </h3>
          <p style={{ fontSize: '.82rem', color: muted, lineHeight: 1.6, margin: 0 }}>
            {isAr ? 'احجز جلسة شخصية مع مستشار أكاديمي معتمد وخبير في قياس مستويات اللغة.' : 'Book a one-on-one session with a certified academic consultant for a personal evaluation.'}
          </p>
          <div style={{ marginTop: 20, fontSize: '.8rem', fontWeight: 600, color: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {isAr ? 'احجز موعدًا' : 'Book a Slot'}
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={gold} strokeWidth="2"><polyline points={isAr ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/></svg>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── AI COMING SOON ──────────────────────────────────────────────── */
  if (step === 'ai') return (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ ...surface, padding: '52px 40px' }}>
        <div style={{ width: 160, height: 160, margin: '0 auto 32px', position: 'relative' }}>
          <Image src="/images/ai-assessor.svg" alt="AI Academic Consultant" fill style={{ objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'inline-block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.14em', background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)', color: gold, borderRadius: 100, padding: '4px 16px', marginBottom: 18 }}>
          {isAr ? 'قريبًا' : 'COMING SOON'}
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: text, margin: '0 0 12px' }}>
          {isAr ? 'نعمل على هذا...' : "We're working on it"}
        </h2>
        <p style={{ fontSize: '.9rem', color: muted, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 32px' }}>
          {isAr ? 'نظام التقييم بالذكاء الاصطناعي قيد التطوير. سيكون متاحًا قريبًا.' : 'Our AI assessment system is under development and will be available soon. In the meantime, you can continue with a human academic consultant.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setStep('choose')} style={{ padding: '11px 28px', borderRadius: 10, background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.3)', color: gold, fontWeight: 700, fontSize: '.87rem', cursor: 'pointer' }}>
            {isAr ? '← العودة' : '← Back to Options'}
          </button>
          <button onClick={() => chooseType('human')} style={{ padding: '11px 28px', borderRadius: 10, background: gold, border: 'none', color: '#fff', fontWeight: 700, fontSize: '.87rem', cursor: 'pointer' }}>
            {isAr ? 'احجز مع مستشار أكاديمي بشري' : 'Book Human Academic Consultant'}
          </button>
        </div>
      </div>
    </div>
  )

  /* ── SLOT PICKER ─────────────────────────────────────────────────── */
  if (step === 'slots') return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setStep('choose')} style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 9, background: 'none', border: `1px solid ${border}`, color: muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points={isAr ? '9 18 15 12 9 6' : '15 18 9 12 15 6'}/></svg>
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: text, margin: '0 0 4px' }}>
            {isAr ? 'اختر موعدًا متاحًا' : 'Select an Available Time Slot'}
          </h2>
          <p style={{ fontSize: '.82rem', color: muted, margin: 0 }}>
            {isAr ? 'المواعيد المتاحة هذا الأسبوع — انقر على موعد لحجزه' : 'Available slots for this week — click a slot to book it'}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontSize: '.84rem' }}>{error}</div>
      )}

      {/* Profile completion popup */}
      {showProfilePopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ ...surface, maxWidth: 420, width: '100%', padding: '40px 36px', textAlign: 'center', borderRadius: 20 }}>
            <div style={{ width: 140, height: 140, margin: '0 auto 24px', position: 'relative' }}>
              <Image src="/images/finish-your-profile.svg" alt="" fill style={{ objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: text, margin: '0 0 8px' }}>
              {isAr ? 'أكمل ملفك الشخصي أولاً' : 'Complete Your Profile First'}
            </h3>
            <p style={{ fontSize: '.84rem', color: muted, margin: '0 0 20px', lineHeight: 1.6 }}>
              {isAr ? 'يجب إكمال الحقول التالية قبل حجز موعد التقييم:' : 'The following fields are required before booking a placement session:'}
            </p>
            <div style={{ background: 'rgba(201,147,44,.07)', border: '1px solid rgba(201,147,44,.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, textAlign: isAr ? 'right' : 'left' }}>
              {profileMissing.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: '.84rem', color: text }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={gold} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowProfilePopup(false)} style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: '.84rem', cursor: 'pointer', background: 'none', border: `1px solid ${border}`, color: muted }}>
                {isAr ? 'لاحقاً' : 'Later'}
              </button>
              <button onClick={() => router.push('/profile?tab=academic')} style={{ padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: '.84rem', cursor: 'pointer', background: gold, border: 'none', color: '#fff' }}>
                {isAr ? 'أكمل الملف الشخصي' : 'Complete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {slotsLoading ? (
        <div style={{ ...surface, padding: 60, textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 16px', border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`, borderTopColor: gold, animation: 'prSpin 0.7s linear infinite' }}/>
          <p style={{ color: muted, fontSize: '.87rem' }}>{isAr ? 'جارٍ تحميل المواعيد...' : 'Loading available slots...'}</p>
        </div>
      ) : allSlotMins.length === 0 ? (
        <div style={{ ...surface, padding: 60, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px', background: 'rgba(201,147,44,.08)', border: '1.5px dashed rgba(201,147,44,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={gold} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <p style={{ color: text, fontWeight: 700, marginBottom: 6 }}>{isAr ? 'لا توجد مواعيد متاحة هذا الأسبوع' : 'No available slots this week'}</p>
          <p style={{ color: muted, fontSize: '.8rem' }}>{isAr ? 'تحقق مجددًا الأسبوع القادم' : 'Please check back next week'}</p>
        </div>
      ) : (
        <div style={{ ...surface, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{ padding: '14px 16px', textAlign: isAr ? 'right' : 'left', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', color: isDark ? 'rgba(255,255,255,.35)' : '#9ca3af', borderBottom: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,.02)' : '#fafafa', whiteSpace: 'nowrap', width: 90 }}>
                    {isAr ? 'الوقت' : 'TIME'}
                  </th>
                  {slots.dates.map(d => (
                    <th key={d.date} style={{ padding: '14px 8px', textAlign: 'center', borderBottom: `1px solid ${border}`, borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f3f4f6'}`, background: isDark ? 'rgba(255,255,255,.02)' : '#fafafa', minWidth: 80 }}>
                      <div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.1em', color: gold }}>{d.shortLabel}</div>
                      <div style={{ fontSize: '.75rem', color: muted, marginTop: 2 }}>{d.monthDay}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSlotMins.map((slotMin, ri) => (
                  <tr key={slotMin} style={{ background: ri % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,.015)' : 'rgba(0,0,0,.012)') }}>
                    <td style={{ padding: '8px 16px', fontSize: '.78rem', fontWeight: 600, color: muted, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}`, whiteSpace: 'nowrap' }}>
                      {slotMinToLabel(slotMin)}
                    </td>
                    {slots.dates.map(d => {
                      const avail = isAvailable(d.date, slotMin)
                      return (
                        <td key={d.date} style={{ padding: '6px 8px', textAlign: 'center', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}`, borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}` }}>
                          {avail ? (
                            <button
                              onClick={() => handleSlotClick(d.date, slotMin, `${d.dayLabel}, ${d.monthDay}`)}
                              style={{ width: '100%', padding: '7px 4px', borderRadius: 8, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', color: '#10b981', fontSize: '.73rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,.1)'; e.currentTarget.style.color = '#10b981' }}
                            >
                              {isAr ? 'متاح' : 'Free'}
                            </button>
                          ) : (
                            <div style={{ padding: '7px 4px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,.025)' : '#f9fafb', border: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#efefef'}`, color: isDark ? 'rgba(255,255,255,.1)' : '#d1d5db', fontSize: '.72rem', fontWeight: 600, userSelect: 'none' }}>
                              {isAr ? 'محجوز' : 'Full'}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 20, borderRadius: 5, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)' }}/>
              <span style={{ fontSize: '.74rem', color: muted }}>{isAr ? 'موعد متاح (انقر للحجز)' : 'Available (click to book)'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 20, borderRadius: 5, background: isDark ? 'rgba(255,255,255,.025)' : '#f9fafb', border: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#efefef'}` }}/>
              <span style={{ fontSize: '.74rem', color: muted }}>{isAr ? 'غير متاح / محجوز' : 'Unavailable / Full'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  /* ── CONFIRM ─────────────────────────────────────────────────────── */
  if (step === 'confirm') {
    const isAlreadyBooked = bookingError?.code === 'already_booked'
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ ...surface, padding: '40px 36px' }}>
          {bookingError ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(217,119,6,.09)', border: '2px solid rgba(217,119,6,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isAlreadyBooked ? (
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#d97706" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#d97706" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                )}
              </div>
              <div style={{ display: 'inline-block', background: 'rgba(217,119,6,.1)', border: '1px solid rgba(217,119,6,.25)', borderRadius: 100, padding: '3px 14px', marginBottom: 14 }}>
                <span style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.14em', color: '#d97706' }}>{isAr ? 'لم يتم الحجز' : 'BOOKING FAILED'}</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: text, margin: '0 0 12px', lineHeight: 1.3 }}>
                {isAr ? (isAlreadyBooked ? 'لديك جلسة محجوزة بالفعل' : 'احتُلّ هذا الموعد للتو') : (isAlreadyBooked ? 'You Already Have a Session' : 'That Slot Was Just Taken')}
              </h2>
              <p style={{ fontSize: '.875rem', color: muted, lineHeight: 1.7, margin: '0 auto 28px', maxWidth: 360 }}>
                {isAr
                  ? (isAlreadyBooked ? 'لديك جلسة تقييم مؤكدة بالفعل.' : 'طالب آخر حجز هذا الموعد قبلك بثوانٍ. عُد واختر موعداً آخر.')
                  : (isAlreadyBooked ? 'You already have a confirmed placement session.' : 'Another student secured this slot just seconds before you. Pick a different time.')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!isAlreadyBooked && (
                  <button onClick={() => { setBookingError(null); setStep('slots'); loadSlots() }} style={{ padding: '13px', borderRadius: 10, border: 'none', background: gold, color: '#fff', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer' }}>
                    {isAr ? 'اختر موعداً آخر' : 'Pick Another Slot'}
                  </button>
                )}
                <button onClick={() => { setBookingError(null); setStep('choose'); setSlots(null) }} style={{ padding: '12px', borderRadius: 10, background: isAlreadyBooked ? gold : 'none', border: isAlreadyBooked ? 'none' : `1px solid ${border}`, color: isAlreadyBooked ? '#fff' : muted, fontWeight: 600, fontSize: '.87rem', cursor: 'pointer' }}>
                  {isAr ? 'العودة إلى البداية' : 'Back to Start'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 16px', background: 'rgba(201,147,44,.1)', border: '1.5px solid rgba(201,147,44,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={gold} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="14" y2="18"/></svg>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: text, margin: '0 0 6px' }}>{isAr ? 'تأكيد الحجز' : 'Confirm Your Booking'}</h2>
                <p style={{ fontSize: '.84rem', color: muted, margin: 0 }}>{isAr ? 'راجع التفاصيل وأكّد موعدك' : 'Review the details below and confirm your session'}</p>
              </div>

              <div style={{ background: isDark ? 'rgba(255,255,255,.04)' : '#f9fafb', border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { l: isAr ? 'النوع' : 'TYPE', v: isAr ? 'اختبار تحديد المستوى' : 'Placement Assessment', vc: gold },
                    { l: isAr ? 'التاريخ' : 'DATE', v: selectedSlot.dateLabel },
                    { l: isAr ? 'الوقت' : 'TIME', v: `${selectedSlot.timeLabel} (UTC)` },
                    { l: isAr ? 'المدة' : 'DURATION', v: isAr ? '٣٠ دقيقة' : '30 minutes' },
                  ].map((row, i, arr) => (
                    <div key={row.l}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '.8rem', color: muted, fontWeight: 600 }}>{row.l}</span>
                        <span style={{ fontSize: '.87rem', fontWeight: 700, color: row.vc || text }}>{row.v}</span>
                      </div>
                      {i < arr.length - 1 && <div style={{ height: 1, background: border, marginTop: 14 }}/>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(201,147,44,.07)', border: '1px solid rgba(201,147,44,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 24, fontSize: '.8rem', color: muted }}>
                {isAr ? 'سيُرسَل رابط الاجتماع وتفاصيل الجلسة إلى بريدك الإلكتروني بعد تأكيد الحجز.' : 'A meeting link and session details will be sent to your email after confirmation.'}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep('slots')} disabled={booking} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'none', border: `1px solid ${border}`, color: muted, fontWeight: 600, fontSize: '.87rem', cursor: 'pointer' }}>
                  {isAr ? 'رجوع' : 'Back'}
                </button>
                <button onClick={confirmBooking} disabled={booking} style={{ flex: 2, padding: '12px', borderRadius: 10, background: booking ? 'rgba(201,147,44,.4)' : gold, border: 'none', color: '#fff', fontWeight: 700, fontSize: '.87rem', cursor: booking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {booking ? (
                    <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'prSpin 0.7s linear infinite' }}/>{isAr ? 'جارٍ الحجز...' : 'Booking...'}</>
                  ) : (isAr ? 'تأكيد الحجز' : 'Confirm Booking')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  /* ── DONE ────────────────────────────────────────────────────────── */
  if (step === 'done' && bookingResult) return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ ...surface, padding: '48px 36px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px', background: 'rgba(16,185,129,.1)', border: '2px solid rgba(16,185,129,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ display: 'inline-block', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 100, padding: '4px 16px', marginBottom: 16 }}>
          <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', color: '#10b981' }}>{isAr ? 'تم الحجز بنجاح' : 'BOOKING CONFIRMED'}</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: text, margin: '0 0 8px' }}>{isAr ? 'جلستك محجوزة!' : "You're all set!"}</h2>
        <p style={{ fontSize: '.88rem', color: muted, margin: '0 0 28px' }}>{isAr ? 'تم تأكيد جلسة تقييمك بنجاح' : 'Your placement assessment has been confirmed'}</p>

        <div style={{ background: isDark ? 'rgba(255,255,255,.04)' : '#f9fafb', border: `1px solid ${border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '.78rem', color: muted }}>{isAr ? 'التاريخ' : 'Date'}</span>
            <span style={{ fontSize: '.85rem', fontWeight: 600, color: text }}>{bookingResult.date}</span>
          </div>
          <div style={{ height: 1, background: border, marginBottom: 10 }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '.78rem', color: muted }}>{isAr ? 'الوقت' : 'Time'}</span>
            <span style={{ fontSize: '.85rem', fontWeight: 600, color: text }}>{bookingResult.time} (UTC)</span>
          </div>
        </div>

        <p style={{ fontSize: '.8rem', color: muted, marginBottom: 24 }}>
          {isAr ? 'تم إرسال تفاصيل الجلسة إلى بريدك الإلكتروني.' : 'Session details have been sent to your registered email address.'}
        </p>
      </div>
    </div>
  )

  return null
}
