'use client'

import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const DAYS_EN   = ['Mo','Tu','We','Th','Fr','Sa','Su']
const DAYS_AR   = ['إث','ثل','أر','خم','جم','سب','أح']

function daysInMonth(y, m)  { return new Date(y, m + 1, 0).getDate() }
function firstWeekday(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7 } // Mon=0

export default function DatePicker({ value, onChange, label, placeholder }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const seed  = value ? new Date(value) : new Date()
  const [open,    setOpen]    = useState(false)
  const [vy,      setVy]      = useState(seed.getFullYear())
  const [vm,      setVm]      = useState(seed.getMonth())
  const [showMP,  setShowMP]  = useState(false)
  const [showYP,  setShowYP]  = useState(false)
  const ref = useRef(null)

  const MONTHS = isAr ? MONTHS_AR : MONTHS_EN
  const DAYS   = isAr ? DAYS_AR   : DAYS_EN

  // Close on outside click
  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false); setShowMP(false); setShowYP(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Sync view when external value changes
  useEffect(() => {
    if (value) { const d = new Date(value); setVy(d.getFullYear()); setVm(d.getMonth()) }
  }, [value])

  const selY = value ? new Date(value).getFullYear() : null
  const selM = value ? new Date(value).getMonth()    : null
  const selD = value ? new Date(value).getDate()     : null
  const now  = new Date()

  function prevMonth() { vm === 0  ? (setVm(11), setVy(y => y-1)) : setVm(m => m-1) }
  function nextMonth() { vm === 11 ? (setVm(0),  setVy(y => y+1)) : setVm(m => m+1) }

  function select(y, m, d) {
    onChange(`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`)
    setOpen(false); setShowMP(false); setShowYP(false)
  }

  function display() {
    if (!value) return null
    return new Date(value).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day:'numeric', month:'long', year:'numeric' })
  }

  // Build calendar grid (always 6 weeks = 42 cells)
  const prevDim = daysInMonth(vy, vm === 0 ? 11 : vm - 1)
  const first   = firstWeekday(vy, vm)
  const total   = daysInMonth(vy, vm)
  const cells   = []
  for (let i = first - 1; i >= 0; i--) cells.push({ d: prevDim - i, t: 'prev' })
  for (let d = 1; d <= total; d++)      cells.push({ d, t: 'cur' })
  const rem = 42 - cells.length
  for (let d = 1; d <= rem; d++)        cells.push({ d, t: 'next' })

  const years = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i)

  // Design tokens
  const bg      = isDark ? '#1b2b36' : '#ffffff'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(255,255,255,.28)' : '#b0b8c1'
  const border  = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const inputBg = isDark ? 'rgba(255,255,255,.05)' : '#f9fafb'
  const hover   = isDark ? 'rgba(255,255,255,.09)' : '#f0f0f0'

  const inputStyle = {
    width: '100%', textAlign: isAr ? 'right' : 'left', padding: '10px 14px',
    background: inputBg, border: `1.5px solid ${open ? '#c9932c' : border}`,
    borderRadius: 10, cursor: 'pointer', color: value ? text : muted,
    fontSize: '.9rem', fontFamily: 'inherit', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', gap: 8,
    transition: 'border-color .15s',
  }

  const dropdownStyle = {
    position: 'absolute', top: '100%', left: 0, background: bg,
    border: `1px solid ${border}`, borderRadius: 10, padding: 4,
    zIndex: 30, maxHeight: 200, overflowY: 'auto',
    boxShadow: isDark ? '0 4px 24px rgba(0,0,0,.5)' : '0 4px 24px rgba(0,0,0,.1)',
  }

  function dropItem(active, onClick, children) {
    return (
      <button onClick={onClick} style={{
        display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px',
        background: active ? 'rgba(201,147,44,.13)' : 'none', border: 'none',
        borderRadius: 7, cursor: 'pointer', color: active ? '#c9932c' : text,
        fontWeight: active ? 700 : 400, fontFamily: 'inherit', fontSize: '.87rem',
      }}>
        {children}
      </button>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {/* Label */}
      {label && (
        <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,.5)' : '#6b7280', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <button type="button" onClick={() => { setOpen(o => !o); setShowMP(false); setShowYP(false) }} style={inputStyle}>
        <span>{display() || (placeholder || (isAr ? 'اختر تاريخاً' : 'Select a date'))}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke={value ? '#c9932c' : muted} strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {/* Calendar popup — always ltr internally */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', [isAr ? 'right' : 'left']: 0, background: bg, borderRadius: 16, padding: '18px 16px', boxShadow: isDark ? '0 8px 40px rgba(0,0,0,.55)' : '0 8px 40px rgba(0,0,0,.13)', border: `1px solid ${border}`, zIndex: 1000, width: 320, direction: 'ltr' }}>

          {/* ── Navigation header ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>

            {/* Prev month */}
            <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 8, background: 'none', border: `1px solid ${border}`, cursor: 'pointer', color: text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
            </button>

            {/* Month + Year selectors */}
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>

              {/* Month */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setShowMP(p => !p); setShowYP(false) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '.98rem', color: text, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderRadius: 6, fontFamily: 'inherit' }}>
                  {MONTHS[vm]}
                  <svg viewBox="0 0 10 6" width="8" height="5"><path d="M0 0l5 6 5-6z" fill="#c9932c"/></svg>
                </button>
                {showMP && (
                  <div style={{ ...dropdownStyle, minWidth: 140 }}>
                    {MONTHS.map((mo, i) => (
                      <div key={i}>{dropItem(i === vm, () => { setVm(i); setShowMP(false) }, mo)}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Year */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setShowYP(p => !p); setShowMP(false) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '.98rem', color: text, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderRadius: 6, fontFamily: 'inherit' }}>
                  {vy}
                  <svg viewBox="0 0 10 6" width="8" height="5"><path d="M0 0l5 6 5-6z" fill="#c9932c"/></svg>
                </button>
                {showYP && (
                  <div style={{ ...dropdownStyle, minWidth: 90 }}>
                    {years.map(y => (
                      <div key={y}>{dropItem(y === vy, () => { setVy(y); setShowYP(false) }, y)}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Next month */}
            <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 8, background: 'none', border: `1px solid ${border}`, cursor: 'pointer', color: text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* ── Day-of-week headers ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '.75rem', fontWeight: 600, color: muted, padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* ── Day grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((cell, i) => {
              const isCur = cell.t === 'cur'
              const isSel = isCur && cell.d === selD && vm === selM && vy === selY
              const isTod = isCur && cell.d === now.getDate() && vm === now.getMonth() && vy === now.getFullYear()
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (cell.t === 'prev') { prevMonth(); return }
                    if (cell.t === 'next') { nextMonth(); return }
                    select(vy, vm, cell.d)
                  }}
                  style={{
                    aspectRatio: '1', borderRadius: 9,
                    border: isTod && !isSel ? '1.5px solid #c9932c' : '1.5px solid transparent',
                    background: isSel ? '#c9932c' : 'transparent',
                    color: isSel ? '#fff' : !isCur ? muted : text,
                    cursor: 'pointer', fontWeight: isSel || isTod ? 700 : 400,
                    fontSize: '.88rem', fontFamily: 'inherit',
                    opacity: !isCur ? 0.4 : 1, transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = hover }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
                >
                  {cell.d}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
