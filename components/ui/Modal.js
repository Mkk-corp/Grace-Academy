'use client'

import { useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

const VARIANTS = {
  delete:  { iconBg: '#fef2f2', iconColor: '#dc2626', btnBg: '#dc2626', defaultConfirm: 'Delete' },
  success: { iconBg: '#f0fdf4', iconColor: '#16a34a', btnBg: '#16a34a', defaultConfirm: 'Confirm' },
  warning: { iconBg: '#fffbeb', iconColor: '#d97706', btnBg: '#d97706', defaultConfirm: 'Confirm' },
  info:    { iconBg: 'rgba(201,147,44,.12)', iconColor: '#c9932c', btnBg: '#c9932c', defaultConfirm: 'Confirm' },
}

const DEFAULT_ICONS = {
  delete: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" width="24" height="24">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  success: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" width="24" height="24">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  warning: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" width="24" height="24">
      <path d="M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  info: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" width="24" height="24">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
}

/**
 * Reusable modal for confirmations and alerts.
 *
 * Props:
 *   open         – boolean, whether to show
 *   onClose      – called when cancelled / X clicked / backdrop clicked
 *   onConfirm    – called when confirm button clicked (omit to hide confirm button)
 *   title        – string
 *   message      – string or JSX
 *   variant      – 'delete' | 'success' | 'warning' | 'info'  (default 'info')
 *   confirmText  – overrides default confirm label
 *   cancelText   – overrides default cancel label ('Cancel')
 *   icon         – custom JSX icon replacing the default variant icon
 *   children     – replaces the icon+title+message block entirely (use for custom body)
 */
export default function Modal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'info',
  confirmText,
  cancelText = 'Cancel',
  icon,
  children,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const v = VARIANTS[variant] || VARIANTS.info

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  const cardBg    = isDark ? '#162330' : '#ffffff'
  const titleClr  = isDark ? '#f1f5f9' : '#111827'
  const msgClr    = isDark ? 'rgba(241,245,249,.58)' : '#6b7280'
  const cancelBg  = isDark ? 'rgba(255,255,255,.06)' : '#f9fafb'
  const cancelBdr = isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb'
  const cancelClr = isDark ? 'rgba(241,245,249,.8)' : '#374151'
  const xClr      = isDark ? 'rgba(255,255,255,.35)' : '#9ca3af'

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.95) translateY(6px) }
          to   { opacity: 1; transform: none }
        }
      `}</style>

      <div style={{
        background: cardBg, borderRadius: 20, padding: '28px',
        width: '100%', maxWidth: 400, position: 'relative',
        boxShadow: isDark ? '0 24px 64px rgba(0,0,0,.65)' : '0 24px 64px rgba(0,0,0,.14)',
        animation: 'modalIn .16s ease',
      }}>

        {/* Close X */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: xClr, padding: 4, lineHeight: 0, borderRadius: 6,
            transition: 'color .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = isDark ? '#fff' : '#374151'}
          onMouseLeave={e => e.currentTarget.style.color = xClr}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {children ? (
          children
        ) : (
          <>
            {/* Icon circle */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: isDark ? `${v.btnBg}22` : v.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              {icon || (DEFAULT_ICONS[variant]?.(v.iconColor))}
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: titleClr, marginBottom: 8, paddingRight: 24 }}>
              {title}
            </h3>

            {message && (
              <p style={{ fontSize: '.875rem', color: msgClr, lineHeight: 1.65 }}>
                {message}
              </p>
            )}
          </>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10,
              border: `1px solid ${cancelBdr}`, background: cancelBg,
              color: cancelClr, fontSize: '.875rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s',
            }}
          >
            {cancelText}
          </button>

          {onConfirm && (
            <button
              onClick={onConfirm}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
                background: v.btnBg, color: '#fff',
                fontSize: '.875rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {confirmText || v.defaultConfirm}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
