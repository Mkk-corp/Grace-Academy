'use client'

import { useState, useEffect } from 'react'

const DAYS = [
  { key: 'sat', en: 'Saturday',  ar: 'السبت'   },
  { key: 'sun', en: 'Sunday',    ar: 'الأحد'    },
  { key: 'mon', en: 'Monday',    ar: 'الاثنين'  },
  { key: 'tue', en: 'Tuesday',   ar: 'الثلاثاء' },
  { key: 'wed', en: 'Wednesday', ar: 'الأربعاء' },
  { key: 'thu', en: 'Thursday',  ar: 'الخميس'  },
  { key: 'fri', en: 'Friday',    ar: 'الجمعة'   },
]

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7)

function fmtHour(h) {
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:00 ${p}`
}

function fmtHourShort(h) {
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}${p}`
}

const STORAGE_KEY = 'ga-assessor-schedule'

function DayCard({ day, slots, onToggleSlot, onToggleDay, isAr, isDark }) {
  const daySlots = slots || []
  const selectedCount = daySlots.length
  const allOn = HOURS.every(h => daySlots.includes(h))
  const someOn = selectedCount > 0 && !allOn

  const GOLD = '#c9932c'
  const surface = isDark ? 'rgba(255,255,255,.03)' : '#fff'
  const border  = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'

  return (
    <div style={{
      background: surface,
      border: `1px solid ${selectedCount > 0 ? (isDark ? 'rgba(201,147,44,.28)' : 'rgba(201,147,44,.3)') : border}`,
      borderRadius: 16,
      overflow: 'hidden',
      transition: 'border-color .2s',
    }}>
      {/* Day header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 18px',
        background: selectedCount > 0
          ? (isDark ? 'rgba(201,147,44,.08)' : 'rgba(201,147,44,.05)')
          : (isDark ? 'rgba(255,255,255,.02)' : '#f9fafb'),
        borderBottom: `1px solid ${border}`,
        gap: 12,
        cursor: 'pointer',
      }} onClick={() => onToggleDay(day.key)}>

        {/* Custom checkbox */}
        <div style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
          border: `2px solid ${allOn ? GOLD : someOn ? GOLD : (isDark ? 'rgba(255,255,255,.2)' : '#d1d5db')}`,
          background: allOn ? GOLD : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transition: 'all .15s',
        }}>
          {allOn && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {someOn && (
            <div style={{ width: 8, height: 2, borderRadius: 1, background: GOLD }} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '.92rem', color: selectedCount > 0 ? GOLD : 'var(--as-text)' }}>
            {isAr ? day.ar : day.en}
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--as-muted)', marginTop: 1 }}>
            {selectedCount === 0
              ? (isAr ? 'لا توجد خانات محددة' : 'No slots selected')
              : isAr
                ? `${selectedCount} خانة محددة`
                : `${selectedCount} slot${selectedCount > 1 ? 's' : ''} selected`
            }
          </div>
        </div>

        {selectedCount > 0 && (
          <div style={{
            fontSize: '.68rem', fontWeight: 700, padding: '3px 10px',
            background: 'rgba(201,147,44,.12)', border: '1px solid rgba(201,147,44,.25)',
            borderRadius: 100, color: GOLD,
          }}>
            {selectedCount} / {HOURS.length}
          </div>
        )}
      </div>

      {/* Slot grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
        gap: 6,
        padding: '14px 14px',
      }}>
        {HOURS.map(h => {
          const on = daySlots.includes(h)
          return (
            <button
              key={h}
              onClick={() => onToggleSlot(day.key, h)}
              style={{
                padding: '6px 4px',
                borderRadius: 8,
                border: `1.5px solid ${on ? GOLD : (isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb')}`,
                background: on
                  ? (isDark ? 'rgba(201,147,44,.18)' : 'rgba(201,147,44,.1)')
                  : (isDark ? 'rgba(255,255,255,.03)' : '#f9fafb'),
                color: on ? GOLD : 'var(--as-muted)',
                fontSize: '.72rem',
                fontWeight: on ? 700 : 500,
                cursor: 'pointer',
                transition: 'all .14s',
                fontFamily: 'inherit',
                letterSpacing: isAr ? 0 : '.01em',
                lineHeight: 1.3,
                textAlign: 'center',
              }}
              onMouseEnter={e => {
                if (!on) {
                  e.currentTarget.style.borderColor = 'rgba(201,147,44,.4)'
                  e.currentTarget.style.background = isDark ? 'rgba(201,147,44,.06)' : 'rgba(201,147,44,.06)'
                  e.currentTarget.style.color = GOLD
                }
              }}
              onMouseLeave={e => {
                if (!on) {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.03)' : '#f9fafb'
                  e.currentTarget.style.color = 'var(--as-muted)'
                }
              }}
            >
              <div>{fmtHourShort(h)}</div>
              <div style={{ fontSize: '.62rem', opacity: .7 }}>–{fmtHourShort(h + 1)}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function WeeklySchedule({ user, isAr, isDark }) {
  const storageKey = `${STORAGE_KEY}-${user?.id || 'anon'}`

  const [schedule, setSchedule] = useState({})
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem(storageKey)
      if (s) setSchedule(JSON.parse(s))
    } catch { /* ignore */ }
  }, [storageKey])

  function toggleSlot(dayKey, hour) {
    setSaved(false)
    setSchedule(prev => {
      const cur = prev[dayKey] || []
      const next = cur.includes(hour) ? cur.filter(h => h !== hour) : [...cur, hour].sort((a, b) => a - b)
      return { ...prev, [dayKey]: next }
    })
  }

  function toggleDay(dayKey) {
    setSaved(false)
    setSchedule(prev => {
      const cur = prev[dayKey] || []
      const allOn = HOURS.every(h => cur.includes(h))
      return { ...prev, [dayKey]: allOn ? [] : [...HOURS] }
    })
  }

  function clearAll() {
    setSaved(false)
    setSchedule({})
  }

  async function saveSchedule() {
    setSaving(true)
    localStorage.setItem(storageKey, JSON.stringify(schedule))
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }

  const totalSlots = Object.values(schedule).reduce((sum, s) => sum + (s?.length || 0), 0)
  const activeDays = DAYS.filter(d => (schedule[d.key] || []).length > 0).length
  const GOLD = '#c9932c'

  return (
    <>
      <style>{`
        @keyframes scFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes scSpinnerRotate{to{transform:rotate(360deg)}}
        @keyframes scCheckPop{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 60px', animation: 'scFadeUp .28s ease' }}>

        {/* ─── Header ─── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.14em', color: GOLD, marginBottom: 5 }}>
            {isAr ? 'إعداد الجدول الأسبوعي' : 'WEEKLY SCHEDULE SETUP'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.1rem,2vw,1.45rem)', fontWeight: 900, color: 'var(--as-text)', marginBottom: 8 }}>
            {isAr ? 'اختر خاناتك المتاحة' : 'Set Your Available Slots'}
          </h2>
          <p style={{ fontSize: '.84rem', color: 'var(--as-muted)', lineHeight: 1.6, maxWidth: 540 }}>
            {isAr
              ? 'حدّد الأيام والساعات التي تكون فيها متاحاً للجلسات. يتكرر هذا الجدول كل أسبوع ويظهر في التقويم ليتمكن الطلاب من الحجز.'
              : 'Pick the days and hours you\'re free for sessions. This weekly pattern repeats automatically and appears on your calendar for students to book.'
            }
          </p>
        </div>

        {/* ─── Sticky action bar ─── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: isDark ? 'rgba(13,27,36,.92)' : 'rgba(248,250,252,.92)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}`,
          borderRadius: 14,
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 20,
          boxShadow: '0 4px 24px rgba(0,0,0,.09)',
        }}>
          {/* Stats */}
          <div style={{ flex: 1, display: 'flex', gap: 20 }}>
            <div>
              <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: 'var(--as-xmuted)', textTransform: 'uppercase' }}>
                {isAr ? 'الخانات' : 'SLOTS'}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: totalSlots > 0 ? GOLD : 'var(--as-muted)', lineHeight: 1 }}>
                {totalSlots}
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--as-border)' }} />
            <div>
              <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: 'var(--as-xmuted)', textTransform: 'uppercase' }}>
                {isAr ? 'الأيام' : 'DAYS'}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: activeDays > 0 ? GOLD : 'var(--as-muted)', lineHeight: 1 }}>
                {activeDays}
              </div>
            </div>
            {totalSlots > 0 && (
              <>
                <div style={{ width: 1, background: 'var(--as-border)' }} />
                <div>
                  <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: 'var(--as-xmuted)', textTransform: 'uppercase' }}>
                    {isAr ? 'ساعات / أسبوع' : 'HRS/WEEK'}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: GOLD, lineHeight: 1 }}>
                    {totalSlots}h
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          {totalSlots > 0 && (
            <button
              onClick={clearAll}
              style={{
                padding: '8px 14px', background: 'none',
                border: `1px solid ${isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb'}`,
                borderRadius: 9, color: 'var(--as-muted)',
                fontSize: '.8rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb'; e.currentTarget.style.color = 'var(--as-muted)' }}
            >
              {isAr ? 'مسح الكل' : 'Clear All'}
            </button>
          )}

          <button
            onClick={saveSchedule}
            disabled={saving}
            style={{
              padding: '9px 20px', borderRadius: 10, border: 'none',
              background: saved ? '#10b981' : GOLD,
              color: '#fff', fontWeight: 700, fontSize: '.85rem',
              cursor: saving ? 'default' : 'pointer',
              fontFamily: 'inherit', transition: 'all .2s',
              display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
              opacity: totalSlots === 0 && !saving ? .5 : 1,
            }}
          >
            {saving ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: 'scSpinnerRotate .8s linear infinite' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                </svg>
                {isAr ? 'جارٍ الحفظ...' : 'Saving...'}
              </>
            ) : saved ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: 'scCheckPop .3s ease' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {isAr ? 'تم الحفظ!' : 'Saved!'}
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                {isAr ? 'حفظ الجدول' : 'Save Schedule'}
              </>
            )}
          </button>
        </div>

        {/* ─── Legend ─── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.76rem', color: 'var(--as-muted)' }}>
            <div style={{ width: 24, height: 16, borderRadius: 4, background: isDark ? 'rgba(201,147,44,.18)' : 'rgba(201,147,44,.1)', border: `1.5px solid ${GOLD}` }} />
            {isAr ? 'متاح' : 'Available'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.76rem', color: 'var(--as-muted)' }}>
            <div style={{ width: 24, height: 16, borderRadius: 4, background: isDark ? 'rgba(255,255,255,.03)' : '#f9fafb', border: `1.5px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}` }} />
            {isAr ? 'غير متاح' : 'Unavailable'}
          </div>
          <div style={{ fontSize: '.76rem', color: 'var(--as-xmuted)' }}>
            {isAr ? '· اضغط على الخانة لتفعيلها · اضغط على اسم اليوم لتحديد الكل' : '· Click a slot to toggle · Click day name to select all'}
          </div>
        </div>

        {/* ─── Day cards ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DAYS.map(day => (
            <DayCard
              key={day.key}
              day={day}
              slots={schedule[day.key]}
              onToggleSlot={toggleSlot}
              onToggleDay={toggleDay}
              isAr={isAr}
              isDark={isDark}
            />
          ))}
        </div>

        {/* ─── Illustration ─── */}
        <div style={{ textAlign: 'center', marginTop: 56, opacity: isDark ? .55 : .85 }}>
          <img
            src="/images/assessor-schedule.svg"
            alt=""
            style={{ width: '100%', maxWidth: 440, height: 'auto' }}
          />
          <div style={{ fontSize: '.8rem', color: 'var(--as-xmuted)', marginTop: 12 }}>
            {isAr
              ? 'جدولك الأسبوعي يُطبَّق تلقائياً على كل أسبوع قادم'
              : 'Your weekly template repeats automatically every week'
            }
          </div>
        </div>
      </div>
    </>
  )
}
