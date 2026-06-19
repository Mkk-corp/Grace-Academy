'use client'

import { useState, useEffect } from 'react'

const DAYS = [
  { key: 'sat', en: 'Sat', arShort: 'السبت',  enFull: 'Saturday',  arFull: 'السبت'   },
  { key: 'sun', en: 'Sun', arShort: 'الأحد',   enFull: 'Sunday',    arFull: 'الأحد'    },
  { key: 'mon', en: 'Mon', arShort: 'الاثنين', enFull: 'Monday',    arFull: 'الاثنين'  },
  { key: 'tue', en: 'Tue', arShort: 'الثلاثاء',enFull: 'Tuesday',   arFull: 'الثلاثاء' },
  { key: 'wed', en: 'Wed', arShort: 'الأربعاء',enFull: 'Wednesday', arFull: 'الأربعاء' },
  { key: 'thu', en: 'Thu', arShort: 'الخميس',  enFull: 'Thursday',  arFull: 'الخميس'  },
  { key: 'fri', en: 'Fri', arShort: 'الجمعة',  enFull: 'Friday',    arFull: 'الجمعة'   },
]

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7)

function fmtHour(h) {
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:00 ${p}`
}

function getThisWeekDates() {
  const today = new Date()
  const dow = today.getDay()
  const satOffset = (dow - 6 + 7) % 7
  const sat = new Date(today)
  sat.setDate(today.getDate() - satOffset)
  return DAYS.map((_, i) => {
    const d = new Date(sat)
    d.setDate(sat.getDate() + i)
    return d
  })
}

const STORAGE_KEY = 'ga-assessor-schedule'

export default function WeeklyCalendar({ user, isAr, isDark }) {
  const storageKey = `${STORAGE_KEY}-${user?.id || 'anon'}`
  const [schedule, setSchedule] = useState({})
  const weekDates = getThisWeekDates()
  const today = new Date()

  useEffect(() => {
    try {
      const s = localStorage.getItem(storageKey)
      if (s) setSchedule(JSON.parse(s))
    } catch { /* ignore */ }
  }, [storageKey])

  const totalSlots  = Object.values(schedule).reduce((sum, s) => sum + (s?.length || 0), 0)
  const activeDays  = DAYS.filter(d => (schedule[d.key] || []).length > 0).length
  const GOLD        = '#c9932c'

  function isToday(date) {
    return date.toDateString() === today.toDateString()
  }

  function dayOfDate(date) {
    const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    return keys[date.getDay()]
  }

  return (
    <>
      <style>{`
        @keyframes calFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .cal-slot-cell{
          transition:background .12s, border-color .12s;
          cursor:default;
        }
        .cal-slot-cell.free:hover{filter:brightness(1.08)}
      `}</style>

      <div style={{ padding: '28px 20px 60px', animation: 'calFadeUp .28s ease', maxWidth: 1100, margin: '0 auto' }}>

        {/* ─── Header ─── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.14em', color: GOLD, marginBottom: 5 }}>
              {isAr ? 'التقويم الأسبوعي' : 'WEEKLY CALENDAR'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.1rem,2vw,1.45rem)', fontWeight: 900, color: 'var(--as-text)', marginBottom: 6 }}>
              {isAr ? 'خاناتك المتاحة هذا الأسبوع' : 'Your Available Slots This Week'}
            </h2>
            <p style={{ fontSize: '.82rem', color: 'var(--as-muted)' }}>
              {totalSlots === 0
                ? (isAr ? 'لم تحدد أي خانات بعد — اذهب إلى تبويب الجدول لإعداد خاناتك.' : 'No slots set yet — go to the Schedule tab to set your availability.')
                : isAr
                  ? `${totalSlots} خانة متاحة على ${activeDays} أيام هذا الأسبوع`
                  : `${totalSlots} slots available across ${activeDays} day${activeDays > 1 ? 's' : ''} this week`
              }
            </p>
          </div>

          {/* Week range badge */}
          <div style={{
            padding: '10px 16px',
            background: isDark ? 'rgba(201,147,44,.08)' : 'rgba(201,147,44,.06)',
            border: '1px solid rgba(201,147,44,.22)',
            borderRadius: 12, flexShrink: 0,
          }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.08em', color: 'var(--as-muted)', marginBottom: 3 }}>
              {isAr ? 'الأسبوع الحالي' : 'CURRENT WEEK'}
            </div>
            <div style={{ fontSize: '.84rem', fontWeight: 700, color: GOLD, direction: 'ltr' }}>
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' — '}
              {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* ─── No schedule empty state ─── */}
        {totalSlots === 0 && (
          <div style={{
            background: isDark ? 'rgba(255,255,255,.02)' : '#f9fafb',
            border: `1px dashed ${isDark ? 'rgba(255,255,255,.1)' : '#d1d5db'}`,
            borderRadius: 20, padding: '48px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: 14,
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(201,147,44,.08)', border: '1.5px solid rgba(201,147,44,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.7">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="12" y1="14" x2="12" y2="14" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="16" y1="14" x2="16" y2="14" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--as-text)', marginBottom: 6 }}>
                {isAr ? 'لم يتم إعداد الجدول بعد' : 'No schedule set up yet'}
              </div>
              <div style={{ fontSize: '.84rem', color: 'var(--as-muted)', maxWidth: 340, lineHeight: 1.6 }}>
                {isAr
                  ? 'انتقل إلى تبويب "جدولي" لتحديد أيام وخانات توافرك الأسبوعية.'
                  : 'Head to the "My Schedule" tab to pick your weekly available days and time slots.'
                }
              </div>
            </div>
          </div>
        )}

        {/* ─── Calendar grid ─── */}
        {totalSlots > 0 && (
          <div style={{
            background: isDark ? 'rgba(255,255,255,.02)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}`,
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: isDark ? '0 2px 20px rgba(0,0,0,.3)' : '0 2px 20px rgba(0,0,0,.06)',
          }}>

            {/* Day header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '64px repeat(7, 1fr)',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}`,
            }}>
              {/* Time gutter */}
              <div style={{ padding: '12px 8px', background: isDark ? 'rgba(255,255,255,.02)' : '#f9fafb' }} />

              {DAYS.map((day, i) => {
                const date     = weekDates[i]
                const isNow    = isToday(date)
                const slotsOn  = (schedule[day.key] || []).length
                const isSat = dayOfDate(date) === 'sat'

                return (
                  <div
                    key={day.key}
                    style={{
                      padding: '10px 6px',
                      textAlign: 'center',
                      background: isNow
                        ? (isDark ? 'rgba(201,147,44,.1)' : 'rgba(201,147,44,.06)')
                        : (isDark ? 'rgba(255,255,255,.02)' : '#f9fafb'),
                      borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f0f0f0'}`,
                      position: 'relative',
                    }}
                  >
                    <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.07em', color: isNow ? GOLD : 'var(--as-xmuted)', textTransform: 'uppercase' }}>
                      {isAr ? day.arShort : day.en}
                    </div>
                    <div style={{
                      fontSize: '1.05rem', fontWeight: 900, color: isNow ? GOLD : 'var(--as-text)',
                      lineHeight: 1.2, marginTop: 2,
                    }}>
                      {date.getDate()}
                    </div>
                    {slotsOn > 0 && (
                      <div style={{
                        fontSize: '.58rem', fontWeight: 700, marginTop: 4,
                        background: 'rgba(201,147,44,.15)', color: GOLD,
                        borderRadius: 100, padding: '1px 6px',
                        display: 'inline-block',
                      }}>
                        {slotsOn}{isAr ? ' خانة' : ' slots'}
                      </div>
                    )}
                    {isNow && (
                      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: GOLD, borderRadius: '3px 3px 0 0' }} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Time rows */}
            <div style={{ overflowY: 'auto', maxHeight: 'min(62vh, 680px)' }}>
              {HOURS.map((hour, ri) => (
                <div
                  key={hour}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '64px repeat(7, 1fr)',
                    borderBottom: ri < HOURS.length - 1
                      ? `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f4f4f4'}`
                      : 'none',
                    minHeight: 48,
                  }}
                >
                  {/* Hour label */}
                  <div style={{
                    padding: '10px 8px 0',
                    fontSize: '.66rem', fontWeight: 600, color: 'var(--as-xmuted)',
                    textAlign: 'center', direction: 'ltr', flexShrink: 0,
                    borderRight: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f0f0f0'}`,
                    lineHeight: 1, whiteSpace: 'nowrap',
                  }}>
                    {fmtHour(hour)}
                  </div>

                  {/* Day cells */}
                  {DAYS.map((day, ci) => {
                    const daySlots = schedule[day.key] || []
                    const isFree   = daySlots.includes(hour)
                    const isNow    = isToday(weekDates[ci])

                    return (
                      <div
                        key={day.key}
                        className={`cal-slot-cell${isFree ? ' free' : ''}`}
                        style={{
                          borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f4f4f4'}`,
                          background: isFree
                            ? isDark
                              ? 'rgba(201,147,44,.16)'
                              : 'rgba(201,147,44,.09)'
                            : isNow
                              ? isDark ? 'rgba(201,147,44,.03)' : 'rgba(201,147,44,.025)'
                              : 'transparent',
                          position: 'relative',
                          padding: isFree ? '6px 6px' : 0,
                          transition: 'background .1s',
                        }}
                      >
                        {isFree && (
                          <div style={{
                            height: '100%', minHeight: 36,
                            background: isDark ? 'rgba(201,147,44,.22)' : 'rgba(201,147,44,.13)',
                            border: `1px solid ${isDark ? 'rgba(201,147,44,.4)' : 'rgba(201,147,44,.35)'}`,
                            borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Summary cards ─── */}
        {totalSlots > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 20 }}>
            {DAYS.map((day, i) => {
              const daySlots = schedule[day.key] || []
              if (daySlots.length === 0) return null
              const date = weekDates[i]
              const isNow = isToday(date)
              return (
                <div
                  key={day.key}
                  style={{
                    background: isDark ? 'rgba(201,147,44,.06)' : 'rgba(201,147,44,.04)',
                    border: `1px solid ${isNow ? GOLD : 'rgba(201,147,44,.2)'}`,
                    borderRadius: 12, padding: '14px 16px',
                    boxShadow: isNow ? `0 0 0 3px rgba(201,147,44,.1)` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: '.88rem', color: GOLD }}>
                      {isAr ? day.arFull : day.enFull}
                    </div>
                    {isNow && (
                      <div style={{ fontSize: '.6rem', fontWeight: 700, background: GOLD, color: '#fff', borderRadius: 100, padding: '2px 7px' }}>
                        {isAr ? 'اليوم' : 'TODAY'}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {daySlots.map(h => (
                      <div
                        key={h}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: '.73rem', color: 'var(--as-text)', direction: 'ltr',
                        }}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
                        {fmtHour(h)} – {fmtHour(h + 1)}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }).filter(Boolean)}
          </div>
        )}

        {/* ─── Legend ─── */}
        {totalSlots > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.74rem', color: 'var(--as-muted)' }}>
              <div style={{ width: 20, height: 14, borderRadius: 4, background: isDark ? 'rgba(201,147,44,.22)' : 'rgba(201,147,44,.13)', border: '1px solid rgba(201,147,44,.35)' }} />
              {isAr ? 'متاح للحجز' : 'Available for booking'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.74rem', color: 'var(--as-muted)' }}>
              <div style={{ width: 20, height: 14, borderRadius: 4, background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}` }} />
              {isAr ? 'غير متاح' : 'Not available'}
            </div>
            <div style={{ fontSize: '.74rem', color: 'var(--as-xmuted)' }}>
              {isAr ? '· لتعديل خاناتك انتقل إلى تبويب الجدول' : '· To edit slots, go to the Schedule tab'}
            </div>
          </div>
        )}

        {/* ─── Illustration ─── */}
        <div style={{ textAlign: 'center', marginTop: 56, opacity: isDark ? .55 : .85 }}>
          <img
            src="/images/assessor-calendar.svg"
            alt=""
            style={{ width: '100%', maxWidth: 420, height: 'auto' }}
          />
          <div style={{ fontSize: '.78rem', color: 'var(--as-xmuted)', marginTop: 10 }}>
            {isAr
              ? 'يُحدَّث التقويم تلقائياً بناءً على جدولك الأسبوعي'
              : 'Calendar updates automatically from your weekly schedule template'
            }
          </div>
        </div>
      </div>
    </>
  )
}
