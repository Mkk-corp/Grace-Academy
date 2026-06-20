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

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7..22
const GOLD  = '#c9932c'
const GBLUE = '#1a73e8'

function minutesToLabel(m) {
  const h   = Math.floor(m / 60)
  const min = m % 60
  const p   = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${min.toString().padStart(2, '0')} ${p}`
}

function fmtHour(h) {
  const p   = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:00 ${p}`
}

function getThisWeekDates() {
  const today = new Date()
  const dow   = today.getDay()
  const satOffset = (dow - 6 + 7) % 7
  const sat = new Date(today)
  sat.setDate(today.getDate() - satOffset)
  return DAYS.map((_, i) => {
    const d = new Date(sat)
    d.setDate(sat.getDate() + i)
    return d
  })
}

// Returns Map<YYYY-MM-DD, [{title, startMin, endMin}]>
function parseGoogleEvents(events) {
  const byDate = new Map()
  for (const ev of events) {
    if (ev.isAllDay || !ev.startISO || !ev.endISO) continue
    const start   = new Date(ev.startISO)
    const end     = new Date(ev.endISO)
    const dateStr = start.toLocaleDateString('en-CA')
    if (!byDate.has(dateStr)) byDate.set(dateStr, [])
    byDate.get(dateStr).push({
      title:    ev.title,
      startMin: start.getHours() * 60 + start.getMinutes(),
      endMin:   end.getHours()   * 60 + end.getMinutes(),
    })
  }
  return byDate
}

export default function WeeklyCalendar({ user, isAr, isDark }) {
  const [schedule,     setSchedule]     = useState({})
  const [loading,      setLoading]      = useState(true)
  const [calSynced,    setCalSynced]    = useState(false)
  const [googleEvents, setGoogleEvents] = useState([])
  const weekDates = getThisWeekDates()
  const today     = new Date()

  const fetchSchedule = useCallback(async () => {
    try {
      const res  = await fetch('/api/assessor/schedule')
      const data = await res.json()
      if (data.schedule?.schedule) setSchedule(data.schedule.schedule)
    } catch (e) {
      console.error('[WeeklyCalendar]', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSchedule() }, [fetchSchedule])

  useEffect(() => {
    fetch('/api/assessor/google-calendar/status')
      .then(r => r.json())
      .then(d => {
        if (!d.synced) return
        setCalSynced(true)
        return fetch('/api/assessor/google-calendar/events')
          .then(r => r.json())
          .then(ed => { if (ed.events) setGoogleEvents(ed.events) })
      })
      .catch(() => {})
  }, [])

  const totalSlots = Object.values(schedule).reduce((sum, s) => sum + (s?.length || 0), 0)
  const activeDays = DAYS.filter(d => (schedule[d.key] || []).length > 0).length
  const gcalByDate = parseGoogleEvents(googleEvents)
  const showGrid   = totalSlots > 0 || calSynced

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
        .cal-slot-cell{transition:background .12s}
        .cal-slot-cell.free:hover{filter:brightness(1.08);cursor:default}
        .cal-gcal-title{font-size:.52rem;font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;line-height:1.2;padding:0 3px}
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
              {totalSlots === 0 && !calSynced
                ? (isAr ? 'لم تحدد أي خانات بعد — اذهب إلى تبويب الجدول لإعداد خاناتك.' : 'No slots set yet — go to the Schedule tab to set your availability.')
                : totalSlots > 0
                  ? isAr
                    ? `${totalSlots} خانة متاحة على ${activeDays} أيام هذا الأسبوع`
                    : `${totalSlots} slots available across ${activeDays} day${activeDays > 1 ? 's' : ''} this week`
                  : (isAr ? 'متصل بـ Google Calendar — تظهر أحداثك أدناه.' : 'Connected to Google Calendar — your events appear below.')
              }
            </p>
            {calSynced && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, padding: '3px 10px', background: 'rgba(26,115,232,.08)', border: '1px solid rgba(26,115,232,.2)', borderRadius: 100 }}>
                <svg width="11" height="11" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span style={{ fontSize: '.68rem', fontWeight: 700, color: GBLUE }}>
                  {isAr ? 'Google Calendar متزامن' : 'Google Calendar synced'}
                </span>
              </div>
            )}
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
        {!showGrid && (
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
                  ? 'انتقل إلى تبويب "جدولي" لتحديد خاناتك، أو ربط Google Calendar من إعدادات التوفر.'
                  : 'Go to "My Schedule" to set your slots, or connect Google Calendar in Availability Settings.'}
              </div>
            </div>
          </div>
        )}

        {/* ─── Calendar grid ─── */}
        {showGrid && (
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
                const date    = weekDates[i]
                const isNow   = isToday(date)
                const slotsOn = (schedule[day.key] || []).length
                const dateStr = date.toLocaleDateString('en-CA')
                const gcalOn  = calSynced && (gcalByDate.get(dateStr) || []).length > 0
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
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 4, flexWrap: 'wrap' }}>
                      {slotsOn > 0 && (
                        <div style={{ fontSize: '.58rem', fontWeight: 700, background: 'rgba(201,147,44,.15)', color: GOLD, borderRadius: 100, padding: '1px 6px', display: 'inline-block' }}>
                          {slotsOn}{isAr ? ' خانة' : ' slots'}
                        </div>
                      )}
                      {gcalOn && (
                        <div style={{ fontSize: '.58rem', fontWeight: 700, background: 'rgba(26,115,232,.12)', color: GBLUE, borderRadius: 100, padding: '1px 6px', display: 'inline-block' }}>
                          {(gcalByDate.get(dateStr) || []).length}{isAr ? ' حدث' : ' ev'}
                        </div>
                      )}
                    </div>
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
                const topSlot    = hour * 60
                const botSlot    = hour * 60 + 30
                const isLast     = ri === HOURS.length - 1
                const rowBorder  = isDark ? 'rgba(255,255,255,.04)' : '#f4f4f4'
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
                        const isFree   = daySlots.includes(topSlot)
                        const isNow    = isToday(weekDates[ci])
                        const dateStr  = weekDates[ci].toLocaleDateString('en-CA')
                        const dayGcal  = calSynced ? (gcalByDate.get(dateStr) || []) : []
                        const gcalSlot = dayGcal.find(e => e.startMin < topSlot + 30 && e.endMin > topSlot)
                        return (
                          <div
                            key={day.key}
                            className={`cal-slot-cell${isFree ? ' free' : ''}`}
                            style={{
                              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f4f4f4'}`,
                              background: isFree
                                ? (isDark ? 'rgba(201,147,44,.16)' : 'rgba(201,147,44,.09)')
                                : gcalSlot
                                  ? (isDark ? 'rgba(26,115,232,.14)' : 'rgba(26,115,232,.07)')
                                  : isNow ? (isDark ? 'rgba(201,147,44,.03)' : 'rgba(201,147,44,.025)') : 'transparent',
                              padding: (isFree || gcalSlot) ? '3px 4px' : 0,
                              position: 'relative',
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
                            {!isFree && gcalSlot && (
                              <div style={{
                                height: '100%', minHeight: 24,
                                background: isDark ? 'rgba(26,115,232,.3)' : 'rgba(26,115,232,.13)',
                                border: `1px solid ${isDark ? 'rgba(26,115,232,.5)' : 'rgba(26,115,232,.35)'}`,
                                borderRadius: 5,
                                display: 'flex', alignItems: 'center', overflow: 'hidden',
                              }}>
                                <div className="cal-gcal-title" style={{ color: isDark ? '#93c5fd' : GBLUE }}>
                                  {gcalSlot.title || '·'}
                                </div>
                              </div>
                            )}
                            {isFree && gcalSlot && (
                              <div style={{
                                position: 'absolute', top: 4, right: 4,
                                width: 5, height: 5, borderRadius: '50%',
                                background: GBLUE,
                                boxShadow: '0 0 0 1.5px rgba(255,255,255,.7)',
                              }} />
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
                        const isFree   = daySlots.includes(botSlot)
                        const isNow    = isToday(weekDates[ci])
                        const dateStr  = weekDates[ci].toLocaleDateString('en-CA')
                        const dayGcal  = calSynced ? (gcalByDate.get(dateStr) || []) : []
                        const gcalSlot = dayGcal.find(e => e.startMin < botSlot + 30 && e.endMin > botSlot)
                        return (
                          <div
                            key={day.key}
                            className={`cal-slot-cell${isFree ? ' free' : ''}`}
                            style={{
                              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f4f4f4'}`,
                              background: isFree
                                ? (isDark ? 'rgba(201,147,44,.16)' : 'rgba(201,147,44,.09)')
                                : gcalSlot
                                  ? (isDark ? 'rgba(26,115,232,.14)' : 'rgba(26,115,232,.07)')
                                  : isNow ? (isDark ? 'rgba(201,147,44,.03)' : 'rgba(201,147,44,.025)') : 'transparent',
                              padding: (isFree || gcalSlot) ? '3px 4px' : 0,
                              position: 'relative',
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
                            {!isFree && gcalSlot && (
                              <div style={{
                                height: '100%', minHeight: 24,
                                background: isDark ? 'rgba(26,115,232,.3)' : 'rgba(26,115,232,.13)',
                                border: `1px solid ${isDark ? 'rgba(26,115,232,.5)' : 'rgba(26,115,232,.35)'}`,
                                borderRadius: 5,
                                display: 'flex', alignItems: 'center', overflow: 'hidden',
                              }}>
                                <div className="cal-gcal-title" style={{ color: isDark ? '#93c5fd' : GBLUE }}>
                                  {gcalSlot.title || '·'}
                                </div>
                              </div>
                            )}
                            {isFree && gcalSlot && (
                              <div style={{
                                position: 'absolute', top: 4, right: 4,
                                width: 5, height: 5, borderRadius: '50%',
                                background: GBLUE,
                                boxShadow: '0 0 0 1.5px rgba(255,255,255,.7)',
                              }} />
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
              const date  = weekDates[i]
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
        {showGrid && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.74rem', color: 'var(--as-muted)' }}>
              <div style={{ width: 20, height: 14, borderRadius: 4, background: isDark ? 'rgba(201,147,44,.22)' : 'rgba(201,147,44,.13)', border: '1px solid rgba(201,147,44,.35)' }} />
              {isAr ? 'متاح للحجز' : 'Available for booking'}
            </div>
            {calSynced && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.74rem', color: 'var(--as-muted)' }}>
                <div style={{ width: 20, height: 14, borderRadius: 4, background: isDark ? 'rgba(26,115,232,.3)' : 'rgba(26,115,232,.13)', border: `1px solid ${isDark ? 'rgba(26,115,232,.5)' : 'rgba(26,115,232,.35)'}` }} />
                {isAr ? 'حدث Google Calendar' : 'Google Calendar event'}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.74rem', color: 'var(--as-muted)' }}>
              <div style={{ width: 20, height: 14, borderRadius: 4, background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}` }} />
              {isAr ? 'غير متاح' : 'Not available'}
            </div>
            {totalSlots > 0 && (
              <div style={{ fontSize: '.74rem', color: 'var(--as-xmuted)' }}>
                {isAr ? '· لتعديل خاناتك انتقل إلى تبويب الجدول' : '· To edit slots, go to the Schedule tab'}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
