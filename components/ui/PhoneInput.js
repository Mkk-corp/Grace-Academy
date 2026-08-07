'use client'

import { useState, useRef, useEffect } from 'react'
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries'

// flagcdn.com only serves these exact widths
const CDN_SIZES = [16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256]
function snapSize(n) {
  return CDN_SIZES.reduce((prev, cur) => Math.abs(cur - n) < Math.abs(prev - n) ? cur : prev)
}

function Flag({ code, size = 20 }) {
  const iso = code.toLowerCase()
  const w   = snapSize(size)
  const w2x = snapSize(size * 2)
  return (
    <img
      src={`https://flagcdn.com/w${w}/${iso}.png`}
      srcSet={`https://flagcdn.com/w${w2x}/${iso}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={code}
      style={{ objectFit: 'cover', borderRadius: 2, display: 'block', flexShrink: 0 }}
    />
  )
}

/**
 * PhoneInput — reusable country-code + phone-number input.
 *
 * Props:
 *   country         Country object (controlled). Defaults to DEFAULT_COUNTRY.
 *   number          Phone number string, digits only (controlled).
 *   onCountryChange (country) => void
 *   onNumberChange  (number)  => void
 *   error           Error message string, or null/undefined.
 *   isAr            Show Arabic country names and RTL layout.
 *   isDark          Dark theme colours.
 *   disabled        Disable the whole field.
 *   placeholder     Override the auto-generated placeholder.
 */
export default function PhoneInput({
  country,
  number = '',
  onCountryChange,
  onNumberChange,
  error,
  isAr = false,
  isDark = false,
  disabled = false,
  placeholder,
}) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef   = useRef(null)
  const searchRef = useRef(null)

  const sel = country || DEFAULT_COUNTRY

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Auto-focus search box when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40)
  }, [open])

  // Filtered list: match English name, Arabic name, or dial code
  const filtered = search.trim()
    ? COUNTRIES.filter(c => {
        const q = search.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          (c.nameAr && c.nameAr.includes(search)) ||
          c.dial.includes(search)
        )
      })
    : COUNTRIES

  // ── Colour tokens ──────────────────────────────────────────────────────────
  const text      = isDark ? '#ffffff'                 : '#1e293b'
  const muted     = isDark ? 'rgba(255,255,255,.35)'   : '#9ca3af'
  const inputBg   = isDark ? 'rgba(255,255,255,.05)'   : '#ffffff'
  const normalBdr = error  ? 'rgba(239,68,68,.55)'     : (isDark ? 'rgba(201,147,44,.22)' : '#e2e8f0')
  const focusBdr  = error  ? 'rgba(239,68,68,.7)'      : 'rgba(201,147,44,.65)'
  const dropBg    = isDark ? '#0d2030'                 : '#ffffff'
  const dropBdr   = isDark ? 'rgba(201,147,44,.28)'    : '#e2e8f0'
  const searchBg  = isDark ? 'rgba(255,255,255,.06)'   : '#f9fafb'
  const searchBdr = isDark ? 'rgba(255,255,255,.1)'    : '#e2e8f0'
  const divider   = isDark ? 'rgba(255,255,255,.04)'   : '#f8fafc'
  const hoverBg   = isDark ? 'rgba(255,255,255,.07)'   : '#f1f5f9'
  const activeBg  = 'rgba(201,147,44,.13)'
  const R         = 12   // border-radius px

  const ph = placeholder ?? (
    `${sel.min}${sel.min !== sel.max ? `–${sel.max}` : ''} ${isAr ? 'أرقام' : 'digits'}`
  )

  // Shared border colours for the two halves of the input row
  const bdr = open ? focusBdr : normalBdr

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>

      {/* ── Input row ── */}
      <div style={{ display: 'flex', width: '100%', direction: 'ltr' }}>

        {/* Country trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => { setOpen(v => !v); setSearch('') }}
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0 10px 0 12px',
            height: 48,
            background: inputBg,
            border: `1.5px solid ${bdr}`,
            borderRight: 'none',
            borderRadius: `${R}px 0 0 ${R}px`,
            color: text,
            cursor: disabled ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
            flexShrink: 0,
            minWidth: 88,
            transition: 'border-color .15s',
            opacity: disabled ? .55 : 1,
          }}
        >
          <Flag code={sel.code} size={20} />
          <span style={{ color: '#c9932c', fontWeight: 700, fontSize: '.82rem', letterSpacing: 0 }}>{sel.dial}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5" width="10" height="10"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Divider line (replaces border-right on trigger) */}
        <div style={{ width: 1, background: bdr, flexShrink: 0, alignSelf: 'stretch', transition: 'background .15s' }} />

        {/* Number input */}
        <input
          type="tel"
          value={number}
          onChange={e => onNumberChange?.(e.target.value.replace(/[^\d\s\-()+]/g, ''))}
          placeholder={ph}
          disabled={disabled}
          dir="ltr"
          style={{
            flex: 1,
            height: 48,
            padding: '0 14px',
            background: inputBg,
            border: `1.5px solid ${bdr}`,
            borderLeft: 'none',
            borderRadius: `0 ${R}px ${R}px 0`,
            color: text,
            fontSize: '.9rem',
            fontFamily: 'inherit',
            outline: 'none',
            minWidth: 0,
            transition: 'border-color .15s',
            opacity: disabled ? .55 : 1,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = focusBdr }}
          onBlur={e => { e.currentTarget.style.borderColor = normalBdr }}
        />
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: '.73rem', color: '#ef4444', marginTop: 5,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Dropdown ── */}
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 300,
            width: 310,
            background: dropBg,
            border: `1.5px solid ${dropBdr}`,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.38)',
          }}
        >
          {/* Search */}
          <div style={{
            padding: '10px 10px 8px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#f0f4f8'}`,
          }}>
            <div style={{ position: 'relative' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" width="14" height="14"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث بالاسم أو الرمز…' : 'Search by name or code…'}
                dir={isAr ? 'rtl' : 'ltr'}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 32px',
                  background: searchBg,
                  border: `1px solid ${searchBdr}`,
                  borderRadius: 8,
                  color: text,
                  fontSize: '.83rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 268, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: muted, fontSize: '.83rem' }}>
                {isAr ? 'لا توجد نتائج' : 'No results'}
              </div>
            ) : filtered.map(c => {
              const isSelected = sel.code === c.code
              return (
                <button
                  key={c.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => { onCountryChange?.(c); setOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 14px',
                    background: isSelected ? activeBg : 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${divider}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    direction: 'ltr',
                    color: text,
                    fontFamily: 'inherit',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = hoverBg }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? activeBg : 'transparent' }}
                >
                  {/* Flag */}
                  <Flag code={c.code} size={24} />

                  {/* Name */}
                  <span style={{
                    flex: 1,
                    fontSize: '.84rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: isAr ? 'right' : 'left',
                    direction: isAr ? 'rtl' : 'ltr',
                  }}>
                    {isAr && c.nameAr ? c.nameAr : c.name}
                  </span>

                  {/* Dial code */}
                  <span style={{
                    color: '#c9932c',
                    fontSize: '.78rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    letterSpacing: 0,
                  }}>
                    {c.dial}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
