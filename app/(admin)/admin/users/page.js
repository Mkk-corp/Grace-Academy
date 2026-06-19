'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/roles').then(r => r.json()),
    ]).then(([u, r]) => {
      setUsers(u)
      setRoles(r)
      setLoading(false)
    })
  }, [])

  async function save(user) {
    const isNew = user.id.startsWith('new')
    const res = await fetch('/api/admin/users', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Save failed'); return }
    setError('')
    const fresh = await fetch('/api/admin/users').then(r => r.json())
    setUsers(fresh)
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget }),
    })
    if (!res.ok) {
      setDeleteError('Delete failed. Please try again.')
      return
    }
    setUsers(prev => prev.filter(u => u.id !== deleteTarget))
    setDeleteTarget(null)
    setDeleteError('')
  }

  function roleName(roleId) {
    return roles.find(r => r.id === roleId)?.name || '—'
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const newUser = () => setEditing({ id: `new${Date.now()}`, name: '', username: '', email: '', phone: '', password: '', roleId: '', source: 'admin' })

  return (
    <>
      <div className="admin-header">
        <h1>Users</h1>
        <button className="admin-btn admin-btn--primary" onClick={newUser}>+ Add User</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#ef4444', fontSize: '.88rem' }}>
          {error}
        </div>
      )}

      <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Source</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? <AdminTableSkeleton cols={7} rows={6} />
            : users.length === 0
              ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-40)', padding: '40px 0', fontSize: '.9rem' }}>
                    No users yet. Users who register from the website will appear here.
                  </td>
                </tr>
              )
              : users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{user.name || '—'}</div>
                    {user.username && <div style={{ fontSize: '.78rem', color: 'var(--text-60)' }}>@{user.username}</div>}
                  </td>
                  <td style={{ fontSize: '.88rem' }}>{user.email}</td>
                  <td style={{ fontSize: '.88rem', color: 'var(--text-60)' }}>{user.phone || '—'}</td>
                  <td>
                    {user.roleId
                      ? <span style={{ background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.2)', color: 'var(--gold)', borderRadius: 4, fontSize: '.78rem', padding: '2px 8px' }}>{roleName(user.roleId)}</span>
                      : <span style={{ color: 'var(--text-40)', fontSize: '.82rem' }}>Unassigned</span>
                    }
                  </td>
                  <td>
                    <span style={{
                      background: user.source === 'website' ? 'rgba(74,222,128,.1)' : 'rgba(96,165,250,.1)',
                      border: `1px solid ${user.source === 'website' ? 'rgba(74,222,128,.3)' : 'rgba(96,165,250,.3)'}`,
                      color: user.source === 'website' ? '#4ade80' : '#60a5fa',
                      borderRadius: 4, fontSize: '.75rem', padding: '2px 7px',
                    }}>
                      {user.source === 'website' ? 'Website' : 'Admin'}
                    </span>
                  </td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>{formatDate(user.createdAt)}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="admin-btn" onClick={() => setEditing({ ...user, password: '' })}>Edit</button>
                    <button className="admin-btn admin-btn--danger" onClick={() => { setDeleteTarget(user.id); setDeleteError('') }}>Delete</button>
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
      </div>

      {editing && (
        <UserModal
          user={editing}
          roles={roles}
          onSave={save}
          onClose={() => { setEditing(null); setError('') }}
        />
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError('') }}
        onConfirm={confirmDelete}
        variant="delete"
        title="Delete user"
        message={deleteError || 'Are you sure you want to delete this user? This action cannot be undone.'}
        confirmText="Delete"
      />
    </>
  )
}

function UserModal({ user, roles, onSave, onClose }) {
  const [form, setForm] = useState(user)
  const isNew = user.id.startsWith('new')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{isNew ? 'Add User' : 'Edit User'}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="admin-field">
            <label>Full Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
          </div>
          <div className="admin-field">
            <label>Username {isNew && <span style={{ color: '#ef4444' }}>*</span>}</label>
            <input value={form.username} onChange={e => set('username', e.target.value)} placeholder="username" disabled={!isNew} style={!isNew ? { opacity: .55 } : {}} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="admin-field">
            <label>Email {isNew && <span style={{ color: '#ef4444' }}>*</span>}</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="admin-field">
            <label>Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+966 5xx xxx xxxx" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="admin-field">
            <label>{isNew ? <>Password <span style={{ color: '#ef4444' }}>*</span></> : 'New Password (leave blank to keep)'}</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={isNew ? 'Password' : 'Leave blank to keep current'} />
          </div>
          <div className="admin-field">
            <label>Role</label>
            <select value={form.roleId || ''} onChange={e => set('roleId', e.target.value || null)}>
              <option value="">— No Role —</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>
            {isNew ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
