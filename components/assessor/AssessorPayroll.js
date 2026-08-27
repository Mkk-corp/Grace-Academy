'use client'

import { useState, useEffect } from 'react'

function currencySym(c) {
  return { USD:'$', EUR:'€', GBP:'£', SAR:'﷼', AED:'د.إ', EGP:'E£', KWD:'KD', QAR:'QR', JOD:'JD' }[c] || c
}
function monthLabel(monthStr) {
  if (!monthStr) return ''
  const [y, m] = monthStr.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
function fmt(n, sym) { return `${sym}${Number(n || 0).toFixed(2)}` }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) }

export default function AssessorPayroll({ isAr, isDark }) {
  const [tab,       setTab]       = useState('current') // 'current' | 'history'
  const [data,      setData]      = useState(null)
  const [history,   setHistory]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [histLoad,  setHistLoad]  = useState(false)

  const gold   = '#c9932c'
  const text   = isDark ? '#f1f5f9'                 : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)'   : '#6b7280'
  const border = isDark ? 'rgba(255,255,255,.09)'   : '#e5e7eb'
  const surf   = isDark ? 'rgba(255,255,255,.04)'   : '#fff'
  const surfBg = isDark ? 'rgba(255,255,255,.025)'  : '#f9fafb'

  useEffect(() => {
    fetch('/api/assessor/payroll')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab !== 'history' || history) return
    setHistLoad(true)
    fetch('/api/assessor/payroll/history')
      .then(r => r.ok ? r.json() : { transfers: [] })
      .then(d => setHistory(d.transfers || []))
      .finally(() => setHistLoad(false))
  }, [tab])

  const sym = data ? currencySym(data.currency) : '$'

  /* ── Download payslip ─────────────────────────────────────── */
  function downloadPayslip(id) {
    window.open(`/payslip/${id}?print=1`, '_blank')
  }

  /* ── TAB PILLS ─────────────────────────────────────────────── */
  function TabPill({ id, label }) {
    const active = tab === id
    return (
      <button
        onClick={() => setTab(id)}
        style={{
          padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
          fontWeight: active ? 700 : 500, fontSize: '.83rem', fontFamily: 'inherit',
          background: active ? gold : 'transparent',
          color: active ? '#fff' : muted,
          transition: 'all .15s',
        }}
      >{label}</button>
    )
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`, borderTopColor: gold, animation: 'asSpin .7s linear infinite' }}/>
      <style>{`@keyframes asSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 4px' }}>
      <style>{`@keyframes asSpin{to{transform:rotate(360deg)}}`}</style>

      {/* Tab bar */}
      <div style={{
        display: 'inline-flex', gap: 4, padding: 4, borderRadius: 13,
        background: isDark ? 'rgba(255,255,255,.05)' : '#f3f4f6',
        marginBottom: 28,
      }}>
        <TabPill id="current" label={isAr ? 'هذا الشهر' : 'This Month'} />
        <TabPill id="history" label={isAr ? 'السجل' : 'History'} />
      </div>

      {/* ── CURRENT MONTH ── */}
      {tab === 'current' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Month badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 14px', borderRadius: 100,
              background: `${gold}15`, border: `1px solid ${gold}30`,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" width="14" height="14">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: gold }}>{monthLabel(data.month)}</span>
            </div>
            {data.alreadyTransferred && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 100,
                background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#10b981' }}>{isAr ? 'تم التحويل' : 'Transferred'}</span>
              </div>
            )}
          </div>

          {/* Breakdown card */}
          <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.3)' : '0 1px 8px rgba(0,0,0,.06)' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `${gold}14`, border: `1px solid ${gold}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" width="18" height="18">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"/>
                  <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '.95rem', color: text }}>{isAr ? 'كشف الراتب' : 'Earnings Breakdown'}</div>
                <div style={{ fontSize: '.75rem', color: muted, marginTop: 2 }}>{isAr ? 'تفاصيل الجلسات والأتعاب لهذا الشهر' : 'Session counts and rates for this month'}</div>
              </div>
            </div>

            {/* Placement row */}
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" width="15" height="15">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.88rem', color: text }}>{isAr ? 'اختبارات تحديد المستوى' : 'Placement Tests'}</div>
                    <div style={{ fontSize: '.74rem', color: muted, marginTop: 2 }}>
                      {data.placementCount} {isAr ? 'جلسة' : 'sessions'} × {fmt(data.placementRate, sym)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#3b82f6' }}>
                  {fmt(data.placementCount * data.placementRate, sym)}
                </div>
              </div>
            </div>

            {/* Speaking row */}
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" width="15" height="15">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.88rem', color: text }}>{isAr ? 'جلسات المحادثة' : 'Speaking Sessions'}</div>
                    <div style={{ fontSize: '.74rem', color: muted, marginTop: 2 }}>
                      {data.speakingCount} {isAr ? 'جلسة' : 'sessions'} × {fmt(data.speakingRate, sym)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6' }}>
                  {fmt(data.speakingCount * data.speakingRate, sym)}
                </div>
              </div>
            </div>

            {/* Total row */}
            <div style={{ padding: '20px 24px', background: `${gold}08`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.14em', color: gold, marginBottom: 3 }}>
                  {isAr ? 'إجمالي هذا الشهر' : 'MONTHLY TOTAL'}
                </div>
                <div style={{ fontSize: '.8rem', color: muted }}>
                  {isAr
                    ? `${data.placementCount + data.speakingCount} جلسة بمتوسط ${fmt((data.placementCount + data.speakingCount) > 0 ? data.subtotal / (data.placementCount + data.speakingCount) : 0, sym)} / جلسة`
                    : `${data.placementCount + data.speakingCount} sessions total`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: '1rem', color: gold, fontWeight: 700 }}>{sym}</span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: gold, lineHeight: 1 }}>{Number(data.subtotal || 0).toFixed(2)}</span>
              </div>
            </div>

          </div>

          {/* Hint if transferred */}
          {data.alreadyTransferred && data.transferId && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
              <div style={{ fontSize: '.82rem', color: isDark ? 'rgba(255,255,255,.7)' : '#374151' }}>
                {isAr ? 'تم تحويل الراتب لهذا الشهر. يمكنك الاطلاع على كشف الراتب في السجل.' : 'Payroll for this month has been transferred. View the payslip in the History tab.'}
              </div>
              <button
                onClick={() => setTab('history')}
                style={{ marginLeft: 'auto', marginRight: 0, padding: '5px 12px', borderRadius: 8, background: '#10b981', border: 'none', color: '#fff', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', flexShrink: 0 }}
              >{isAr ? 'السجل' : 'View History'}</button>
            </div>
          )}

          {/* No settings warning */}
          {data.placementRate === 0 && data.speakingRate === 0 && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)', fontSize: '.82rem', color: isDark ? '#fbbf24' : '#92400e' }}>
              {isAr ? 'لم يتم تعيين معدلات الأجر بعد. تواصل مع الإدارة.' : 'Pay rates have not been configured yet. Contact the admin.'}
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        histLoad ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`, borderTopColor: gold, animation: 'asSpin .7s linear infinite' }}/>
          </div>
        ) : history && history.length === 0 ? (
          <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 16, padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${gold}10`, border: `1.5px dashed ${gold}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" width="22" height="22">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: '.95rem', color: text, marginBottom: 6 }}>{isAr ? 'لا يوجد سجل بعد' : 'No history yet'}</div>
            <div style={{ fontSize: '.82rem', color: muted }}>{isAr ? 'ستظهر كشوف الرواتب هنا بعد أول تحويل.' : 'Payslips will appear here after the first transfer.'}</div>
          </div>
        ) : history && (
          <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.3)' : '0 1px 8px rgba(0,0,0,.06)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560 }}>
                <thead>
                  <tr style={{ background: surfBg }}>
                    {[
                      isAr ? 'الشهر'       : 'Month',
                      isAr ? 'التحديد'     : 'Placement',
                      isAr ? 'المحادثة'    : 'Speaking',
                      isAr ? 'الإجمالي'   : 'Total',
                      isAr ? 'طريقة الدفع': 'Payment',
                      isAr ? 'التاريخ'    : 'Date',
                      '',
                    ].map((h, i) => (
                      <th key={i} style={{ padding: '12px 16px', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', color: muted, textAlign: i === 0 ? 'left' : i === 6 ? 'center' : 'center', borderBottom: `1px solid ${border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(t => {
                    const s = currencySym(t.currency)
                    return (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ padding: '14px 16px', fontSize: '.85rem', fontWeight: 700, color: text }}>{monthLabel(t.month)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '.84rem', color: text }}>{t.placementCount}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '.84rem', color: text }}>{t.speakingCount}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '.9rem', fontWeight: 800, color: gold }}>{fmt(t.totalAmount, s)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, background: isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6', fontSize: '.74rem', color: muted }}>{t.paymentMethod}</span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '.78rem', color: muted }}>{fmtDate(t.transferredAt)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => downloadPayslip(t.id)}
                            title={isAr ? 'تنزيل كشف الراتب' : 'Download Payslip'}
                            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`, background: 'none', color: muted, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  )
}
