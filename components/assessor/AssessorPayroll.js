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
function fmtDate(d)  { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }

export default function AssessorPayroll({ isAr, isDark }) {
  const [tab,      setTab]      = useState('current')
  const [data,     setData]     = useState(null)
  const [history,  setHistory]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [histLoad, setHistLoad] = useState(false)

  const gold   = '#c9932c'
  const text   = isDark ? '#f1f5f9'               : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const surf   = isDark ? 'rgba(255,255,255,.04)' : '#fff'

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

  function downloadPayslip(id) {
    window.open(`/payslip/${id}?print=1`, '_blank')
  }

  /* ── Spinner ────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
      <style>{`@keyframes prSpin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`, borderTopColor: gold, animation: 'prSpin .7s linear infinite' }}/>
    </div>
  )

  const totalSessions = data ? data.placementCount + data.speakingCount : 0
  const plAmt  = data ? data.placementCount * data.placementRate : 0
  const spAmt  = data ? data.speakingCount  * data.speakingRate  : 0
  const total  = data ? (data.subtotal || 0) : 0
  const maxAmt = Math.max(plAmt, spAmt, 1)

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <style>{`
        @keyframes prSpin { to { transform:rotate(360deg) } }
        @keyframes prFadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
        @keyframes prCountUp { from { opacity:0; transform:scale(.88) } to { opacity:1; transform:scale(1) } }
        .pr-tab-pill { transition: all .18s cubic-bezier(.4,0,.2,1) !important }
        .pr-tab-pill:hover { opacity:.85 }
        .pr-hist-card { transition: transform .18s, box-shadow .18s !important }
        .pr-hist-card:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 32px rgba(0,0,0,.12) !important }
        .pr-dl-btn:hover { background: ${gold} !important; color: #fff !important; border-color: ${gold} !important }
      `}</style>

      {/* ── TAB SWITCHER ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: text, marginBottom: 3 }}>
            {isAr ? 'الرواتب' : 'Payroll'}
          </div>
          {data && (
            <div style={{ fontSize: '.8rem', color: muted }}>
              {isAr ? `${monthLabel(data.month)} · ${totalSessions} جلسة` : `${monthLabel(data.month)} · ${totalSessions} session${totalSessions !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>

        <div style={{ display: 'inline-flex', padding: 4, borderRadius: 12, background: isDark ? 'rgba(255,255,255,.06)' : '#f1f5f9', gap: 3 }}>
          {[
            { id: 'current', labelEn: 'This Month', labelAr: 'هذا الشهر' },
            { id: 'history', labelEn: 'History',    labelAr: 'السجل'     },
          ].map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} className="pr-tab-pill" onClick={() => setTab(t.id)} style={{
                padding: '8px 22px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '.83rem', fontWeight: active ? 700 : 500,
                background: active ? (isDark ? '#1e3340' : '#fff') : 'transparent',
                color: active ? (isDark ? '#f1f5f9' : '#111827') : muted,
                boxShadow: active ? (isDark ? '0 1px 6px rgba(0,0,0,.3)' : '0 1px 4px rgba(0,0,0,.08)') : 'none',
              }}>
                {isAr ? t.labelAr : t.labelEn}
              </button>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          THIS MONTH
      ══════════════════════════════════════════════════ */}
      {tab === 'current' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'prFadeUp .28s ease' }}>

          {/* ── Hero earnings card ──────────────────────── */}
          <div style={{
            borderRadius: 20, overflow: 'hidden', position: 'relative',
            background: isDark
              ? 'linear-gradient(135deg, #0a1b22 0%, #0f2330 50%, #0a1b22 100%)'
              : 'linear-gradient(135deg, #0d1f2d 0%, #122538 50%, #0a1b22 100%)',
            boxShadow: '0 8px 40px rgba(0,0,0,.35)',
          }}>
            {/* Glow circles */}
            <div style={{ position: 'absolute', top: -60, right: isAr ? 'auto' : -60, left: isAr ? -60 : 'auto', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.22) 0%, transparent 65%)', pointerEvents: 'none' }}/>
            <div style={{ position: 'absolute', bottom: -40, left: isAr ? 'auto' : '30%', right: isAr ? '30%' : 'auto', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.1) 0%, transparent 65%)', pointerEvents: 'none' }}/>

            <div style={{ position: 'relative', zIndex: 1, padding: '36px 40px' }}>
              {/* Month + status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', borderRadius: 100,
                  background: 'rgba(201,147,44,.18)', border: '1px solid rgba(201,147,44,.35)',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" width="12" height="12">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: gold, letterSpacing: '.06em' }}>{monthLabel(data.month)}</span>
                </div>

                {data.alreadyTransferred ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#10b981' }}>{isAr ? 'تم التحويل' : 'Transferred'}</span>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.25)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', animation: 'none' }}/>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#f59e0b' }}>{isAr ? 'قيد الانتظار' : 'Pending Transfer'}</span>
                  </div>
                )}
              </div>

              {/* Total amount */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.18em', color: 'rgba(201,147,44,.6)', marginBottom: 6 }}>
                  {isAr ? 'إجمالي الأرباح هذا الشهر' : 'TOTAL EARNINGS THIS MONTH'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, animation: 'prCountUp .4s ease' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgba(201,147,44,.7)', lineHeight: 1 }}>{sym}</span>
                  <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-.02em' }}>
                    {Number(total).toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.38)', marginTop: 8 }}>
                  {isAr
                    ? `من ${totalSessions} جلسة${totalSessions !== 1 ? '' : ''}`
                    : `from ${totalSessions} session${totalSessions !== 1 ? 's' : ''}`}
                </div>
              </div>

              {/* Mini stat chips */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { labelEn: 'Placement Tests', labelAr: 'اختبارات التحديد', count: data.placementCount, amount: plAmt, color: '#3b82f6' },
                  { labelEn: 'Speaking Sessions', labelAr: 'جلسات المحادثة', count: data.speakingCount, amount: spAmt, color: '#8b5cf6' },
                ].map(chip => (
                  <div key={chip.labelEn} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', borderRadius: 12,
                    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                    backdropFilter: 'blur(8px)',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: chip.color, flexShrink: 0 }}/>
                    <div>
                      <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.45)', marginBottom: 2 }}>{isAr ? chip.labelAr : chip.labelEn}</div>
                      <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#fff' }}>
                        <span style={{ color: chip.color }}>{chip.count}</span>
                        <span style={{ color: 'rgba(255,255,255,.3)', margin: '0 4px' }}>×</span>
                        <span>{fmt(chip.count > 0 ? chip.amount / chip.count : 0, sym)}</span>
                        <span style={{ color: 'rgba(255,255,255,.3)', margin: '0 4px' }}>=</span>
                        <span style={{ color: chip.color }}>{fmt(chip.amount, sym)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Session breakdown cards ───────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              {
                labelEn: 'Placement Tests',
                labelAr: 'اختبارات تحديد المستوى',
                descEn: 'Assessment sessions conducted',
                descAr: 'جلسات التقييم المُجراة',
                count: data.placementCount,
                rate: data.placementRate,
                amount: plAmt,
                color: '#3b82f6',
                bg: 'rgba(59,130,246,.08)',
                bd: 'rgba(59,130,246,.18)',
                icon: (
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>,
                  <rect x="8" y="2" width="8" height="4" rx="1"/>,
                  <line x1="8" y1="13" x2="16" y2="13"/>,
                  <line x1="8" y1="17" x2="13" y2="17"/>
                ),
              },
              {
                labelEn: 'Speaking Sessions',
                labelAr: 'جلسات المحادثة',
                descEn: 'Conversation sessions led',
                descAr: 'جلسات المحادثة المُقادة',
                count: data.speakingCount,
                rate: data.speakingRate,
                amount: spAmt,
                color: '#8b5cf6',
                bg: 'rgba(139,92,246,.08)',
                bd: 'rgba(139,92,246,.18)',
                icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
              },
            ].map(card => (
              <div key={card.labelEn} style={{
                background: surf, border: `1px solid ${border}`, borderRadius: 16,
                padding: '22px 22px 18px', overflow: 'hidden', position: 'relative',
                boxShadow: isDark ? '0 2px 12px rgba(0,0,0,.2)' : '0 1px 6px rgba(0,0,0,.05)',
              }}>
                {/* Accent top strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${card.color}, ${card.color}60)`, borderRadius: '16px 16px 0 0' }}/>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: card.bg, border: `1px solid ${card.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="1.8" width="16" height="16">
                      {Array.isArray(card.icon) ? card.icon : card.icon}
                    </svg>
                  </div>
                  <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.count}</div>
                    <div style={{ fontSize: '.68rem', color: muted, marginTop: 2 }}>{isAr ? 'جلسة' : 'sessions'}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: '.88rem', color: text, marginBottom: 3 }}>
                    {isAr ? card.labelAr : card.labelEn}
                  </div>
                  <div style={{ fontSize: '.74rem', color: muted }}>{isAr ? card.descAr : card.descEn}</div>
                </div>

                {/* Equation */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 12px', borderRadius: 10,
                  background: isDark ? 'rgba(255,255,255,.04)' : card.bg,
                  border: `1px solid ${card.bd}`,
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '.82rem', fontWeight: 700, color: card.color }}>{card.count}</span>
                  <span style={{ fontSize: '.75rem', color: muted }}>×</span>
                  <span style={{ fontSize: '.82rem', color: muted }}>{fmt(card.rate, sym)}</span>
                  <span style={{ fontSize: '.75rem', color: muted }}>=</span>
                  <span style={{ fontSize: '.9rem', fontWeight: 900, color: card.color, marginLeft: 'auto', marginRight: 0 }}>{fmt(card.amount, sym)}</span>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 12, height: 4, borderRadius: 4, background: isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${card.color}, ${card.color}90)`, width: `${Math.round((card.amount / (total || 1)) * 100)}%`, transition: 'width .6s ease' }}/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  <span style={{ fontSize: '.66rem', color: muted }}>{Math.round((card.amount / (total || 1)) * 100)}% of total</span>
                  <span style={{ fontSize: '.66rem', color: card.color, fontWeight: 700 }}>{fmt(card.amount, sym)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Total summary row ─────────────────────────── */}
          <div style={{
            background: surf, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden',
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,.2)' : '0 1px 6px rgba(0,0,0,.05)',
          }}>
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Breakdown pills */}
                {[
                  { label: isAr ? 'التحديد' : 'Placement', val: fmt(plAmt, sym),  color: '#3b82f6' },
                  { label: isAr ? 'المحادثة' : 'Speaking', val: fmt(spAmt, sym), color: '#8b5cf6' },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }}/>
                    <span style={{ fontSize: '.76rem', color: muted }}>{p.label}</span>
                    <span style={{ fontSize: '.82rem', fontWeight: 700, color: p.color }}>{p.val}</span>
                    {i < 1 && <span style={{ fontSize: '.76rem', color: muted, marginLeft: 4 }}>+</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', color: muted }}>
                  {isAr ? 'الإجمالي' : 'TOTAL'}
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: gold }}>{fmt(total, sym)}</span>
              </div>
            </div>
          </div>

          {/* ── Transferred banner ──────────────────────── */}
          {data.alreadyTransferred && data.transferId && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 20px', borderRadius: 14,
              background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)',
              flexWrap: 'wrap',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" width="17" height="17"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '.88rem', color: '#10b981', marginBottom: 2 }}>
                  {isAr ? 'تم تحويل الراتب' : 'Payroll Transferred'}
                </div>
                <div style={{ fontSize: '.78rem', color: muted }}>
                  {isAr ? 'تم تحويل راتب هذا الشهر. يمكنك عرض كشف الراتب في السجل.' : 'This month\'s payroll has been transferred to your account. View the payslip in History.'}
                </div>
              </div>
              <button
                onClick={() => { setTab('history') }}
                style={{ padding: '8px 18px', borderRadius: 9, background: '#10b981', border: 'none', color: '#fff', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
              >{isAr ? 'عرض السجل' : 'View History'}</button>
            </div>
          )}

          {/* ── No rate configured warning ─────────────── */}
          {data.placementRate === 0 && data.speakingRate === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" width="18" height="18" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: '.83rem', color: isDark ? '#fbbf24' : '#92400e' }}>
                {isAr ? 'لم يتم تعيين معدلات الأجر بعد من الإدارة.' : 'Pay rates have not been configured by the admin yet.'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          HISTORY
      ══════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <div style={{ animation: 'prFadeUp .28s ease' }}>
          {histLoad ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`, borderTopColor: gold, animation: 'prSpin .7s linear infinite' }}/>
            </div>
          ) : history && history.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: 'center', padding: '72px 40px', background: surf, border: `1px solid ${border}`, borderRadius: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                background: `${gold}10`, border: `1.5px dashed ${gold}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" width="30" height="30">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"/>
                  <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>
                </svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: text, marginBottom: 8 }}>
                {isAr ? 'لا يوجد سجل بعد' : 'No payslips yet'}
              </div>
              <div style={{ fontSize: '.85rem', color: muted, maxWidth: 320, margin: '0 auto' }}>
                {isAr ? 'ستظهر كشوف الرواتب هنا بعد أول تحويل من الإدارة.' : 'Your payslips will appear here after the admin processes your first transfer.'}
              </div>
            </div>
          ) : history && (
            /* Payslip cards grid */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '.74rem', color: muted, fontWeight: 600, letterSpacing: '.08em' }}>
                {isAr ? `${history.length} كشف راتب` : `${history.length} payslip${history.length !== 1 ? 's' : ''}`}
              </div>

              {history.map((t, i) => {
                const s      = currencySym(t.currency)
                const plAmt  = t.placementCount * t.placementRate
                const spAmt  = t.speakingCount  * t.speakingRate
                const ttl    = t.totalAmount

                return (
                  <div key={t.id} className="pr-hist-card" style={{
                    background: surf, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden',
                    boxShadow: isDark ? '0 2px 12px rgba(0,0,0,.2)' : '0 1px 6px rgba(0,0,0,.05)',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 0 }}>

                      {/* Left: month label */}
                      <div style={{
                        padding: '20px 22px', borderRight: `1px solid ${border}`, textAlign: 'center', minWidth: 120,
                        background: isDark ? 'rgba(201,147,44,.06)' : 'rgba(201,147,44,.04)',
                      }}>
                        <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', color: gold, marginBottom: 4 }}>
                          {t.month.split('-')[0]}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: text, lineHeight: 1.2 }}>
                          {new Date(Number(t.month.split('-')[0]), Number(t.month.split('-')[1]) - 1, 1).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </div>
                        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 100, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" width="9" height="9"><polyline points="20 6 9 17 4 12"/></svg>
                          <span style={{ fontSize: '.6rem', fontWeight: 700, color: '#10b981' }}>PAID</span>
                        </div>
                      </div>

                      {/* Middle: breakdown */}
                      <div style={{ padding: '18px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                          {[
                            { labelEn: 'Placement', labelAr: 'التحديد', count: t.placementCount, amt: plAmt, color: '#3b82f6' },
                            { labelEn: 'Speaking',  labelAr: 'المحادثة', count: t.speakingCount,  amt: spAmt,  color: '#8b5cf6' },
                          ].map((seg, si) => (
                            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 7, background: `${seg.color}14`, border: `1px solid ${seg.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '.75rem', fontWeight: 800, color: seg.color }}>{seg.count}</span>
                              </div>
                              <div>
                                <div style={{ fontSize: '.68rem', color: muted }}>{isAr ? seg.labelAr : seg.labelEn}</div>
                                <div style={{ fontSize: '.78rem', fontWeight: 700, color: seg.color }}>{fmt(seg.amt, s)}</div>
                              </div>
                              {si === 0 && <span style={{ fontSize: '.75rem', color: muted, margin: '0 4px' }}>+</span>}
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: isDark ? 'rgba(255,255,255,.05)' : '#f3f4f6', border: `1px solid ${border}` }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" width="10" height="10">
                              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                            </svg>
                            <span style={{ fontSize: '.7rem', color: muted }}>{t.paymentMethod}</span>
                          </span>
                          <span style={{ fontSize: '.7rem', color: muted }}>{fmtDate(t.transferredAt)}</span>
                          {t.evidenceName && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 100, background: 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.18)' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" width="10" height="10">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                              </svg>
                              <span style={{ fontSize: '.7rem', color: '#10b981' }}>{isAr ? 'إثبات الدفع' : 'Receipt attached'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: total + download */}
                      <div style={{ padding: '18px 22px', borderLeft: `1px solid ${border}`, textAlign: 'center', minWidth: 120 }}>
                        <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', color: muted, marginBottom: 4 }}>TOTAL</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: gold, marginBottom: 14, lineHeight: 1 }}>{fmt(ttl, s)}</div>
                        <button
                          className="pr-dl-btn"
                          onClick={() => window.open(`/payslip/${t.id}?print=1`, '_blank')}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px', borderRadius: 9,
                            border: `1px solid ${border}`, background: 'none',
                            color: muted, fontSize: '.75rem', fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
