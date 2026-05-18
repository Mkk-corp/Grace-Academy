'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
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
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Invalid password')
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', width: '100%', maxWidth: '360px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '40px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '8px', letterSpacing: '.1em', textTransform: 'uppercase' }}>Grace Admin</h1>
        <p style={{ fontSize: '.85rem', color: 'var(--text-60)', marginBottom: '28px' }}>Enter your password to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              required
            />
          </div>
          {error && <p style={{ color: '#dc3545', fontSize: '.85rem', marginBottom: '12px' }}>{error}</p>}
          <button type="submit" className="admin-btn admin-btn--primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

