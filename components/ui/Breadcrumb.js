'use client'

export default function Breadcrumb({ crumbs, isAr, isDark }) {
  const muted   = isDark ? 'rgba(241,245,249,.38)' : 'rgba(28,36,51,.42)'
  const active  = isDark ? 'rgba(241,245,249,.88)' : '#1c2433'
  const bg      = isDark ? 'rgba(255,255,255,.022)' : 'rgba(28,36,51,.022)'
  const border  = isDark ? 'rgba(255,255,255,.055)' : 'rgba(28,36,51,.07)'
  const gold    = '#c9932c'

  return (
    <div style={{
      padding: '0 26px',
      height: 36,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      background: bg,
      borderBottom: `1px solid ${border}`,
      direction: isAr ? 'rtl' : 'ltr',
      flexShrink: 0,
    }}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {i > 0 && (
              <svg
                viewBox="0 0 24 24" fill="none" stroke={muted}
                strokeWidth="2.2" width="10" height="10"
                style={{ transform: isAr ? 'rotate(180deg)' : 'none', flexShrink: 0, margin: '0 3px' }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            <span
              onClick={crumb.onClick}
              style={{
                fontSize: '.76rem',
                fontWeight: isLast ? 600 : 400,
                color: isLast ? active : muted,
                cursor: crumb.onClick ? 'pointer' : 'default',
                transition: 'color .14s',
                letterSpacing: isLast ? '.015em' : 0,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (crumb.onClick) e.currentTarget.style.color = gold }}
              onMouseLeave={e => { if (crumb.onClick) e.currentTarget.style.color = muted }}
            >
              {crumb.label}
            </span>
          </span>
        )
      })}
    </div>
  )
}
