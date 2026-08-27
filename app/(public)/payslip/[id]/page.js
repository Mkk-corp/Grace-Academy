'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'

function symFor(c) { return { USD:'$', EUR:'€', GBP:'£', SAR:'﷼', AED:'د.إ', EGP:'E£', KWD:'KD', QAR:'QR', JOD:'JD' }[c] || c }
function fmt(n, s)  { return `${s}${Number(n || 0).toFixed(2)}` }
function monthLabel(m) {
  if (!m) return ''
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1, 1).toLocaleDateString('en-US', { month:'long', year:'numeric' })
}
function fmtDate(d) { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' }) }

export default function PayslipPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const autoPrint    = searchParams.get('print') === '1'

  const [data,    setData]    = useState(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/payslip/${params.id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setData(d.transfer))
      .catch(e => setError(e === 401 || e === 403 ? 'You do not have access to this payslip.' : 'Payslip not found.'))
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    if (!autoPrint || !data) return
    const t = setTimeout(() => window.print(), 500)
    return () => clearTimeout(t)
  }, [autoPrint, data])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f7fa' }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #e5e7eb', borderTopColor:'#c9932c', animation:'spin .7s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f7fa', padding:20, textAlign:'center' }}>
      <div>
        <div style={{ fontSize:'1.2rem', fontWeight:700, color:'#374151', marginBottom:8 }}>Access Denied</div>
        <div style={{ color:'#6b7280' }}>{error}</div>
      </div>
    </div>
  )

  if (!data) return null

  const sym   = symFor(data.currency)
  const plAmt = data.placementCount * data.placementRate
  const spAmt = data.speakingCount  * data.speakingRate
  const total = data.totalAmount

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        body{background:#f5f7fa;font-family:'Segoe UI',Arial,sans-serif;color:#111827}

        .payslip-wrap{
          min-height:100vh;display:flex;flex-direction:column;
          align-items:center;padding:40px 20px 60px;
        }
        .payslip-actions{
          display:flex;gap:12px;margin-bottom:24px;width:100%;max-width:680px;
          justify-content:flex-end;
        }
        .payslip-card{
          width:100%;max-width:680px;background:#fff;border-radius:16px;
          overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.1);
        }

        /* ── Print ── */
        @media print{
          .payslip-actions{display:none !important}
          body{background:#fff !important}
          .payslip-wrap{padding:0 !important;background:#fff !important}
          .payslip-card{box-shadow:none !important;border-radius:0 !important;max-width:100% !important;width:100% !important}
          @page{margin:0;size:A4}
        }
      `}</style>

      <div className="payslip-wrap">
        {/* Action buttons — hidden on print */}
        <div className="payslip-actions">
          <button
            onClick={() => window.history.back()}
            style={{ padding:'8px 18px', borderRadius:9, border:'1px solid #e5e7eb', background:'#fff', color:'#6b7280', fontSize:'.84rem', fontWeight:600, cursor:'pointer' }}
          >← Back</button>
          <button
            onClick={() => window.print()}
            style={{ padding:'8px 20px', borderRadius:9, border:'none', background:'#c9932c', color:'#fff', fontSize:'.84rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:7 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
          </button>
        </div>

        <div className="payslip-card">

          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#0a1b22 0%,#10222b 100%)', padding:'36px 48px', textAlign:'center', borderBottom:'3px solid #c9932c' }}>
            {/* Logo area */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(201,147,44,.2)', border:'1px solid rgba(201,147,44,.35)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                <Image src="/images/logo.png" alt="" width={24} height={24} style={{ objectFit:'contain' }} />
              </div>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:'10px', fontWeight:800, letterSpacing:'.22em', color:'#c9932c', lineHeight:1.3 }}>GRACE ACADEMY</div>
                <div style={{ fontSize:'8px', letterSpacing:'.15em', color:'rgba(201,147,44,.5)' }}>OFFICIAL PAYSLIP</div>
              </div>
            </div>
            <div style={{ fontSize:'24px', fontWeight:900, color:'#fff', marginBottom:4 }}>{monthLabel(data.month)} Payslip</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,.55)' }}>{data.assessorName}</div>
          </div>

          {/* Summary chips */}
          <div style={{ background:'#fafafa', padding:'20px 48px', display:'flex', gap:16, flexWrap:'wrap', borderBottom:'1px solid #f0f0f0' }}>
            {[
              { label:'TOTAL PAYOUT',    value: fmt(total, sym), color:'#c9932c', big:true },
              { label:'TOTAL SESSIONS',  value: String(data.placementCount + data.speakingCount), color:'#111827' },
              { label:'PAYMENT METHOD',  value: data.paymentMethod, color:'#111827' },
            ].map(chip => (
              <div key={chip.label} style={{ flex:1, minWidth:150, textAlign:'center', padding:'14px 12px', background:'#fff', border:'1px solid #e5e7eb', borderRadius:10 }}>
                <div style={{ fontSize: chip.big ? '22px' : '16px', fontWeight:900, color:chip.color, marginBottom:4 }}>{chip.value}</div>
                <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.1em', color:'#9ca3af' }}>{chip.label}</div>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div style={{ padding:'28px 48px' }}>
            <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.14em', color:'#9ca3af', marginBottom:14 }}>EARNINGS BREAKDOWN</div>

            <div style={{ border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
              {/* Table header */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:0, background:'#f9fafb', padding:'10px 20px' }}>
                {['DESCRIPTION','QTY','RATE / SESSION','AMOUNT'].map((h, i) => (
                  <div key={h} style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.08em', color:'#6b7280', textAlign: i === 0 ? 'left' : 'right' }}>{h}</div>
                ))}
              </div>

              {/* Placement row */}
              {data.placementCount > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:0, padding:'14px 20px', borderTop:'1px solid #f3f4f6', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'13px', color:'#111827' }}>Placement Test Sessions</div>
                    <div style={{ fontSize:'11px', color:'#6b7280', marginTop:3 }}>Assessment & evaluation sessions</div>
                  </div>
                  <div style={{ textAlign:'right', fontWeight:700, fontSize:'15px', color:'#3b82f6', minWidth:60, padding:'0 16px' }}>{data.placementCount}</div>
                  <div style={{ textAlign:'right', fontSize:'13px', color:'#374151', minWidth:80, padding:'0 16px' }}>{fmt(data.placementRate, sym)}</div>
                  <div style={{ textAlign:'right', fontWeight:700, fontSize:'14px', color:'#111827', minWidth:80 }}>{fmt(plAmt, sym)}</div>
                </div>
              )}

              {/* Speaking row */}
              {data.speakingCount > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:0, padding:'14px 20px', borderTop:'1px solid #f3f4f6', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'13px', color:'#111827' }}>Speaking Sessions</div>
                    <div style={{ fontSize:'11px', color:'#6b7280', marginTop:3 }}>Conversation & language practice</div>
                  </div>
                  <div style={{ textAlign:'right', fontWeight:700, fontSize:'15px', color:'#8b5cf6', minWidth:60, padding:'0 16px' }}>{data.speakingCount}</div>
                  <div style={{ textAlign:'right', fontSize:'13px', color:'#374151', minWidth:80, padding:'0 16px' }}>{fmt(data.speakingRate, sym)}</div>
                  <div style={{ textAlign:'right', fontWeight:700, fontSize:'14px', color:'#111827', minWidth:80 }}>{fmt(spAmt, sym)}</div>
                </div>
              )}

              {/* No sessions */}
              {data.placementCount === 0 && data.speakingCount === 0 && (
                <div style={{ padding:'20px', textAlign:'center', color:'#9ca3af', fontSize:'13px', borderTop:'1px solid #f3f4f6' }}>No sessions this period</div>
              )}

              {/* Total row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background:'#f9fafb', borderTop:'2px solid #e5e7eb' }}>
                <div style={{ fontWeight:800, fontSize:'14px', color:'#111827' }}>Total Payout</div>
                <div style={{ fontWeight:900, fontSize:'20px', color:'#c9932c' }}>{fmt(total, sym)}</div>
              </div>
            </div>
          </div>

          {/* Transfer details */}
          <div style={{ padding:'0 48px 28px' }}>
            <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.14em', color:'#9ca3af', marginBottom:14 }}>TRANSFER DETAILS</div>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
              {[
                { label:'Assessor',        value: data.assessorName },
                { label:'Period',          value: monthLabel(data.month) },
                { label:'Payment Method',  value: data.paymentMethod },
                { label:'Transfer Date',   value: fmtDate(data.transferredAt) },
                { label:'Reference ID',    value: data.id },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 20px', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <span style={{ fontSize:'12px', color:'#6b7280' }}>{row.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:600, color:'#111827', textAlign:'right', maxWidth:'60%', wordBreak:'break-all' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding:'16px 48px 24px', borderTop:'1px solid #f0f0f0', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div style={{ fontSize:'10px', color:'#9ca3af' }}>
              This payslip was issued by Grace Academy. Keep for your records.
            </div>
            <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.12em', color:'#c9932c' }}>GRACE ACADEMY</div>
          </div>

        </div>
      </div>
    </>
  )
}
