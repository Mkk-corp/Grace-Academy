'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'

export default function AdminContactPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetch('/api/contact').then(r => r.json()).then(msgs => { setMessages(msgs.reverse()); setLoading(false) }) }, [])

  async function markRead(id) {
    await fetch('/api/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
  }

  async function remove(id) {
    if (!confirm('Delete this message?')) return
    await fetch('/api/contact', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setMessages(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <>
      <div className="admin-header">
        <h1>Messages <span style={{ fontSize: '.8rem', color: 'var(--text-60)' }}>({messages.filter(m => !m.read).length} unread)</span></h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <table className="admin-table">
            <thead><tr><th>From</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {loading
                ? <AdminTableSkeleton cols={3} rows={5} />
                : messages.map(msg => (
                  <tr key={msg.id} onClick={() => { setSelected(msg); if (!msg.read) markRead(msg.id) }} style={{ cursor: 'pointer' }}>
                    <td>
                      {!msg.read && <span className="badge-unread" style={{ marginRight: '8px' }}>NEW</span>}
                      {msg.name}
                    </td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-60)' }}>{new Date(msg.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="admin-btn admin-btn--danger" onClick={e => { e.stopPropagation(); remove(msg.id) }} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'4px 8px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </td>
                  </tr>
                ))
              }
              {!loading && messages.length === 0 && (
                <tr><td colSpan={3} style={{ color: 'var(--text-40)', textAlign: 'center', padding: '24px' }}>No messages</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          {selected ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{selected.name}</h3>
              <p style={{ fontSize: '.8rem', color: 'var(--text-60)', marginBottom: '16px' }}>{selected.email} · {selected.phone}</p>
              <p style={{ fontSize: '.9rem', color: 'var(--text-80)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
              <p style={{ fontSize: '.75rem', color: 'var(--text-40)', marginTop: '16px' }}>{new Date(selected.submittedAt).toLocaleString()}</p>
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', color: 'var(--text-40)', textAlign: 'center' }}>
              Select a message to read it
            </div>
          )}
        </div>
      </div>
    </>
  )
}
