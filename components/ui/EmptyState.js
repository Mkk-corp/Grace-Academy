'use client'

import Image from 'next/image'

/**
 * EmptyState — full-width empty content block with illustration.
 *
 * Props:
 *   title       — headline (default "No records yet")
 *   description — sub-text
 *   actionLabel — label for the add button (omit to hide button)
 *   onAction    — callback for add button
 *   isAdmin     — true uses var(--surface)/var(--bg) tokens; false uses --as-* portal tokens
 */
export default function EmptyState({
  title       = 'No records yet',
  description = 'Nothing here yet. Get started by adding your first entry.',
  actionLabel,
  onAction,
  isAdmin = true,
}) {
  const surface = isAdmin ? 'var(--surface)' : 'var(--as-surface, #10222b)'
  const border  = isAdmin ? 'var(--border)'  : 'var(--as-border, rgba(255,255,255,.07))'
  const text    = isAdmin ? 'var(--text)'    : 'var(--as-text, #f1f5f9)'
  const muted   = isAdmin ? 'var(--text-40)' : 'var(--as-muted, rgba(241,245,249,.45))'
  const gold    = '#c9932c'

  return (
    <div style={{
      background: surface,
      border: `1px solid ${border}`,
      borderRadius: 18,
      padding: '56px 32px 48px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 0,
    }}>
      <div style={{ position: 'relative', width: 220, height: 180, marginBottom: 28, opacity: .92 }}>
        <Image
          src="/images/empty-page.svg"
          alt="No content"
          fill
          style={{ objectFit: 'contain' }}
          priority={false}
        />
      </div>

      <h3 style={{
        fontSize: '1.05rem',
        fontWeight: 800,
        color: text,
        marginBottom: 8,
        fontFamily: 'inherit',
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: '.86rem',
        color: muted,
        lineHeight: 1.65,
        maxWidth: 360,
        marginBottom: actionLabel ? 24 : 0,
        fontFamily: 'inherit',
      }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '10px 22px',
            background: gold,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '.88rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background .15s, transform .12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ae6d0c'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = gold;       e.currentTarget.style.transform = 'none' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
