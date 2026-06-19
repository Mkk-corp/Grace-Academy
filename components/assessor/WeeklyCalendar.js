'use client'

import { useState, useEffect, useCallback } from 'react'

const DAYS = [
  { key: 'sat', en: 'Sat', arShort: 'السبت',  enFull: 'Saturday',  arFull: 'السبت'   },
  { key: 'sun', en: 'Sun', arShort: 'الأحد',   enFull: 'Sunday',    arFull: 'الأحد'    },
  { key: 'mon', en: 'Mon', arShort: 'الاثنين', enFull: 'Monday',    arFull: 'الاثنين'  },
  { key: 'tue', en: 'Tue', arShort: 'الثلاثاء',enFull: 'Tuesday',   arFull: 'الثلاثاء' },
  { key: 'wed', en: 'Wed', arShort: 'الأربعاء',enFull: 'Wednesday', arFull: 'الأربعاء' },
  { key: 'thu', en: 'Thu', arShort: 'الخميس',  enFull: 'Thursday',  arFull: 'الخميس'  },
  { key: 'fri', en: 'Fri', arShort: 'الجمعة',  enFull: 'Friday',    arFull: 'الجمعة'   },
]

// 32 slots: 420–1350 min (7:00 AM – 10:30 PM), grouped into 16 hour rows × 2 half-rows
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7..22

function minutesToLabel(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${min.toString().padStart(2, '0')} ${p}`
}

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

export default function WeeklyCalendar({ user, isAr, isDark }) {
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(true)
  const weekDates = getThisWeekDates()
  const today = new Date()

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/assessor/schedule')
      const data = await res.json()
      if (data.schedule?.schedule) {
        setSchedule(data.schedule.schedule)
      }
    } catch (e) {
      console.error('[WeeklyCalendar]', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSchedule() }, [fetchSchedule])

  const totalSlots = Object.values(schedule).reduce((sum, s) => sum + (s?.length || 0), 0)
  const activeDays = DAYS.filter(d => (schedule[d.key] || []).length > 0).length
  const GOLD = '#c9932c'

  function isToday(date) {
    return date.toDateString() === today.toDateString()
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--as-muted)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" style={{ animation: 'calSpin 1s linear infinite' }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
        </svg>
        <style>{`@keyframes calSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes calFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes calSpin{to{transform:rotate(360deg)}}
        .cal-half-row{display:grid;gridTemplateColumns:64px repeat(7,1fr);min-height:32px}
        .cal-slot-cell{transition:background .12s}
        .cal-slot-cell.free:hover{filter:brightness(1.08);cursor:default}
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

        {/* ─── Empty state ─── */}
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
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--as-text)', marginBottom: 6 }}>
                {isAr ? 'لم يتم إعداد الجدول بعد' : 'No schedule set up yet'}
              </div>
              <div style={{ fontSize: '.84rem', color: 'var(--as-muted)', maxWidth: 340, lineHeight: 1.6 }}>
                {isAr
                  ? 'انتقل إلى تبويب "جدولي" لتحديد أيام وخانات توافرك الأسبوعية.'
                  : 'Head to the "My Schedule" tab to pick your weekly available days and time slots.'}
              </div>
            </div>
          </div>
        )}

        {/* ─── Calendar grid ─── */}
        {totalSlots > 0 && (
          <div style={{
            background: isDark ? 'rgba(255,255,255,.02)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}`,
            borderRadius: 18, overflow: 'hidden',
            boxShadow: isDark ? '0 2px 20px rgba(0,0,0,.3)' : '0 2px 20px rgba(0,0,0,.06)',
          }}>
            {/* Day header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'}` }}>
              <div style={{ padding: '12px 8px', background: isDark ? 'rgba(255,255,255,.02)' : '#f9fafb' }} />
              {DAYS.map((day, i) => {
                const date = weekDates[i]
                const isNow = isToday(date)
                const slotsOn = (schedule[day.key] || []).length
                return (
                  <div key={day.key} style={{
                    padding: '10px 6px', textAlign: 'center',
                    background: isNow
                      ? (isDark ? 'rgba(201,147,44,.1)' : 'rgba(201,147,44,.06)')
                      : (isDark ? 'rgba(255,255,255,.02)' : '#f9fafb'),
                    borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f0f0f0'}`,
                    position: 'relative',
                  }}>
                    <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.07em', color: isNow ? GOLD : 'var(--as-xmuted)', textTransform: 'uppercase' }}>
                      {isAr ? day.arShort : day.en}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isNow ? GOLD : 'var(--as-text)', lineHeight: 1.2, marginTop: 2 }}>
                      {date.getDate()}
                    </div>
                    {slotsOn > 0 && (
                      <div style={{ fontSize: '.58rem', fontWeight: 700, marginTop: 4, background: 'rgba(201,147,44,.15)', color: GOLD, borderRadius: 100, padding: '1px 6px', display: 'inline-block' }}>
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

            {/* Time rows — each hour = 2 half-rows (:00 and :30) */}
            <div style={{ overflowY: 'auto', maxHeight: 'min(62vh, 680px)' }}>
              {HOURS.map((hour, ri) => {
                const topSlot = hour * 60      // e.g. 420 = 7:00
                const botSlot = hour * 60 + 30 // e.g. 450 = 7:30
                const isLast = ri === HOURS.length - 1
                const rowBorder = isDark ? 'rgba(255,255,255,.04)' : '#f4f4f4'
                const halfBorder = isDark ? 'rgba(255,255,255,.025)' : '#f9f9f9'

                return (
                  <div key={hour} style={{ borderBottom: !isLast ? `1px solid ${rowBorder}` : 'none' }}>
                    {/* :00 half-row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)', minHeight: 32, borderBottom: `1px solid ${halfBorder}` }}>
                      <div style={{
                        padding: '6px 8px 2px',
                        fontSize: '.62rem', fontWeight: 600, color: 'var(--as-xmuted)',
                        textAlign: 'center', direction: 'ltr', flexShrink: 0,
                        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f0f0f0'}`,
                        lineHeight: 1, whiteSpace: 'nowrap',
                      }}>
                        {fmtHour(hour)}
                      </div>
                      {DAYS.map((day, ci) => {
                        const daySlots = schedule[day.key] || []
                        const isFree = daySlots.includes(topSlot)
                        const isNow = isToday(weekDates[ci])
                        return (
                          <div
                            key={day.key}
                            className={`cal-slot-cell${isFree ? ' free' : ''}`}
                            style={{
                              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f4f4f4'}`,
                              background: isFree
                                ? (isDark ? 'rgba(201,147,44,.16)' : 'rgba(201,147,44,.09)')
                                : isNow ? (isDark ? 'rgba(201,147,44,.03)' : 'rgba(201,147,44,.025)') : 'transparent',
                              padding: isFree ? '3px 4px' : 0,
                            }}
                          >
                            {isFree && (
                              <div style={{
                                height: '100%', minHeight: 24,
                                background: isDark ? 'rgba(201,147,44,.22)' : 'rgba(201,147,44,.13)',
                                border: `1px solid ${isDark ? 'rgba(201,147,44,.4)' : 'rgba(201,147,44,.35)'}`,
                                borderRadius: 5,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* :30 half-row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)', minHeight: 32 }}>
                      <div style={{
                        padding: '6px 8px 2px',
                        fontSize: '.58rem', fontWeight: 500, color: 'var(--as-xmuted)',
                        textAlign: 'center', direction: 'ltr',
                        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f0f0f0'}`,
                        opacity: .6, lineHeight: 1, whiteSpace: 'nowrap',
                      }}>
                        :30
                      </div>
                      {DAYS.map((day, ci) => {
                        const daySlots = schedule[day.key] || []
                        const isFree = daySlots.includes(botSlot)
                        const isNow = isToday(weekDates[ci])
                        return (
                          <div
                            key={day.key}
                            className={`cal-slot-cell${isFree ? ' free' : ''}`}
                            style={{
                              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f4f4f4'}`,
                              background: isFree
                                ? (isDark ? 'rgba(201,147,44,.16)' : 'rgba(201,147,44,.09)')
                                : isNow ? (isDark ? 'rgba(201,147,44,.03)' : 'rgba(201,147,44,.025)') : 'transparent',
                              padding: isFree ? '3px 4px' : 0,
                            }}
                          >
                            {isFree && (
                              <div style={{
                                height: '100%', minHeight: 24,
                                background: isDark ? 'rgba(201,147,44,.22)' : 'rgba(201,147,44,.13)',
                                border: `1px solid ${isDark ? 'rgba(201,147,44,.4)' : 'rgba(201,147,44,.35)'}`,
                                borderRadius: 5,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Summary cards ─── */}
        {totalSlots > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 20 }}>
            {DAYS.map((day, i) => {
              const daySlots = (schedule[day.key] || []).sort((a, b) => a - b)
              if (daySlots.length === 0) return null
              const date = weekDates[i]
              const isNow = isToday(date)
              return (
                <div key={day.key} style={{
                  background: isDark ? 'rgba(201,147,44,.06)' : 'rgba(201,147,44,.04)',
                  border: `1px solid ${isNow ? GOLD : 'rgba(201,147,44,.2)'}`,
                  borderRadius: 12, padding: '14px 16px',
                  boxShadow: isNow ? `0 0 0 3px rgba(201,147,44,.1)` : 'none',
                }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {daySlots.map(slot => (
                      <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.7rem', color: 'var(--as-text)', direction: 'ltr' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
                        {minutesToLabel(slot)} – {minutesToLabel(slot + 30)}
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
      </div>
    </>
  )
}
