'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error || 'Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: var(--font-gotham, 'Gotham', sans-serif);
        }

        /* ── LEFT PANEL ── */
        .login-left {
          position: relative;
          flex: 0 0 58%;
          background: #0a1b22;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
        }
        .login-left__bg {
          position: absolute;
          inset: 0;
          background-image: url(/images/login-illustration.svg);
          background-size: cover;
          background-position: center 30%;
          opacity: .22;
        }
        .login-left__ray1 {
          position: absolute;
          top: -200px; left: -100px;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(201,147,44,.22) 0%, transparent 65%);
          pointer-events: none;
        }
        .login-left__ray2 {
          position: absolute;
          bottom: -150px; right: -100px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(73,80,65,.35) 0%, transparent 65%);
          pointer-events: none;
        }
        .login-left__line {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent 0%, rgba(201,147,44,.35) 30%, rgba(201,147,44,.35) 70%, transparent 100%);
        }
        .login-left__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201,147,44,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,147,44,.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* top brand */
        .login-left__brand {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .login-left__brand-emblem {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: rgba(201,147,44,.12);
          border: 1px solid rgba(201,147,44,.35);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .login-left__brand-text { line-height: 1; }
        .login-left__brand-name {
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .2em;
          color: #c9932c;
        }
        .login-left__brand-tag {
          font-size: .55rem;
          letter-spacing: .16em;
          color: rgba(201,147,44,.5);
          margin-top: 3px;
        }

        /* centre hero text */
        .login-left__hero {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 0 40px;
        }
        .login-left__badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(201,147,44,.1);
          border: 1px solid rgba(201,147,44,.25);
          border-radius: 100px;
          padding: 5px 14px;
          font-size: .68rem;
          font-weight: 600;
          letter-spacing: .12em;
          color: #c9932c;
          margin-bottom: 28px;
          width: fit-content;
        }
        .login-left__badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #c9932c;
          animation: pulse 2s ease-in-out infinite;
        }
        .login-left__title {
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -.01em;
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .login-left__title span {
          background: linear-gradient(135deg, #c9932c 0%, #e8b84b 50%, #ae6d0c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-left__sub {
          font-size: .95rem;
          color: rgba(255,255,255,.45);
          line-height: 1.75;
          max-width: 380px;
        }

        /* stats row */
        .login-left__stats {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 32px;
          padding-top: 40px;
          border-top: 1px solid rgba(201,147,44,.12);
        }
        .login-left__stat-num {
          font-size: 1.5rem;
          font-weight: 800;
          color: #c9932c;
          line-height: 1;
          margin-bottom: 4px;
        }
        .login-left__stat-label {
          font-size: .72rem;
          letter-spacing: .08em;
          color: rgba(255,255,255,.35);
          text-transform: uppercase;
        }

        /* ── RIGHT PANEL ── */
        .login-right {
          flex: 1;
          background: #10222b;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 52px;
          position: relative;
        }
        .login-right__inner {
          width: 100%;
          max-width: 360px;
        }
        .login-right__top {
          margin-bottom: 40px;
        }
        .login-right__welcome {
          font-size: 1.6rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -.01em;
          margin-bottom: 6px;
        }
        .login-right__sub {
          font-size: .85rem;
          color: rgba(255,255,255,.38);
        }

        /* form */
        .login-field { margin-bottom: 18px; }
        .login-label {
          display: block;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .1em;
          color: rgba(255,255,255,.5);
          margin-bottom: 8px;
        }
        .login-input-wrap { position: relative; }
        .login-input-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: rgba(201,147,44,.65);
          line-height: 0;
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(201,147,44,.18);
          border-radius: 11px;
          color: #fff;
          font-size: .9rem;
          font-family: inherit;
          outline: none;
          transition: border-color .2s, background .2s;
        }
        .login-input:focus {
          border-color: rgba(201,147,44,.55);
          background: rgba(255,255,255,.07);
        }
        .login-input::placeholder { color: rgba(255,255,255,.2); }
        .login-input--pad-right { padding-right: 44px; }
        .login-eye {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer;
          color: rgba(255,255,255,.3);
          padding: 0; line-height: 0;
          transition: color .15s;
        }
        .login-eye:hover { color: rgba(255,255,255,.6); }

        .login-error {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,.1);
          border: 1px solid rgba(239,68,68,.28);
          border-radius: 9px;
          padding: 10px 13px;
          margin-bottom: 18px;
          color: #f87171;
          font-size: .84rem;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #c9932c 0%, #ae6d0c 100%);
          border: none;
          border-radius: 11px;
          color: #fff;
          font-size: .92rem;
          font-weight: 700;
          letter-spacing: .07em;
          cursor: pointer;
          font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: opacity .2s;
          margin-top: 6px;
        }
        .login-btn:hover:not(:disabled) { opacity: .88; }
        .login-btn:disabled { opacity: .55; cursor: not-allowed; }
        .login-btn__spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        /* footer */
        .login-right__footer {
          position: absolute;
          bottom: 24px;
          font-size: .7rem;
          letter-spacing: .07em;
          color: rgba(255,255,255,.15);
          text-align: center;
        }

        /* divider with text */
        .login-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 22px 0;
        }
        .login-divider__line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,.08);
        }
        .login-divider__text {
          font-size: .7rem;
          letter-spacing: .08em;
          color: rgba(255,255,255,.25);
        }

        /* keyframes */
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }

        /* responsive */
        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">

        {/* ── LEFT PANEL ── */}
        <div className="login-left">
          <div className="login-left__bg" />
          <div className="login-left__ray1" />
          <div className="login-left__ray2" />
          <div className="login-left__grid" />
          <div className="login-left__line" />

          {/* Brand mark */}
          <div className="login-left__brand">
            <div className="login-left__brand-emblem">
              <Image src="/images/logo.png" alt="Grace Academy" width={28} height={28} style={{ objectFit: 'contain' }} />
            </div>
            <div className="login-left__brand-text">
              <div className="login-left__brand-name">GRACE ACADEMY</div>
              <div className="login-left__brand-tag">LONG LIVE LEARN</div>
            </div>
          </div>

          {/* Hero */}
          <div className="login-left__hero">
            <div className="login-left__badge">
              <span className="login-left__badge-dot" />
              ADMIN DASHBOARD
            </div>
            <h2 className="login-left__title">
              The world where<br />
              <span>learning never stops.</span>
            </h2>
            <p className="login-left__sub">
              Manage your content, team, and students from one powerful dashboard — built for Grace Academy.
            </p>
          </div>

          {/* Stats */}
          <div className="login-left__stats">
            {[
              { num: '24/7', label: 'Continuous Access' },
              { num: '100%', label: 'Secure Admin' },
              { num: '∞', label: 'Possibilities' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="login-left__stat-num">{num}</div>
                <div className="login-left__stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <div className="login-right__inner">

            {/* Heading */}
            <div className="login-right__top">
              <div style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: 'rgba(201,147,44,.1)',
                border: '1px solid rgba(201,147,44,.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="18" height="18">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
              </div>
              <h1 className="login-right__welcome">Welcome back</h1>
              <p className="login-right__sub">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Identifier */}
              <div className="login-field">
                <label className="login-label">EMAIL · USERNAME · PHONE</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    className="login-input"
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Enter email, username or phone"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field" style={{ marginBottom: 26 }}>
                <label className="login-label">PASSWORD</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    className="login-input login-input--pad-right"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="login-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-btn__spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider__line" />
              <span className="login-divider__text">GRACE ACADEMY</span>
              <div className="login-divider__line" />
            </div>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {['Content Manager', 'User Roles', 'Blog & Media', 'Analytics'].map(tag => (
                <span key={tag} style={{
                  fontSize: '.68rem',
                  letterSpacing: '.06em',
                  color: 'rgba(201,147,44,.6)',
                  background: 'rgba(201,147,44,.07)',
                  border: '1px solid rgba(201,147,44,.14)',
                  borderRadius: '100px',
                  padding: '4px 10px',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <p className="login-right__footer">
            © 2025 GRACE ACADEMY · ADMIN PORTAL
          </p>
        </div>

      </div>
    </>
  )
}
