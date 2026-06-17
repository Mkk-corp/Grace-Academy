'use client'

import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

function pad(n) { return String(n).padStart(2, '0') }

function Drum({ value, onChange, min, max, loop = true }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const border = isDark ? 'rgba(255,255,255,.13)' : '#e5e7eb'
  const muted  = isDark ? 'rgba(255,255,255,.28)' : '#b0b8c1'

  const range = max - min + 1
  function prev() { return loop ? ((value - min - 1 + range) % range) + min : Math.max(min, value - 1) }
  function next() { return loop ? ((value - min + 1) % range)          + min : Math.min(max, value + 1) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none', width: 54 }}>
      {/* Prev */}
      <button
        onClick={() => onChange(prev())}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', width: '100%', textAlign: 'center', fontSize: '1.15rem', color: muted, fontFamily: 'inherit' }}
      >
        {pad(prev())}
      </button>

      {/* Selected row with separator lines */}
      <div style={{ width: '100%', borderTop: `1.5px solid ${border}`, borderBottom: `1.5px solid ${border}`, padding: '12px 0', textAlign: 'center' }}>
        <span style={{ fontSize: '1.45rem', fontWeight: 700, color: text, fontFamily: 'inherit' }}>{pad(value)}</span>
      </div>

      {/* Next */}
      <button
        onClick={() => onChange(next())}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', width: '100%', textAlign: 'center', fontSize: '1.15rem', color: muted, fontFamily: 'inherit' }}
      >
        {pad(next())}
      </button>
    </div>
  )
}

export default function TimePicker({ value, onChange, label }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  // Parse value (HH:MM:SS) or default
  function parse(v) {
    if (!v) return { h: 12, m: 0, s: 0, ampm: 'AM' }
    const [hh, mm, ss = 0] = v.split(':').map(Number)
    const ampm = hh >= 12 ? 'PM' : 'AM'
    const h12 = hh % 12 || 12
    return { h: h12, m: mm, s: ss, ampm }
  }

  const initial = parse(value)
  const [open, setOpen]   = useState(false)
  const [h,    setH]      = useState(initial.h)
  const [m,    setM]      = useState(initial.m)
  const [s,    setS]      = useState(initial.s)
  const [ampm, setAmpm]   = useState(initial.ampm)
  const ref = useRef(null)

  useEffect(() => {
    const p = parse(value)
    setH(p.h); setM(p.m); setS(p.s); setAmpm(p.ampm)
  }, [value])

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function display() {
    if (!value) return null
    const p = parse(value)
    return `${pad(p.h)}:${pad(p.m)}:${pad(p.s)} ${p.ampm}`
  }

  function save() {
    let h24 = h % 12
    if (ampm === 'PM') h24 += 12
    onChange(`${pad(h24)}:${pad(m)}:${pad(s)}`)
    setOpen(false)
  }

  function cancel() {
    const p = parse(value)
    setH(p.h); setM(p.m); setS(p.s); setAmpm(p.ampm)
    setOpen(false)
  }

  // Design tokens
  const bg      = isDark ? '#1b2b36' : '#ffffff'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const border  = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const inputBg = isDark ? 'rgba(255,255,255,.05)' : '#f9fafb'
  const muted   = isDark ? 'rgba(255,255,255,.28)' : '#b0b8c1'

  const inputStyle = {
    width: '100%', textAlign: isAr ? 'right' : 'left', padding: '10px 14px',
    background: inputBg, border: `1.5px solid ${open ? '#c9932c' : border}`,
    borderRadius: 10, cursor: 'pointer', color: value ? text : muted,
    fontSize: '.9rem', fontFamily: 'inherit', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', gap: 8,
    transition: 'border-color .15s',
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
      <button type="button" onClick={() => setOpen(o => !o)} style={inputStyle}>
        <span>{display() || (isAr ? 'اختر وقتاً' : 'Select a time')}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke={value ? '#c9932c' : muted} strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>

      {/* Popup */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', [isAr ? 'right' : 'left']: 0, background: bg, borderRadius: 16, padding: '20px 20px 16px', boxShadow: isDark ? '0 8px 40px rgba(0,0,0,.55)' : '0 8px 40px rgba(0,0,0,.13)', border: `1px solid ${border}`, zIndex: 1000, direction: 'ltr' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '1rem', color: text, marginBottom: 18, fontFamily: 'inherit' }}>
            {isAr ? 'تحديد الوقت' : 'Set time'}
          </div>

          {/* Drums row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Drum value={h} onChange={setH} min={1} max={12} />
            <div style={{ color: muted, fontWeight: 700, fontSize: '1.3rem', paddingBottom: 2, flexShrink: 0 }}>:</div>
            <Drum value={m} onChange={setM} min={0} max={59} />
            <div style={{ color: muted, fontWeight: 700, fontSize: '1.3rem', paddingBottom: 2, flexShrink: 0 }}>:</div>
            <Drum value={s} onChange={setS} min={0} max={59} />

            {/* AM/PM column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8, gap: 4 }}>
              {['AM', 'PM'].map(v => (
                <button
                  key={v}
                  onClick={() => setAmpm(v)}
                  style={{
                    padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: ampm === v ? '#c9932c' : 'transparent',
                    color: ampm === v ? '#fff' : muted,
                    fontWeight: ampm === v ? 700 : 400, fontSize: '.82rem', fontFamily: 'inherit',
                    transition: 'background .1s',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Column labels */}
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {['H', 'M', 'S'].map((lbl, i) => (
              <div key={lbl} style={{ width: 54, textAlign: 'center', fontSize: '.72rem', fontWeight: 600, color: muted, marginRight: i < 2 ? 12 : 0 }}>
                {isAr ? (lbl === 'H' ? 'س' : lbl === 'M' ? 'د' : 'ث') : lbl}
              </div>
            ))}
          </div>

          {/* Cancel / Save */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              onClick={cancel}
              style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: `1.5px solid ${border}`, background: 'none', cursor: 'pointer', color: text, fontFamily: 'inherit', fontWeight: 600, fontSize: '.88rem' }}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={save}
              style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', background: '#c9932c', cursor: 'pointer', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem' }}
            >
              {isAr ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
