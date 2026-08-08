'use client'

import { useState, useCallback } from 'react'
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

/* ─── Main Component ──────────────────────────────────────────────── */
export default function PlacementTest({ user, isAr, isDark, onBooked }) {
  const router = useRouter()
  const [step, setStep]                   = useState('choose') // 'choose' | 'ai' | 'slots' | 'confirm' | 'done'
  const [slots, setSlots]                 = useState(null)
  const [slotsLoading, setSlotsLoading]   = useState(false)
  const [alreadyBooked, setAlreadyBooked] = useState(false)
  const [selectedSlot, setSelectedSlot]   = useState(null) // {date,slotMin,dateLabel,timeLabel}
  const [booking, setBooking]             = useState(false)
  const [bookingResult, setBookingResult] = useState(null)
  const [error, setError]                 = useState('')
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [profileMissing, setProfileMissing]     = useState([])
  const [pendingSlot, setPendingSlot]           = useState(null)
  const [bookingError, setBookingError]         = useState(null) // null | { code, message }

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true)
    setError('')
    try {
      const [slotsRes, upcomingRes] = await Promise.all([
        fetch('/api/placement/slots'),
        fetch('/api/placement/upcoming'),
      ])
      if (!slotsRes.ok) throw new Error()
      let slotsData = null
      try { slotsData = await slotsRes.json() } catch { throw new Error() }
      if (!slotsData) throw new Error()
      let upcomingData = null
      try { upcomingData = upcomingRes.ok ? await upcomingRes.json() : null } catch {}
      if (upcomingData?.booking) setAlreadyBooked(true)
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
        setPendingSlot(pending)
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

  // Compute unique slot minutes that have availability across any day
  const allSlotMins = slots ? (() => {
    const set = new Set()
    Object.values(slots.availability).forEach(dayMap => {
      Object.entries(dayMap).forEach(([k, v]) => { if (v > 0) set.add(Number(k)) })
    })
    return [...set].sort((a, b) => a - b)
  })() : []

  // Check if a slot is available (not past, count > 0)
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

  // Shared card container style
  const surface = {
    background: isDark ? 'rgba(255,255,255,.04)' : '#fff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'}`,
    borderRadius: 16,
    boxShadow: isDark
      ? '0 4px 20px rgba(0,0,0,.35)'
      : '0 1px 8px rgba(0,0,0,.07)',
  }

  const gold = '#c9932c'

  /* ── CHOOSE ──────────────────────────────────────────────────────── */
  if (step === 'choose') return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
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
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 8px', lineHeight: 1.2 }}>
          {isAr ? 'اختبار تحديد المستوى' : 'Placement Assessment'}
        </h2>
        <p style={{ fontSize: '.92rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280', margin: 0 }}>
          {isAr ? 'اختر طريقة إجراء اختبار تحديد مستواك' : 'Choose how you\'d like to take your placement test'}
        </p>
      </div>

      {/* Two choice cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* AI Card */}
        <div
          onClick={() => chooseType('ai')}
          style={{
            ...surface, padding: 32, cursor: 'pointer', textAlign: 'center',
            transition: 'all .18s', position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(201,147,44,.5)'
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,147,44,.15)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(0,0,0,.35)' : '0 1px 8px rgba(0,0,0,.07)'
          }}
        >
          {/* Gradient overlay on hover handled via inline style */}
          <div style={{ width: 140, height: 140, margin: '0 auto 20px', position: 'relative' }}>
            <Image src="/images/ai-assessor.svg" alt="AI Academic Consultant" fill style={{ objectFit: 'contain' }} />
          </div>
          <div style={{
            display: 'inline-block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em',
            background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.3)',
            color: gold, borderRadius: 100, padding: '3px 12px', marginBottom: 10,
          }}>
            {isAr ? 'ذكاء اصطناعي' : 'AI POWERED'}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 8px' }}>
            {isAr ? 'المستشار الأكاديمي الذكي' : 'AI Academic Consultant'}
          </h3>
          <p style={{ fontSize: '.82rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280', lineHeight: 1.6, margin: 0 }}>
            {isAr
              ? 'خضّ اختبارك باستخدام نظامنا المدعوم بالذكاء الاصطناعي. متاح على مدار الساعة.'
              : 'Take your test with our AI-powered system. Available 24/7 at your own pace.'}
          </p>
          <div style={{ marginTop: 20, fontSize: '.8rem', fontWeight: 600, color: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {isAr ? 'ابدأ الاختبار' : 'Start Test'}
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={gold} strokeWidth="2">
              <polyline points={isAr ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/>
            </svg>
          </div>
        </div>

        {/* Human Teacher Card */}
        <div
          onClick={() => chooseType('human')}
          style={{
            ...surface, padding: 32, cursor: 'pointer', textAlign: 'center',
            transition: 'all .18s', position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(201,147,44,.5)'
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,147,44,.15)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(0,0,0,.35)' : '0 1px 8px rgba(0,0,0,.07)'
          }}
        >
          <div style={{ width: 140, height: 140, margin: '0 auto 20px', position: 'relative' }}>
            <Image src="/images/human-teacher.svg" alt="Human Academic Consultant" fill style={{ objectFit: 'contain' }} />
          </div>
          <div style={{
            display: 'inline-block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em',
            background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.3)',
            color: gold, borderRadius: 100, padding: '3px 12px', marginBottom: 10,
          }}>
            {isAr ? 'معلم بشري' : 'HUMAN TEACHER'}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 8px' }}>
            {isAr ? 'المستشار الأكاديمي البشري' : 'Human Academic Consultant'}
          </h3>
          <p style={{ fontSize: '.82rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280', lineHeight: 1.6, margin: 0 }}>
            {isAr
              ? 'احجز جلسة شخصية مع مستشار أكاديمي معتمد وخبير في قياس مستويات اللغة.'
              : 'Book a one-on-one session with a certified academic consultant for a personal evaluation.'}
          </p>
          <div style={{ marginTop: 20, fontSize: '.8rem', fontWeight: 600, color: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {isAr ? 'احجز موعدًا' : 'Book a Slot'}
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={gold} strokeWidth="2">
              <polyline points={isAr ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/>
            </svg>
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
        <div style={{
          display: 'inline-block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.14em',
          background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)',
          color: gold, borderRadius: 100, padding: '4px 16px', marginBottom: 18,
        }}>
          {isAr ? 'قريبًا' : 'COMING SOON'}
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 12px' }}>
          {isAr ? 'نعمل على هذا...' : 'We\'re working on it'}
        </h2>
        <p style={{ fontSize: '.9rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 32px' }}>
          {isAr
            ? 'نظام التقييم بالذكاء الاصطناعي قيد التطوير. سيكون متاحًا قريبًا. في هذه الأثناء، يمكنك الاستمرار مع مستشار أكاديمي بشري.'
            : 'Our AI assessment system is under development and will be available soon. In the meantime, you can continue with a human academic consultant.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStep('choose')}
            style={{
              padding: '11px 28px', borderRadius: 10,
              background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.3)',
              color: gold, fontWeight: 700, fontSize: '.87rem', cursor: 'pointer',
            }}
          >
            {isAr ? '← العودة' : '← Back to Options'}
          </button>
          <button
            onClick={() => chooseType('human')}
            style={{
              padding: '11px 28px', borderRadius: 10,
              background: gold, border: 'none',
              color: '#fff', fontWeight: 700, fontSize: '.87rem', cursor: 'pointer',
            }}
          >
            {isAr ? 'احجز مع مستشار أكاديمي بشري' : 'Book Human Academic Consultant'}
          </button>
        </div>
      </div>
    </div>
  )

  /* ── SLOT PICKER ─────────────────────────────────────────────────── */
  if (step === 'slots') return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Back + heading */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => setStep('choose')}
          style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: 9,
            background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`,
            color: isDark ? 'rgba(255,255,255,.55)' : '#6b7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points={isAr ? '9 18 15 12 9 6' : '15 18 9 12 15 6'}/>
          </svg>
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 4px' }}>
            {isAr ? 'اختر موعدًا متاحًا' : 'Select an Available Time Slot'}
          </h2>
          <p style={{ fontSize: '.82rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280', margin: 0 }}>
            {isAr ? 'المواعيد المتاحة هذا الأسبوع — انقر على موعد لحجزه' : 'Available slots for this week — click a slot to book it'}
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20,
          background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
          color: '#ef4444', fontSize: '.84rem',
        }}>{error}</div>
      )}

      {/* Profile completion popup */}
      {showProfilePopup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            ...surface, maxWidth: 420, width: '100%',
            padding: '40px 36px', textAlign: 'center', borderRadius: 20,
          }}>
            <div style={{ width: 140, height: 140, margin: '0 auto 24px', position: 'relative' }}>
              <Image src="/images/finish-your-profile.svg" alt="" fill style={{ objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 8px' }}>
              {isAr ? 'أكمل ملفك الشخصي أولاً' : 'Complete Your Profile First'}
            </h3>
            <p style={{ fontSize: '.84rem', color: isDark ? 'rgba(255,255,255,.5)' : '#6b7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              {isAr
                ? 'يجب إكمال الحقول التالية قبل حجز موعد التقييم:'
                : 'The following fields are required before booking a placement session:'}
            </p>
            <div style={{
              background: 'rgba(201,147,44,.07)', border: '1px solid rgba(201,147,44,.2)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 24, textAlign: isAr ? 'right' : 'left',
            }}>
              {profileMissing.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: '.84rem', color: isDark ? '#f1f5f9' : '#374151' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={gold} strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowProfilePopup(false)}
                style={{
                  padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: '.84rem', cursor: 'pointer',
                  background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,.15)' : '#e5e7eb'}`,
                  color: isDark ? 'rgba(255,255,255,.55)' : '#6b7280',
                }}
              >
                {isAr ? 'لاحقاً' : 'Later'}
              </button>
              <button
                onClick={() => router.push('/profile?tab=academic')}
                style={{
                  padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: '.84rem', cursor: 'pointer',
                  background: gold, border: 'none', color: '#fff',
                }}
              >
                {isAr ? 'أكمل الملف الشخصي' : 'Complete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {alreadyBooked ? (
        /* Student has an active upcoming session — hide the slot table entirely */
        <div style={{ ...surface, padding: '48px 36px', textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', margin: '0 auto 20px',
            background: 'rgba(201,147,44,.1)', border: '1.5px solid rgba(201,147,44,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={gold} strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 8px' }}>
            {isAr ? 'لديك موعد محجوز بالفعل' : 'You Already Have a Session Booked'}
          </h3>
          <p style={{ fontSize: '.84rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280', margin: '0 auto', maxWidth: 340, lineHeight: 1.6 }}>
            {isAr
              ? 'يمكنك حجز موعد واحد فقط في كل مرة. راجع تبويب "جلساتي" للاطلاع على تفاصيل جلستك.'
              : 'You can only hold one session at a time. Head to the My Sessions tab to view your booking details.'}
          </p>
        </div>
      ) : slotsLoading ? (
        <div style={{ ...surface, padding: 60, textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', margin: '0 auto 16px',
            border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`,
            borderTopColor: gold,
            animation: 'prSpin 0.7s linear infinite',
          }}/>
          <p style={{ color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280', fontSize: '.87rem' }}>
            {isAr ? 'جارٍ تحميل المواعيد...' : 'Loading available slots...'}
          </p>
        </div>
      ) : allSlotMins.length === 0 ? (
        <div style={{ ...surface, padding: 60, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(201,147,44,.08)', border: '1.5px dashed rgba(201,147,44,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={gold} strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p style={{ color: isDark ? 'rgba(255,255,255,.55)' : '#374151', fontWeight: 700, marginBottom: 6 }}>
            {isAr ? 'لا توجد مواعيد متاحة هذا الأسبوع' : 'No available slots this week'}
          </p>
          <p style={{ color: isDark ? 'rgba(255,255,255,.3)' : '#9ca3af', fontSize: '.8rem' }}>
            {isAr ? 'تحقق مجددًا الأسبوع القادم' : 'Please check back next week'}
          </p>
        </div>
      ) : (
        <div style={{ ...surface, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
              <thead>
                <tr>
                  {/* Time header cell */}
                  <th style={{
                    padding: '14px 16px', textAlign: isAr ? 'right' : 'left',
                    fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em',
                    color: isDark ? 'rgba(255,255,255,.35)' : '#9ca3af',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}`,
                    background: isDark ? 'rgba(255,255,255,.02)' : '#fafafa',
                    whiteSpace: 'nowrap', width: 90,
                  }}>
                    {isAr ? 'الوقت' : 'TIME'}
                  </th>
                  {slots.dates.map(d => (
                    <th key={d.date} style={{
                      padding: '14px 8px', textAlign: 'center',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}`,
                      borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f3f4f6'}`,
                      background: isDark ? 'rgba(255,255,255,.02)' : '#fafafa',
                      minWidth: 80,
                    }}>
                      <div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.1em', color: gold }}>
                        {d.shortLabel}
                      </div>
                      <div style={{ fontSize: '.75rem', color: isDark ? 'rgba(255,255,255,.5)' : '#6b7280', marginTop: 2 }}>
                        {d.monthDay}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSlotMins.map((slotMin, ri) => (
                  <tr key={slotMin} style={{ background: ri % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,.015)' : 'rgba(0,0,0,.012)') }}>
                    <td style={{
                      padding: '8px 16px', fontSize: '.78rem', fontWeight: 600,
                      color: isDark ? 'rgba(255,255,255,.5)' : '#6b7280',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {slotMinToLabel(slotMin)}
                    </td>
                    {slots.dates.map(d => {
                      const avail = isAvailable(d.date, slotMin)
                      return (
                        <td key={d.date} style={{
                          padding: '6px 8px', textAlign: 'center',
                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}`,
                          borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}`,
                        }}>
                          {avail ? (
                            <button
                              onClick={() => handleSlotClick(d.date, slotMin, `${d.dayLabel}, ${d.monthDay}`)}
                              style={{
                                width: '100%', padding: '7px 4px', borderRadius: 8,
                                background: 'rgba(16,185,129,.1)',
                                border: '1px solid rgba(16,185,129,.3)',
                                color: '#10b981',
                                fontSize: '.73rem', fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all .15s', letterSpacing: '.02em',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#10b981'
                                e.currentTarget.style.color = '#fff'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(16,185,129,.1)'
                                e.currentTarget.style.color = '#10b981'
                              }}
                            >
                              {isAr ? 'متاح' : 'Free'}
                            </button>
                          ) : (
                            <div style={{
                              padding: '7px 4px', borderRadius: 8, textAlign: 'center',
                              background: isDark ? 'rgba(255,255,255,.025)' : '#f9fafb',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#efefef'}`,
                              color: isDark ? 'rgba(255,255,255,.1)' : '#d1d5db',
                              fontSize: '.72rem', fontWeight: 600, letterSpacing: '.02em',
                              userSelect: 'none',
                            }}>
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
          {/* Legend */}
          <div style={{
            padding: '12px 20px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}`,
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 20, borderRadius: 5, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)' }}/>
              <span style={{ fontSize: '.74rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280' }}>
                {isAr ? 'موعد متاح (انقر للحجز)' : 'Available (click to book)'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 20, borderRadius: 5, background: isDark ? 'rgba(255,255,255,.025)' : '#f9fafb', border: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#efefef'}` }}/>
              <span style={{ fontSize: '.74rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280' }}>
                {isAr ? 'غير متاح / محجوز' : 'Unavailable / Full'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  /* ── CONFIRM ─────────────────────────────────────────────────────── */
  if (step === 'confirm') {
    const isAlreadyBooked = bookingError?.code === 'already_booked'
    const errTitle = isAr
      ? (isAlreadyBooked ? 'لديك جلسة محجوزة بالفعل' : 'احتُلّ هذا الموعد للتو')
      : (isAlreadyBooked ? 'You Already Have a Session' : 'That Slot Was Just Taken')
    const errBody = isAr
      ? (isAlreadyBooked
          ? 'لديك جلسة تقييم مؤكدة بالفعل. يمكنك حجز جلسة واحدة فقط في كل مرة. ابحث عن تفاصيل جلستك في تبويب "جلساتي".'
          : 'طالب آخر حجز هذا الموعد قبلك بثوانٍ. عُد واختر موعداً آخر — لا تزال هناك أوقات متاحة في انتظارك.')
      : (isAlreadyBooked
          ? 'You already have a confirmed placement session. Only one session can be active at a time. Head to the My Sessions tab to view your booking details.'
          : 'Another student secured this slot just seconds before you. Head back and pick a different time — there are still open slots available.')

    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ ...surface, padding: '40px 36px' }}>

          {bookingError ? (
            /* ── Gamified error state ─────────────────────────────────── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                background: 'rgba(217,119,6,.09)', border: '2px solid rgba(217,119,6,.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isAlreadyBooked ? (
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#d97706" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#d97706" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                )}
              </div>

              <div style={{
                display: 'inline-block',
                background: 'rgba(217,119,6,.1)', border: '1px solid rgba(217,119,6,.25)',
                borderRadius: 100, padding: '3px 14px', marginBottom: 14,
              }}>
                <span style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.14em', color: '#d97706' }}>
                  {isAr ? 'لم يتم الحجز' : 'BOOKING FAILED'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 12px', lineHeight: 1.3 }}>
                {errTitle}
              </h2>
              <p style={{ fontSize: '.875rem', color: isDark ? 'rgba(255,255,255,.5)' : '#6b7280', lineHeight: 1.7, margin: '0 auto 28px', maxWidth: 360 }}>
                {errBody}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!isAlreadyBooked && (
                  <button
                    onClick={() => { setBookingError(null); setStep('slots'); loadSlots() }}
                    style={{
                      padding: '13px', borderRadius: 10, border: 'none',
                      background: gold, color: '#fff', fontWeight: 700, fontSize: '.9rem',
                      cursor: 'pointer', transition: 'opacity .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {isAr ? 'اختر موعداً آخر' : 'Pick Another Slot'}
                  </button>
                )}
                <button
                  onClick={() => { setBookingError(null); setStep('choose'); setSlots(null) }}
                  style={{
                    padding: '12px', borderRadius: 10,
                    background: isAlreadyBooked ? gold : 'none',
                    border: isAlreadyBooked ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`,
                    color: isAlreadyBooked ? '#fff' : (isDark ? 'rgba(255,255,255,.45)' : '#6b7280'),
                    fontWeight: 600, fontSize: '.87rem', cursor: 'pointer',
                  }}
                >
                  {isAr ? 'العودة إلى البداية' : 'Back to Start'}
                </button>
              </div>
            </div>

          ) : (
            /* ── Normal confirm state ─────────────────────────────────── */
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', margin: '0 auto 16px',
                  background: 'rgba(201,147,44,.1)', border: '1.5px solid rgba(201,147,44,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={gold} strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="8" y1="14" x2="12" y2="14"/>
                    <line x1="8" y1="18" x2="14" y2="18"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 6px' }}>
                  {isAr ? 'تأكيد الحجز' : 'Confirm Your Booking'}
                </h2>
                <p style={{ fontSize: '.84rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280', margin: 0 }}>
                  {isAr ? 'راجع التفاصيل وأكّد موعدك' : 'Review the details below and confirm your session'}
                </p>
              </div>

              {/* Session details */}
              <div style={{
                background: isDark ? 'rgba(255,255,255,.04)' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'}`,
                borderRadius: 12, padding: 20, marginBottom: 24,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.8rem', color: isDark ? 'rgba(255,255,255,.4)' : '#9ca3af', fontWeight: 600 }}>
                      {isAr ? 'النوع' : 'TYPE'}
                    </span>
                    <span style={{ fontSize: '.87rem', fontWeight: 700, color: gold }}>
                      {isAr ? 'اختبار تحديد المستوى' : 'Placement Assessment'}
                    </span>
                  </div>
                  <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,.06)' : '#e5e7eb' }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.8rem', color: isDark ? 'rgba(255,255,255,.4)' : '#9ca3af', fontWeight: 600 }}>
                      {isAr ? 'التاريخ' : 'DATE'}
                    </span>
                    <span style={{ fontSize: '.87rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827' }}>
                      {selectedSlot.dateLabel}
                    </span>
                  </div>
                  <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,.06)' : '#e5e7eb' }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.8rem', color: isDark ? 'rgba(255,255,255,.4)' : '#9ca3af', fontWeight: 600 }}>
                      {isAr ? 'الوقت' : 'TIME'}
                    </span>
                    <span style={{ fontSize: '.87rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827' }}>
                      {selectedSlot.timeLabel} (UTC)
                    </span>
                  </div>
                  <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,.06)' : '#e5e7eb' }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.8rem', color: isDark ? 'rgba(255,255,255,.4)' : '#9ca3af', fontWeight: 600 }}>
                      {isAr ? 'المدة' : 'DURATION'}
                    </span>
                    <span style={{ fontSize: '.87rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827' }}>
                      {isAr ? '٣٠ دقيقة' : '30 minutes'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(201,147,44,.07)', border: '1px solid rgba(201,147,44,.2)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 24,
                fontSize: '.8rem', color: isDark ? 'rgba(255,255,255,.55)' : '#6b7280',
              }}>
                {isAr
                  ? 'سيُرسَل رابط الاجتماع وتفاصيل الجلسة إلى بريدك الإلكتروني بعد تأكيد الحجز.'
                  : 'A meeting link and session details will be sent to your email after confirmation.'}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setStep('slots')}
                  disabled={booking}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,.15)' : '#e5e7eb'}`,
                    color: isDark ? 'rgba(255,255,255,.55)' : '#6b7280',
                    fontWeight: 600, fontSize: '.87rem', cursor: 'pointer',
                  }}
                >
                  {isAr ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={booking}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 10,
                    background: booking ? 'rgba(201,147,44,.4)' : gold, border: 'none',
                    color: '#fff', fontWeight: 700, fontSize: '.87rem',
                    cursor: booking ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {booking ? (
                    <>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
                        animation: 'prSpin 0.7s linear infinite',
                      }}/>
                      {isAr ? 'جارٍ الحجز...' : 'Booking...'}
                    </>
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
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
          background: 'rgba(16,185,129,.1)', border: '2px solid rgba(16,185,129,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <div style={{
          display: 'inline-block', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)',
          borderRadius: 100, padding: '4px 16px', marginBottom: 16,
        }}>
          <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', color: '#10b981' }}>
            {isAr ? 'تم الحجز بنجاح' : 'BOOKING CONFIRMED'}
          </span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 8px' }}>
          {isAr ? 'جلستك محجوزة!' : 'You\'re all set!'}
        </h2>
        <p style={{ fontSize: '.88rem', color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280', margin: '0 0 28px' }}>
          {isAr ? 'تم تأكيد جلسة تقييمك بنجاح' : 'Your placement assessment has been confirmed'}
        </p>

        {/* Session summary */}
        <div style={{
          background: isDark ? 'rgba(255,255,255,.04)' : '#f9fafb',
          border: `1px solid ${isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'}`,
          borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: isAr ? 'right' : 'left',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '.78rem', color: isDark ? 'rgba(255,255,255,.4)' : '#9ca3af' }}>{isAr ? 'التاريخ' : 'Date'}</span>
            <span style={{ fontSize: '.85rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827' }}>{bookingResult.date}</span>
          </div>
          <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,.06)' : '#e5e7eb', marginBottom: 10 }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '.78rem', color: isDark ? 'rgba(255,255,255,.4)' : '#9ca3af' }}>{isAr ? 'الوقت' : 'Time'}</span>
            <span style={{ fontSize: '.85rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827' }}>{bookingResult.time} (UTC)</span>
          </div>
        </div>

        {bookingResult.meetLink ? (
          <a
            href={bookingResult.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '13px 24px', borderRadius: 10, marginBottom: 16,
              background: '#1a73e8', color: '#fff', textDecoration: 'none',
              fontWeight: 700, fontSize: '.9rem',
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            {isAr ? 'انضم إلى الاجتماع' : 'Join Assessment Meeting'}
          </a>
        ) : null}

        <p style={{ fontSize: '.8rem', color: isDark ? 'rgba(255,255,255,.35)' : '#9ca3af', marginBottom: 24 }}>
          {isAr
            ? 'تم إرسال تفاصيل الجلسة إلى بريدك الإلكتروني.'
            : 'Session details have been sent to your registered email address.'}
        </p>

        <button
          onClick={() => { setStep('choose'); setSlots(null); setBookingResult(null); setError('') }}
          style={{
            padding: '10px 24px', borderRadius: 10,
            background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.3)',
            color: gold, fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
          }}
        >
          {isAr ? 'العودة إلى البداية' : 'Back to Start'}
        </button>
      </div>
    </div>
  )

  return null
}
