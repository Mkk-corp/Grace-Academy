'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

/**
 * Select — Grace Academy reusable dropdown.
 *
 * Props:
 *   value         Current selected value (string)
 *   onChange      (value: string) => void
 *   options       Array of { value, label, labelAr? } objects  OR  plain strings
 *   placeholder   EN placeholder text  (default "Select…")
 *   placeholderAr AR placeholder text  (default "اختر…")
 *   isAr          Use Arabic labels and RTL layout
 *   isDark        Dark colour scheme
 *   disabled      Disable interaction
 *   error         Error string — shown below, border turns red
 *   className     Extra class on the trigger wrapper div
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder   = 'Select…',
  placeholderAr = 'اختر…',
  isAr    = false,
  isDark  = false,
  disabled = false,
  error,
  className = '',
}) {
  const [open, setOpen]         = useState(false)
  const triggerRef              = useRef(null)
  const dropRef                 = useRef(null)
  const [dropStyle, setDropStyle] = useState({})
  const [mounted, setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Normalize options → [{value, label, labelAr}]
  const normalised = options.map(o =>
    typeof o === 'string'
      ? { value: o, label: o, labelAr: o }
      : { value: o.value, label: o.label, labelAr: o.labelAr || o.label }
  )

  const selected = normalised.find(o => o.value === value)

  // Colour tokens
  const text      = isDark ? '#f1f5f9'                : '#111827'
  const muted     = isDark ? 'rgba(255,255,255,.38)'  : '#9ca3af'
  const inputBg   = isDark ? 'rgba(255,255,255,.05)'  : '#f9fafb'
  const normalBdr = error
    ? 'rgba(239,68,68,.55)'
    : (isDark ? 'rgba(255,255,255,.1)' : '#d1d5db')
  const focusBdr  = error
    ? 'rgba(239,68,68,.7)'
    : 'rgba(201,147,44,.65)'
  const dropBg    = isDark ? '#0d2030'                : '#ffffff'
  const dropBdr   = isDark ? 'rgba(201,147,44,.3)'   : '#e2e8f0'
  const hoverBg   = isDark ? 'rgba(255,255,255,.07)'  : '#f1f5f9'
  const activeBg  = 'rgba(201,147,44,.12)'
  const divider   = isDark ? 'rgba(255,255,255,.04)'  : '#f8fafc'
  const borderR   = 10    // px

  // Position the dropdown using getBoundingClientRect so it escapes any overflow:hidden
  const positionDrop = useCallback(() => {
    if (!triggerRef.current) return
    const rect   = triggerRef.current.getBoundingClientRect()
    const vpH    = window.innerHeight
    const spaceB = vpH - rect.bottom
    const spaceA = rect.top
    const dropH  = Math.min(normalised.length * 46 + 16, 280)

    // Open below if enough room, else above
    const below = spaceB >= dropH || spaceB >= spaceA
    setDropStyle({
      position:  'fixed',
      zIndex:    9999,
      left:      rect.left,
      width:     rect.width,
      ...(below
        ? { top: rect.bottom + 4 }
        : { bottom: vpH - rect.top + 4 }
      ),
    })
  }, [normalised.length])

  useEffect(() => {
    if (!open) return
    positionDrop()
    window.addEventListener('scroll',  positionDrop, true)
    window.addEventListener('resize',  positionDrop)
    return () => {
      window.removeEventListener('scroll',  positionDrop, true)
      window.removeEventListener('resize',  positionDrop)
    }
  }, [open, positionDrop])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropRef.current    && !dropRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const border = open ? focusBdr : normalBdr

  return (
    <div className={className} style={{ position: 'relative', width: '100%' }}>

      {/* ── Trigger ── */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         8,
          width:       '100%',
          height:      44,
          padding:     '0 13px',
          background:  inputBg,
          border:      `1.5px solid ${border}`,
          borderRadius: borderR,
          color:       selected ? text : muted,
          cursor:      disabled ? 'not-allowed' : 'pointer',
          fontFamily:  'inherit',
          fontSize:    '.88rem',
          textAlign:   isAr ? 'right' : 'left',
          direction:   isAr ? 'rtl' : 'ltr',
          transition:  'border-color .15s, box-shadow .15s',
          outline:     'none',
          opacity:     disabled ? .5 : 1,
          boxShadow:   open ? `0 0 0 3px ${error ? 'rgba(239,68,68,.1)' : 'rgba(201,147,44,.08)'}` : 'none',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected
            ? (isAr ? selected.labelAr : selected.label)
            : (isAr ? placeholderAr : placeholder)
          }
        </span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5"
          width="12" height="12"
          style={{
            transform:  open ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* ── Error message ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: '.73rem', color: '#ef4444', marginTop: 4,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="12" height="12">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12"   y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Dropdown (portalled to document.body) ── */}
      {open && mounted && createPortal(
        <div
          ref={dropRef}
          role="listbox"
          style={{
            ...dropStyle,
            background:   dropBg,
            border:       `1.5px solid ${dropBdr}`,
            borderRadius: 13,
            overflow:     'hidden',
            boxShadow:    '0 20px 60px rgba(0,0,0,.32)',
            animation:    'grSelectFade .12s ease both',
          }}
        >
          {normalised.length === 0 ? (
            <div style={{ padding: '14px 16px', color: muted, fontSize: '.83rem', textAlign: 'center' }}>
              {isAr ? 'لا توجد خيارات' : 'No options'}
            </div>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: 268 }}>
              {normalised.map((opt, i) => {
                const isSel = opt.value === value
                const isLast = i === normalised.length - 1
                return (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={isSel}
                    type="button"
                    onClick={() => { onChange?.(opt.value); setOpen(false) }}
                    style={{
                      display:     'flex',
                      alignItems:  'center',
                      width:       '100%',
                      padding:     '11px 16px',
                      background:  isSel ? activeBg : 'transparent',
                      border:      'none',
                      borderBottom: isLast ? 'none' : `1px solid ${divider}`,
                      cursor:      'pointer',
                      color:       isSel ? '#c9932c' : text,
                      fontFamily:  'inherit',
                      fontSize:    '.86rem',
                      fontWeight:  isSel ? 700 : 400,
                      textAlign:   isAr ? 'right' : 'left',
                      direction:   isAr ? 'rtl' : 'ltr',
                      transition:  'background .1s',
                      gap:         8,
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = hoverBg }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSel ? activeBg : 'transparent' }}
                  >
                    <span style={{ flex: 1 }}>
                      {isAr ? opt.labelAr : opt.label}
                    </span>
                    {isSel && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="2.5" width="14" height="14" style={{ flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>,
        document.body
      )}

      <style>{`
        @keyframes grSelectFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}
