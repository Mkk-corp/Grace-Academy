'use client'

const PAGE_SIZE = 25

export default function Pagination({ page, total, pageSize = PAGE_SIZE, onChange, isDark }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, total)

  function getPages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4)              return [1, 2, 3, 4, 5, '…', totalPages]
    if (page >= totalPages - 3) return [1, '…', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
    return [1, '…', page-1, page, page+1, '…', totalPages]
  }

  // Use CSS vars in admin context (isDark undefined), inline colors in portal context
  const useVars = isDark === undefined || isDark === null
  const border  = useVars ? 'var(--border)'  : (isDark ? 'rgba(255,255,255,.07)' : 'rgba(28,36,51,.09)')
  const text60  = useVars ? 'var(--text-60)' : (isDark ? 'rgba(241,245,249,.55)' : 'rgba(28,36,51,.55)')
  const text    = useVars ? 'var(--text)'    : (isDark ? '#f1f5f9' : '#1c2433')
  const surface = useVars ? 'var(--surface)' : (isDark ? '#10222b' : '#fff')
  const gold    = '#c9932c'

  function btn(active, disabled) {
    return {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 32, height: 32, padding: '0 8px',
      borderRadius: 8,
      border: `1px solid ${active ? gold : border}`,
      background: active ? gold : surface,
      color: active ? '#fff' : disabled ? text60 : text,
      fontWeight: active ? 700 : 500,
      fontSize: '.8rem',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? .38 : 1,
      transition: 'all .14s',
      fontFamily: 'inherit',
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px',
      borderTop: `1px solid ${border}`,
      background: surface,
      flexWrap: 'wrap', gap: 10,
    }}>
      <span style={{ fontSize: '.77rem', color: text60 }}>
        Showing {from}–{to} of {total}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <button style={btn(false, page === 1)} onClick={() => page > 1 && onChange(page - 1)} disabled={page === 1}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`d${i}`} style={{ padding: '0 4px', color: text60, fontSize: '.85rem', userSelect: 'none' }}>…</span>
          ) : (
            <button key={p} style={btn(p === page, false)} onClick={() => onChange(p)}>{p}</button>
          )
        )}

        <button style={btn(false, page === totalPages)} onClick={() => page < totalPages && onChange(page + 1)} disabled={page === totalPages}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
