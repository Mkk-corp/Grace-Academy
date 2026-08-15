'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ClipInner() {
  const params = useSearchParams()
  const [state, setState] = useState('copying') // 'copying' | 'done' | 'error'
  const [value, setValue] = useState('')

  useEffect(() => {
    const raw = params.get('v')
    if (!raw) { setState('error'); return }

    let decoded
    try { decoded = atob(raw) } catch { setState('error'); return }

    setValue(decoded)

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(decoded)
        .then(() => setState('done'))
        .catch(() => setState('fallback'))
    } else {
      setState('fallback')
    }
  }, [params])

  function manualCopy() {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(() => setState('done')).catch(() => {})
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a1b22', fontFamily: "'Segoe UI', Arial, sans-serif", padding: 24,
    }}>
      <div style={{
        background: '#10222b', border: '1px solid rgba(201,147,44,.22)', borderRadius: 20,
        padding: '40px 36px', maxWidth: 380, width: '100%', textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.22em', color: '#c9932c', marginBottom: 28 }}>
          GRACE ACADEMY
        </div>

        {state === 'copying' && (
          <>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,147,44,.1)', border: '1.5px solid rgba(201,147,44,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Copying…</div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.85rem' }}>Please wait a moment.</div>
          </>
        )}

        {state === 'done' && (
          <>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(16,185,129,.1)', border: '1.5px solid rgba(16,185,129,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Copied to clipboard!</div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.85rem', marginBottom: 20 }}>You can close this tab and paste it where you need it.</div>
            <button onClick={() => window.close()} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: '.85rem' }}>
              Close Tab
            </button>
          </>
        )}

        {state === 'fallback' && (
          <>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,147,44,.1)', border: '1.5px solid rgba(201,147,44,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Click to copy</div>
            <div style={{
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10,
              padding: '12px 16px', marginBottom: 16, fontFamily: "'Courier New', monospace",
              fontSize: '.95rem', color: '#c9932c', wordBreak: 'break-all', textAlign: 'left',
            }}>
              {value}
            </div>
            <button onClick={manualCopy} style={{
              background: 'linear-gradient(135deg,#c9932c,#ae6d0c)', color: '#fff', border: 'none',
              borderRadius: 10, padding: '11px 28px', cursor: 'pointer', fontWeight: 700, fontSize: '.9rem',
            }}>
              Copy to Clipboard
            </button>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Invalid link</div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.85rem' }}>This copy link is not valid. Please contact your administrator.</div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ClipPage() {
  return (
    <Suspense>
      <ClipInner />
    </Suspense>
  )
}
