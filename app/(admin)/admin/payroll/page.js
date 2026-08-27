'use client'

import { useState, useEffect, useRef } from 'react'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const CURRENCIES = [
  { code:'USD', sym:'$',   label:'USD — US Dollar'      },
  { code:'EUR', sym:'€',   label:'EUR — Euro'            },
  { code:'GBP', sym:'£',   label:'GBP — British Pound'  },
  { code:'SAR', sym:'﷼',  label:'SAR — Saudi Riyal'    },
  { code:'AED', sym:'د.إ',label:'AED — UAE Dirham'     },
  { code:'EGP', sym:'E£', label:'EGP — Egyptian Pound' },
  { code:'KWD', sym:'KD', label:'KWD — Kuwaiti Dinar'  },
  { code:'QAR', sym:'QR', label:'QAR — Qatari Riyal'   },
  { code:'JOD', sym:'JD', label:'JOD — Jordanian Dinar'},
]
function symFor(c) { return CURRENCIES.find(x => x.code === c)?.sym || c }
function fmt(n, s)  { return `${s}${Number(n || 0).toFixed(2)}` }
function monthLabel(monthStr) {
  if (!monthStr) return ''
  const [y, m] = monthStr.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month:'long', year:'numeric' })
}
function fmtDate(d) { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) }
function currentMonthStr() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

/* ── Transfer modal ─────────────────────────────────────────────── */
function TransferModal({ assessor, methods, currency, month, onClose, onSuccess, isDark }) {
  const sym = symFor(currency)
  const [payMethod,  setPayMethod]  = useState(methods[0] || '')
  const [evidFile,   setEvidFile]   = useState(null)
  const [evidName,   setEvidName]   = useState('')
  const [evidData,   setEvidData]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const fileRef = useRef()

  function pickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setEvidName(f.name)
    const reader = new FileReader()
    reader.onload = ev => setEvidData(ev.target.result)
    reader.readAsDataURL(f)
    setEvidFile(f)
  }

  async function submit() {
    if (!payMethod) { setError('Select a payment method'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/admin/payroll/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessorId: assessor.id,
          paymentMethod: payMethod,
          evidenceData: evidData || undefined,
          evidenceName: evidName || undefined,
          month,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Transfer failed'); return }
      onSuccess(data.transfer)
    } catch { setError('Network error') }
    finally { setSubmitting(false) }
  }

  const border = isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const surf   = isDark ? '#10222b' : '#fff'

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', backdropFilter:'blur(3px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background: surf, borderRadius: 20, padding: '32px 36px', width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,.2)' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: text }}>Transfer Payroll</div>
            <div style={{ fontSize: '.8rem', color: muted, marginTop: 3 }}>{assessor.name} · {monthLabel(month)}</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${border}`, background:'none', color:muted, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Amount preview */}
        <div style={{ padding:'16px 20px', borderRadius:12, background: isDark ? 'rgba(201,147,44,.08)' : 'rgba(201,147,44,.05)', border:'1px solid rgba(201,147,44,.2)', marginBottom:22, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'.72rem', fontWeight:700, letterSpacing:'.1em', color:'#c9932c', marginBottom:4 }}>TOTAL TRANSFER</div>
            <div style={{ fontSize:'.82rem', color:muted }}>{assessor.placementCount} placement + {assessor.speakingCount} speaking sessions</div>
          </div>
          <div style={{ fontSize:'1.7rem', fontWeight:900, color:'#c9932c' }}>{fmt(assessor.rawTotal || assessor.totalAmount, sym)}</div>
        </div>

        {/* Payment method */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, letterSpacing:'.08em', color:muted, marginBottom:6 }}>PAYMENT METHOD *</label>
          {methods.length === 0 ? (
            <div style={{ padding:'10px 14px', borderRadius:9, border:`1px solid ${border}`, background:isDark ? 'rgba(255,255,255,.03)' : '#f9fafb', fontSize:'.84rem', color:muted }}>
              No payment methods configured. Add them in the Data Center.
            </div>
          ) : (
            <select
              value={payMethod}
              onChange={e => setPayMethod(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:`1px solid ${border}`, background:isDark ? 'rgba(255,255,255,.05)' : '#f9fafb', color:text, fontSize:'.88rem', fontFamily:'inherit', outline:'none', cursor:'pointer' }}
            >
              <option value="">Select method…</option>
              {methods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
        </div>

        {/* Evidence upload */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, letterSpacing:'.08em', color:muted, marginBottom:6 }}>PAYMENT EVIDENCE (optional)</label>
          <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={pickFile} style={{ display:'none' }} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{ width:'100%', padding:'12px', borderRadius:9, border:`1.5px dashed ${border}`, background:'none', color:muted, fontSize:'.84rem', cursor:'pointer', textAlign:'center', fontFamily:'inherit' }}
          >
            {evidFile ? (
              <span style={{ color:'#10b981', fontWeight:600 }}>✓ {evidName}</span>
            ) : (
              <span>Click to upload screenshot, PDF, or receipt</span>
            )}
          </button>
        </div>

        {error && <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#ef4444', fontSize:'.83rem', marginBottom:16 }}>{error}</div>}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} disabled={submitting} style={{ flex:1, padding:'11px', borderRadius:10, border:`1px solid ${border}`, background:'none', color:muted, fontWeight:600, fontSize:'.87rem', cursor:'pointer', fontFamily:'inherit' }}>
            Cancel
          </button>
          <button onClick={submit} disabled={submitting || methods.length === 0} style={{ flex:2, padding:'11px', borderRadius:10, border:'none', background: submitting ? 'rgba(201,147,44,.4)' : '#c9932c', color:'#fff', fontWeight:700, fontSize:'.87rem', cursor: submitting ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit' }}>
            {submitting ? (
              <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', animation:'adSpin .7s linear infinite' }}/> Transferring…</>
            ) : 'Confirm Transfer'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function PayrollPage() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [tab,          setTab]          = useState('settings')  // settings | assessors | history
  const [loading,      setLoading]      = useState(true)

  // Settings
  const [placement,    setPlacement]    = useState('')
  const [speaking,     setSpeaking]     = useState('')
  const [currency,     setCurrency]     = useState('USD')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [saveErr,      setSaveErr]      = useState('')

  // Assessors
  const [assessors,    setAssessors]    = useState(null)
  const [assMonth,     setAssMonth]     = useState(currentMonthStr())
  const [assLoading,   setAssLoading]   = useState(false)
  const [transferModal,setTransferModal]= useState(null) // assessor object
  const [methods,      setMethods]      = useState([])
  const [successBanner,setSuccessBanner]= useState(null)

  // History
  const [history,      setHistory]      = useState(null)
  const [histLoading,  setHistLoading]  = useState(false)

  const sym = symFor(currency)

  // Initial load
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/payroll/settings').then(r => r.ok ? r.json() : {}),
      fetch('/api/admin/payment-methods').then(r => r.ok ? r.json() : { methods: [] }),
    ]).then(([s, m]) => {
      setPlacement(s.placementPayPerSession ?? '')
      setSpeaking(s.speakingPayPerSession   ?? '')
      setCurrency(s.currency               ?? 'USD')
      setMethods(m.methods || [])
    }).finally(() => setLoading(false))
  }, [])

  // Load assessors when tab switches
  useEffect(() => {
    if (tab !== 'assessors') return
    loadAssessors()
  }, [tab, assMonth])

  function loadAssessors() {
    setAssLoading(true)
    fetch(`/api/admin/payroll/assessors?month=${assMonth}`)
      .then(r => r.ok ? r.json() : { assessors: [] })
      .then(d => setAssessors(d.assessors || []))
      .finally(() => setAssLoading(false))
  }

  // Load history
  useEffect(() => {
    if (tab !== 'history' || history) return
    setHistLoading(true)
    fetch('/api/admin/payroll/history')
      .then(r => r.ok ? r.json() : { transfers: [] })
      .then(d => setHistory(d.transfers || []))
      .finally(() => setHistLoading(false))
  }, [tab])

  async function saveSettings() {
    setSaving(true); setSaved(false); setSaveErr('')
    try {
      const res = await fetch('/api/admin/payroll/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placementPayPerSession: placement, speakingPayPerSession: speaking, currency }),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { setSaveErr(isAr ? 'فشل الحفظ' : 'Save failed') }
    finally { setSaving(false) }
  }

  function handleTransferSuccess(transfer) {
    setTransferModal(null)
    setSuccessBanner(transfer)
    loadAssessors()
    setHistory(null) // reset history cache
    setTimeout(() => setSuccessBanner(null), 6000)
  }

  function downloadPayslip(id) {
    window.open(`/payslip/${id}?print=1`, '_blank')
  }

  // Styles
  const border  = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const surf    = isDark ? 'rgba(255,255,255,.04)' : '#fff'
  const surfBg  = isDark ? 'rgba(255,255,255,.025)' : '#f9fafb'
  const gold    = '#c9932c'

  function TabBtn({ id, label }) {
    const active = tab === id
    return (
      <button
        onClick={() => setTab(id)}
        style={{ padding:'9px 22px', borderRadius:10, border:'none', cursor:'pointer', fontWeight: active ? 700 : 500, fontSize:'.84rem', fontFamily:'inherit',
          background: active ? gold : 'transparent', color: active ? '#fff' : muted, transition:'all .15s' }}
      >{label}</button>
    )
  }

  if (loading) return (
    <div style={{ padding:'60px 0', textAlign:'center', color: muted }}>
      <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid ${border}`, borderTopColor: gold, animation:'adSpin .7s linear infinite', margin:'0 auto' }}/>
    </div>
  )

  return (
    <>
      <div className="admin-header">
        <h1 style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.7" width="22" height="22" style={{ flexShrink:0 }}>
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"/>
            <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>
          </svg>
          {isAr ? 'الرواتب' : 'Payroll'}
        </h1>
      </div>

      {/* Tab bar */}
      <div style={{ display:'inline-flex', gap:4, padding:4, borderRadius:13, background: isDark ? 'rgba(255,255,255,.05)' : '#f3f4f6', marginBottom:28 }}>
        <TabBtn id="settings"  label={isAr ? 'الإعدادات' : 'Settings'}             />
        <TabBtn id="assessors" label={isAr ? 'الموظفون' : 'Staff'} />
        <TabBtn id="history"   label={isAr ? 'السجل'      : 'History'}              />
      </div>

      {/* ══ SETTINGS ══ */}
      {tab === 'settings' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:780 }}>
          <div style={{ background:surf, border:`1px solid ${border}`, borderRadius:'var(--r-lg)', overflow:'hidden' }}>
            {/* Card header */}
            <div style={{ padding:'18px 24px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:`${gold}14`, border:`1px solid ${gold}28`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" width="16" height="16">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:'.95rem', color:text }}>{isAr ? 'إعدادات المدفوعات' : 'Payout Settings'}</div>
                <div style={{ fontSize:'.75rem', color:muted, marginTop:2 }}>{isAr ? 'تحديد قيمة الأتعاب لكل نوع من الجلسات' : 'Configure pay rates for each session type'}</div>
              </div>
            </div>

            {/* Currency */}
            <div style={{ padding:'18px 24px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:'.85rem', color:text }}>Currency</div>
                <div style={{ fontSize:'.75rem', color:muted, marginTop:3 }}>Applied to all consultant payouts</div>
              </div>
              <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ padding:'8px 12px', borderRadius:8, border:`1px solid ${border}`, background: isDark ? 'rgba(255,255,255,.05)' : '#f9fafb', color:text, fontSize:'.85rem', fontFamily:'inherit', cursor:'pointer', outline:'none', minWidth:200 }}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>

            {/* Placement rate */}
            {[
              { key:'placement', label:'Placement Test', desc:'Pay per placement test session conducted', val:placement, set:setPlacement, icon: <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>, iconExtra: <><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></>, col:'#3b82f6' },
              { key:'speaking',  label:'Speaking Session', desc:'Pay per speaking session conducted',       val:speaking,   set:setSpeaking,  icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,                                                                                                                       col:'#8b5cf6' },
            ].map((row, i, arr) => (
              <div key={row.key} style={{ padding:'18px 24px', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={row.col} strokeWidth="1.8" width="14" height="14">{row.icon}{row.iconExtra}</svg>
                    <span style={{ fontWeight:600, fontSize:'.88rem', color:text }}>{row.label}</span>
                  </div>
                  <div style={{ fontSize:'.75rem', color:muted }}>{row.desc}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:0, flexShrink:0 }}>
                  <div style={{ padding:'9px 12px', background:`${row.col}14`, border:`1px solid ${row.col}30`, borderRight:'none', borderRadius:'8px 0 0 8px', fontSize:'.88rem', fontWeight:700, color:row.col, lineHeight:1 }}>{sym}</div>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={row.val} onChange={e => row.set(e.target.value)}
                    style={{ width:120, padding:'9px 12px', border:`1px solid ${border}`, borderRadius:'0 8px 8px 0', background: isDark ? 'rgba(255,255,255,.05)' : '#f9fafb', color:text, fontSize:'.88rem', fontFamily:'inherit', outline:'none' }}
                    onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:12 }}>
            {saveErr && <span style={{ fontSize:'.82rem', color:'#ef4444', marginRight:'auto' }}>{saveErr}</span>}
            {saved && <span style={{ fontSize:'.82rem', color:'#10b981', display:'flex', alignItems:'center', gap:5, marginRight:'auto' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
              Saved
            </span>}
            <button className="admin-btn admin-btn--primary" onClick={saveSettings} disabled={saving} style={{ minWidth:130, justifyContent:'center', opacity: saving ? .7 : 1 }}>
              {saving ? 'Saving…' : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
            </button>
          </div>
        </div>
      )}

      {/* ══ ASSESSORS ══ */}
      {tab === 'assessors' && (
        <div style={{ maxWidth: '100%' }}>
          {/* Success banner */}
          {successBanner && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', borderRadius:12, background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)', marginBottom:20 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" width="16" height="16" style={{ flexShrink:0 }}><polyline points="20 6 9 17 4 12"/></svg>
              <div style={{ fontSize:'.85rem', color: isDark ? '#34d399' : '#065f46', flex:1 }}>
                <strong>{successBanner.assessorName}</strong>'s payroll for {monthLabel(successBanner.month)} has been transferred. Balance is now <strong>{symFor(successBanner.currency)}0.00</strong>.
              </div>
              <button onClick={() => downloadPayslip(successBanner.id)} style={{ padding:'5px 12px', borderRadius:8, background:'#10b981', border:'none', color:'#fff', fontWeight:700, fontSize:'.78rem', cursor:'pointer' }}>Download PDF</button>
            </div>
          )}

          {/* Month selector */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
            <div style={{ fontSize:'.8rem', color:muted, fontWeight:600 }}>{isAr ? 'الشهر:' : 'Month:'}</div>
            <input type="month" value={assMonth} onChange={e => setAssMonth(e.target.value)}
              style={{ padding:'7px 12px', borderRadius:9, border:`1px solid ${border}`, background: isDark ? 'rgba(255,255,255,.05)' : '#f9fafb', color:text, fontSize:'.85rem', fontFamily:'inherit', outline:'none', cursor:'pointer' }}
            />
          </div>

          {assLoading ? (
            <div style={{ padding:'60px 0', textAlign:'center' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid ${border}`, borderTopColor:gold, animation:'adSpin .7s linear infinite', margin:'0 auto' }}/>
            </div>
          ) : assessors && assessors.length === 0 ? (
            <div style={{ background:surf, border:`1px solid ${border}`, borderRadius:14, padding:'56px 40px', textAlign:'center' }}>
              <div style={{ fontSize:'.88rem', color:muted }}>No staff members found. Assign the teacher or academic consultant portal role to users first.</div>
            </div>
          ) : assessors && (
            <div style={{ background:surf, border:`1px solid ${border}`, borderRadius:14, overflow:'hidden', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.3)' : '0 1px 8px rgba(0,0,0,.05)' }}>
              <div style={{ overflowX:'auto' }}>
                <table style={{ borderCollapse:'collapse', width:'100%', minWidth:720 }}>
                  <thead>
                    <tr style={{ background: surfBg }}>
                      {['Staff Member','Role','Placement','Speaking','Total','Status',''].map((h, i) => (
                        <th key={i} style={{ padding:'13px 18px', fontSize:'.7rem', fontWeight:700, letterSpacing:'.08em', color:muted, textAlign: i === 0 || i === 1 ? 'left' : i === 6 ? 'center' : 'center', borderBottom:`1px solid ${border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assessors.map(a => {
                      const s = symFor(currency)
                      return (
                        <tr key={a.id} style={{ borderBottom:`1px solid ${border}` }}>
                          <td style={{ padding:'15px 18px' }}>
                            <div style={{ fontWeight:700, fontSize:'.88rem', color:text }}>{a.name}</div>
                            <div style={{ fontSize:'.74rem', color:muted, marginTop:2 }}>{a.email}</div>
                          </td>
                          <td style={{ padding:'15px 18px' }}>
                            {(() => {
                              const isAC = a.staffType?.includes('Academic Consultant')
                              const isTe = a.staffType?.includes('Teacher')
                              return (
                                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                  {isAC && <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:100, background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.2)', fontSize:'.7rem', fontWeight:700, color:'#3b82f6', width:'fit-content' }}>Academic Consultant</span>}
                                  {isTe && <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:100, background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.2)', fontSize:'.7rem', fontWeight:700, color:'#8b5cf6', width:'fit-content' }}>Teacher</span>}
                                </div>
                              )
                            })()}
                          </td>
                          <td style={{ padding:'15px 18px', textAlign:'center' }}>
                            <div style={{ fontWeight:700, fontSize:'1.05rem', color:'#3b82f6' }}>{a.placementCount}</div>
                            <div style={{ fontSize:'.7rem', color:muted, marginTop:2 }}>{fmt(a.placementCount * a.placementRate, s)}</div>
                          </td>
                          <td style={{ padding:'15px 18px', textAlign:'center' }}>
                            <div style={{ fontWeight:700, fontSize:'1.05rem', color:'#8b5cf6' }}>{a.speakingCount}</div>
                            <div style={{ fontSize:'.7rem', color:muted, marginTop:2 }}>{fmt(a.speakingCount * a.speakingRate, s)}</div>
                          </td>
                          <td style={{ padding:'15px 18px', textAlign:'center' }}>
                            <div style={{ fontWeight:900, fontSize:'1.1rem', color: a.alreadyTransferred ? muted : gold }}>
                              {a.alreadyTransferred ? fmt(0, s) : fmt(a.rawTotal, s)}
                            </div>
                          </td>
                          <td style={{ padding:'15px 18px', textAlign:'center' }}>
                            {a.alreadyTransferred ? (
                              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:100, background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)', fontSize:'.74rem', fontWeight:700, color:'#10b981' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg>
                                Transferred
                              </span>
                            ) : a.rawTotal > 0 ? (
                              <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:100, background:`${gold}10`, border:`1px solid ${gold}25`, fontSize:'.74rem', fontWeight:700, color:gold }}>Pending</span>
                            ) : (
                              <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:100, background: isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6', border:`1px solid ${border}`, fontSize:'.74rem', color:muted }}>No sessions</span>
                            )}
                          </td>
                          <td style={{ padding:'15px 18px', textAlign:'center' }}>
                            {a.alreadyTransferred ? (
                              <button onClick={() => downloadPayslip(a.transferId)} title="Download payslip"
                                style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${border}`, background:'none', color:muted, fontSize:'.78rem', fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5, fontFamily:'inherit' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                PDF
                              </button>
                            ) : (
                              <button onClick={() => setTransferModal(a)} disabled={a.rawTotal === 0}
                                style={{ padding:'7px 16px', borderRadius:9, border:'none', background: a.rawTotal > 0 ? gold : isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb', color: a.rawTotal > 0 ? '#fff' : muted, fontSize:'.8rem', fontWeight:700, cursor: a.rawTotal > 0 ? 'pointer' : 'not-allowed', fontFamily:'inherit', opacity: a.rawTotal === 0 ? .5 : 1, transition:'all .15s' }}>
                                Transfer Payroll
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ HISTORY ══ */}
      {tab === 'history' && (
        histLoading ? (
          <div style={{ padding:'60px 0', textAlign:'center' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid ${border}`, borderTopColor:gold, animation:'adSpin .7s linear infinite', margin:'0 auto' }}/>
          </div>
        ) : history && history.length === 0 ? (
          <div style={{ background:surf, border:`1px solid ${border}`, borderRadius:14, padding:'56px 40px', textAlign:'center' }}>
            <div style={{ fontSize:'.88rem', color:muted }}>No payroll transfers yet.</div>
          </div>
        ) : history && (
          <div style={{ background:surf, border:`1px solid ${border}`, borderRadius:14, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ borderCollapse:'collapse', width:'100%', minWidth:760 }}>
                <thead>
                  <tr style={{ background:surfBg }}>
                    {['Assessor','Month','Placement','Speaking','Total','Method','Transferred By','Date',''].map((h, i) => (
                      <th key={i} style={{ padding:'12px 16px', fontSize:'.7rem', fontWeight:700, letterSpacing:'.08em', color:muted, textAlign: i === 0 ? 'left' : i === 8 ? 'center' : 'center', borderBottom:`1px solid ${border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(t => {
                    const s = symFor(t.currency)
                    return (
                      <tr key={t.id} style={{ borderBottom:`1px solid ${border}` }}>
                        <td style={{ padding:'13px 16px' }}>
                          <div style={{ fontWeight:700, fontSize:'.85rem', color:text }}>{t.assessorName}</div>
                          <div style={{ fontSize:'.72rem', color:muted }}>{t.assessorEmail}</div>
                        </td>
                        <td style={{ padding:'13px 16px', textAlign:'center', fontSize:'.84rem', fontWeight:600, color:text }}>{monthLabel(t.month)}</td>
                        <td style={{ padding:'13px 16px', textAlign:'center', fontSize:'.84rem', color:'#3b82f6', fontWeight:700 }}>{t.placementCount}</td>
                        <td style={{ padding:'13px 16px', textAlign:'center', fontSize:'.84rem', color:'#8b5cf6', fontWeight:700 }}>{t.speakingCount}</td>
                        <td style={{ padding:'13px 16px', textAlign:'center', fontSize:'.9rem', fontWeight:900, color:gold }}>{fmt(t.totalAmount, s)}</td>
                        <td style={{ padding:'13px 16px', textAlign:'center' }}>
                          <span style={{ display:'inline-block', padding:'3px 9px', borderRadius:100, background: isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6', fontSize:'.74rem', color:muted }}>{t.paymentMethod}</span>
                        </td>
                        <td style={{ padding:'13px 16px', textAlign:'center', fontSize:'.78rem', color:muted }}>{t.transferredByName}</td>
                        <td style={{ padding:'13px 16px', textAlign:'center', fontSize:'.78rem', color:muted }}>{fmtDate(t.transferredAt)}</td>
                        <td style={{ padding:'13px 16px', textAlign:'center' }}>
                          <button onClick={() => downloadPayslip(t.id)} title="Download payslip"
                            style={{ width:30, height:30, borderRadius:7, border:`1px solid ${border}`, background:'none', color:muted, cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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

      {/* Transfer modal */}
      {transferModal && (
        <TransferModal
          assessor={transferModal}
          methods={methods}
          currency={currency}
          month={assMonth}
          isDark={isDark}
          onClose={() => setTransferModal(null)}
          onSuccess={handleTransferSuccess}
        />
      )}
    </>
  )
}
