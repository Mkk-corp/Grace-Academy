'use client'

import { useState, useRef, useEffect } from 'react'
import { exportToExcel, exportToPDF } from '@/lib/exportUtils'

export default function TableToolbar({
  hasDateFilter = true,
  dateFrom = '', dateTo = '',
  onDateChange,
  exportData = [], exportCols = [], exportFilename = 'export', exportTitle = '',
  isDark, isAr,
}) {
  const [showDate,   setShowDate]   = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [localFrom,  setLocalFrom]  = useState(dateFrom)
  const [localTo,    setLocalTo]    = useState(dateTo)
  const dateRef   = useRef(null)
  const exportRef = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (dateRef.current   && !dateRef.current.contains(e.target))   setShowDate(false)
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExport(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  useEffect(() => { setLocalFrom(dateFrom) }, [dateFrom])
  useEffect(() => { setLocalTo(dateTo) },     [dateTo])

  const useVars = isDark === undefined || isDark === null
  const border  = useVars ? 'var(--border)'  : (isDark ? 'rgba(255,255,255,.09)' : 'rgba(28,36,51,.11)')
  const surface = useVars ? 'var(--surface)' : (isDark ? '#10222b' : '#fff')
  const text    = useVars ? 'var(--text)'    : (isDark ? '#f1f5f9' : '#1c2433')
  const text60  = useVars ? 'var(--text-60)' : (isDark ? 'rgba(241,245,249,.55)' : 'rgba(28,36,51,.55)')
  const bg      = useVars ? 'var(--bg)'      : (isDark ? '#0a1820' : '#f3f4f6')
  const gold    = '#c9932c'
  const isFiltered = !!(dateFrom || dateTo)

  function applyDate() {
    onDateChange?.(localFrom, localTo)
    setShowDate(false)
  }
  function clearDate() {
    setLocalFrom(''); setLocalTo('')
    onDateChange?.('', '')
    setShowDate(false)
  }

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
    transition: 'all .15s', position: 'relative', flexShrink: 0,
    fontFamily: 'inherit',
  }

  const popBase = {
    position: 'absolute', top: 38, right: 0,
    background: surface, border: `1px solid ${border}`,
    borderRadius: 12, zIndex: 300,
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,.55)'
      : '0 8px 24px rgba(0,0,0,.12)',
  }

  const dateInputStyle = {
    width: '100%', padding: '7px 10px',
    background: bg, border: `1px solid ${border}`,
    borderRadius: 7, color: text, fontSize: '.82rem',
    fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 10 }}>

      {/* ── Date filter button ── */}
      {hasDateFilter && (
        <div ref={dateRef} style={{ position: 'relative' }}>
          <button
            style={{
              ...btnBase,
              border: `1.5px solid ${isFiltered ? gold : border}`,
              background: isFiltered ? 'rgba(201,147,44,.08)' : surface,
              color: isFiltered ? gold : text60,
            }}
            onClick={() => { setShowDate(v => !v); setShowExport(false) }}
            title={isAr ? 'تصفية بالتاريخ' : 'Filter by date'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
            {isFiltered && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 8, height: 8, borderRadius: '50%',
                background: gold, border: `2px solid ${surface}`,
              }} />
            )}
          </button>

          {showDate && (
            <div style={{ ...popBase, minWidth: 240, padding: 14 }}>
              <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', color: gold, marginBottom: 10 }}>
                {isAr ? 'تصفية بالتاريخ' : 'FILTER BY DATE'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 600, color: text60, marginBottom: 4 }}>
                    {isAr ? 'من' : 'From'}
                  </label>
                  <input type="date" value={localFrom} onChange={e => setLocalFrom(e.target.value)} style={dateInputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 600, color: text60, marginBottom: 4 }}>
                    {isAr ? 'إلى' : 'To'}
                  </label>
                  <input type="date" value={localTo} onChange={e => setLocalTo(e.target.value)} style={dateInputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={clearDate}
                  style={{
                    flex: 1, padding: '7px', borderRadius: 7, fontSize: '.8rem', fontWeight: 600,
                    border: `1px solid ${border}`, background: 'none', color: text60,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isAr ? 'مسح' : 'Clear'}
                </button>
                <button
                  onClick={applyDate}
                  style={{
                    flex: 1, padding: '7px', borderRadius: 7, fontSize: '.8rem', fontWeight: 700,
                    border: 'none', background: gold, color: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 2px 8px rgba(201,147,44,.35)',
                  }}
                >
                  {isAr ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Export button ── */}
      <div ref={exportRef} style={{ position: 'relative' }}>
        <button
          style={{
            ...btnBase,
            border: `1.5px solid ${border}`,
            background: surface,
            color: text60,
          }}
          onClick={() => { setShowExport(v => !v); setShowDate(false) }}
          title={isAr ? 'تصدير' : 'Export'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>

        {showExport && (
          <div style={{ ...popBase, minWidth: 190, padding: 10 }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', color: gold, marginBottom: 8, paddingInlineStart: 4 }}>
              {isAr ? 'تصدير البيانات' : 'EXPORT DATA'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                {
                  label: isAr ? 'تصدير كـ PDF' : 'Export as PDF',
                  color: '#ef4444',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="9" y1="13" x2="15" y2="13"/>
                      <line x1="9" y1="17" x2="13" y2="17"/>
                    </svg>
                  ),
                  onClick: () => {
                    exportToPDF(exportCols, exportData, exportFilename, exportTitle)
                    setShowExport(false)
                  },
                },
                {
                  label: isAr ? 'تصدير كـ Excel' : 'Export as Excel',
                  color: '#16a34a',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <polyline points="8 12 10 16 12 12 14 16 16 12"/>
                    </svg>
                  ),
                  onClick: () => {
                    exportToExcel(exportCols, exportData, exportFilename)
                    setShowExport(false)
                  },
                },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 8, border: 'none',
                    background: 'none', color: text, fontSize: '.82rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: isAr ? 'right' : 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                >
                  <span style={{ color: item.color, flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
            <div style={{
              marginTop: 8, paddingTop: 8, borderTop: `1px solid ${border}`,
              fontSize: '.68rem', color: text60, paddingInlineStart: 4,
            }}>
              {exportData.length} {isAr ? 'صف' : 'rows'}
              {' · '}
              {isAr ? 'يشمل الفلاتر المطبّقة' : 'includes active filters'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
