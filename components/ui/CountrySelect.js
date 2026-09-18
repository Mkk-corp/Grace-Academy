'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import 'flag-icons/css/flag-icons.min.css'

function FlagIcon({ code }) {
  if (!code || code === 'OTHER') {
    return <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0, width: 24, textAlign: 'center', display: 'inline-block' }}>🌍</span>
  }
  return (
    <span
      className={`fi fi-${code.toLowerCase()}`}
      style={{ width: 20, height: 15, borderRadius: 2, flexShrink: 0, display: 'inline-block' }}
    />
  )
}

/* variant: 'admin' (inline color tokens, isDark) | 'public' (CSS variables) */
export default function CountrySelect({
  value, onChange, countries = [],
  isAr = false, isDark = false,
  variant = 'admin',
  placeholder, placeholderAr,
}) {
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState('')
  const [dropStyle, setDropStyle] = useState({})
  const [mounted, setMounted] = useState(false)

  const triggerRef = useRef(null)
  const dropRef    = useRef(null)
  const searchRef  = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  const selected = countries.find(c => c.code === value)

  const filtered = countries.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.en.toLowerCase().includes(q) ||
      c.ar.includes(q) ||
      c.code.toLowerCase() === q
    )
  })

  /* Color tokens */
  const isPub  = variant === 'public'
  const text   = isPub ? 'var(--text)'    : (isDark ? '#f1f5f9'                : '#111827')
  const muted  = isPub ? 'var(--text-40)' : (isDark ? 'rgba(255,255,255,.38)' : '#9ca3af')
  const inputBg= isPub ? 'var(--surface)' : (isDark ? 'rgba(255,255,255,.05)' : '#f9fafb')
  const bdr    = isPub ? 'var(--border)'  : (isDark ? 'rgba(255,255,255,.10)' : '#d1d5db')
  const dropBg = isPub ? 'var(--surface)' : (isDark ? '#0d2030'               : '#ffffff')
  const dropBdr= isPub ? 'var(--border)'  : (isDark ? 'rgba(201,147,44,.3)'   : '#e2e8f0')
  const hoverBg= isPub ? 'var(--bg)'      : (isDark ? 'rgba(255,255,255,.07)' : '#f1f5f9')
  const searchBg= isPub ? 'var(--bg)'     : (isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6')

  /* Position dropdown under/above trigger */
  const positionDrop = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const vpH  = window.innerHeight
    const dropH= Math.min(filtered.length * 46 + 56, 320)
    const below= (vpH - rect.bottom) >= dropH || (vpH - rect.bottom) >= rect.top

    setDropStyle({
      position : 'fixed',
      zIndex   : 9999,
      left     : rect.left,
      width    : Math.max(rect.width, 240),
      ...(below ? { top: rect.bottom + 4 } : { bottom: vpH - rect.top + 4 }),
    })
  }, [filtered.length])

  useEffect(() => {
    if (!open) return
    positionDrop()
    window.addEventListener('scroll', positionDrop, true)
    window.addEventListener('resize', positionDrop)
    return () => {
      window.removeEventListener('scroll', positionDrop, true)
      window.removeEventListener('resize', positionDrop)
    }
  }, [open, positionDrop])

  /* Focus search on open, clear on close */
  useEffect(() => {
    if (open) { setTimeout(() => searchRef.current?.focus(), 40) }
    else setSearch('')
  }, [open])

  /* Outside click */
  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (
        !triggerRef.current?.contains(e.target) &&
        !dropRef.current?.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const focusBdr = 'rgba(201,147,44,.65)'
  const focusShadow = '0 0 0 3px rgba(201,147,44,.08)'

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', height: 44, padding: '0 13px',
          background: inputBg,
          border: `1.5px solid ${open ? focusBdr : bdr}`,
          borderRadius: 10, color: selected ? text : muted,
          cursor: 'pointer', fontFamily: 'inherit', fontSize: '.88rem',
          textAlign: isAr ? 'right' : 'left',
          direction: isAr ? 'rtl' : 'ltr',
          transition: 'border-color .15s, box-shadow .15s', outline: 'none',
          boxShadow: open ? focusShadow : 'none',
        }}
      >
        {selected && <FlagIcon code={selected.code} />}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected
            ? (isAr ? selected.ar : selected.en)
            : (isAr ? (placeholderAr || 'اختر الدولة…') : (placeholder || 'Select country…'))
          }
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5" width="12" height="12"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Portal dropdown */}
      {open && mounted && createPortal(
        <div ref={dropRef} style={{
          ...dropStyle,
          background: dropBg,
          border: `1.5px solid ${dropBdr}`,
          borderRadius: 13,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,.32)',
          animation: 'csFade .12s ease both',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${dropBdr}`, flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 10px', borderRadius: 8,
              background: searchBg, border: `1px solid ${bdr}`,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" width="13" height="13" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? 'بحث…' : 'Search…'}
                dir={isAr ? 'rtl' : 'ltr'}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontSize: '.84rem',
                  color: text, fontFamily: 'inherit',
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: muted, padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', maxHeight: 260 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: muted, fontSize: '.82rem' }}>
                {isAr ? 'لا توجد نتائج' : 'No results'}
              </div>
            ) : filtered.map((c, i) => {
              const isSel = c.code === value
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 14px',
                    background: isSel ? 'rgba(201,147,44,.12)' : 'transparent',
                    border: 'none',
                    borderBottom: i < filtered.length - 1 ? `1px solid ${hoverBg}` : 'none',
                    cursor: 'pointer',
                    color: isSel ? '#c9932c' : text,
                    fontFamily: 'inherit', fontSize: '.85rem',
                    fontWeight: isSel ? 700 : 400,
                    textAlign: isAr ? 'right' : 'left',
                    direction: isAr ? 'rtl' : 'ltr',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = hoverBg }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'rgba(201,147,44,.12)' : 'transparent' }}
                >
                  <FlagIcon code={c.code} />
                  <span style={{ flex: 1 }}>{isAr ? c.ar : c.en}</span>
                  {isSel && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="2.5" width="13" height="13" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}

      <style>{`@keyframes csFade{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
