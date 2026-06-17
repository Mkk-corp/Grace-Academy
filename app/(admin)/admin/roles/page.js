'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'

const ALL_PERMISSIONS = [
  { id: 'manage_users',     label: 'Manage Users' },
  { id: 'manage_roles',     label: 'Manage Roles' },
  { id: 'manage_content',   label: 'Manage Content' },
  { id: 'manage_blog',      label: 'Manage Blog' },
  { id: 'manage_services',  label: 'Manage Services' },
  { id: 'manage_portfolio', label: 'Manage Portfolio' },
  { id: 'manage_faq',       label: 'Manage FAQ' },
  { id: 'manage_pricing',   label: 'Manage Pricing' },
  { id: 'manage_stats',     label: 'Manage Stats' },
  { id: 'view_messages',    label: 'View Messages' },
  { id: 'access_student_portal', label: 'Access Student Portal' },
]

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/roles').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
    ]).then(([r, u]) => {
      setRoles(r)
      setUsers(u)
      setLoading(false)
    })
  }, [])

  async function save(role) {
    const isNew = role.id.startsWith('new')
    const res = await fetch('/api/admin/roles', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(role),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Save failed'); return }
    setError('')
    const fresh = await fetch('/api/admin/roles').then(r => r.json())
    setRoles(fresh)
    setEditing(null)
  }

  async function remove(id) {
    if (!confirm('Delete this role?')) return
    const res = await fetch('/api/admin/roles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Delete failed'); return }
    setRoles(prev => prev.filter(r => r.id !== id))
  }

  function usersWithRole(roleId) {
    return users.filter(u => u.roleId === roleId).length
  }

  const newRole = () => setEditing({ id: `new${Date.now()}`, name: '', description: '', permissions: [] })

  return (
    <>
      <div className="admin-header">
        <h1>Roles</h1>
        <button className="admin-btn admin-btn--primary" onClick={newRole}>+ Add Role</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#ef4444', fontSize: '.88rem' }}>
          {error}
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Role Name</th>
            <th>Description</th>
            <th>Permissions</th>
            <th>Users</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? <AdminTableSkeleton cols={5} rows={4} />
            : roles.map(role => (
              <tr key={role.id}>
                <td style={{ fontWeight: 600 }}>{role.name}</td>
                <td style={{ color: 'var(--text-60)', fontSize: '.88rem' }}>{role.description || '—'}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {role.permissions.length === 0
                      ? <span style={{ color: 'var(--text-40)', fontSize: '.82rem' }}>None</span>
                      : role.permissions.map(p => (
                        <span key={p} style={{ background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.2)', color: 'var(--gold)', borderRadius: 4, fontSize: '.75rem', padding: '2px 7px', whiteSpace: 'nowrap' }}>
                          {ALL_PERMISSIONS.find(x => x.id === p)?.label || p}
                        </span>
                      ))
                    }
                  </div>
                </td>
                <td>{usersWithRole(role.id)}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="admin-btn" onClick={() => setEditing({ ...role })}>Edit</button>
                  <button className="admin-btn admin-btn--danger" onClick={() => remove(role.id)}>Delete</button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {editing && (
        <RoleModal
          role={editing}
          onSave={save}
          onClose={() => { setEditing(null); setError('') }}
        />
      )}
    </>
  )
}

function RoleModal({ role, onSave, onClose }) {
  const [form, setForm] = useState(role)
  const isNew = role.id.startsWith('new')

  function togglePerm(id) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(id)
        ? f.permissions.filter(p => p !== id)
        : [...f.permissions, id],
    }))
  }

  function selectAll() {
    setForm(f => ({ ...f, permissions: ALL_PERMISSIONS.map(p => p.id) }))
  }

  function clearAll() {
    setForm(f => ({ ...f, permissions: [] }))
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__box" style={{ maxWidth: 560 }}>
        <h2 className="admin-modal__title">{isNew ? 'Add Role' : 'Edit Role'}</h2>

        <div className="admin-field">
          <label>Role Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Content Manager" />
        </div>

        <div className="admin-field">
          <label>Description</label>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of this role" />
        </div>

        <div className="admin-field">
          <label>
            Permissions
            <span style={{ fontWeight: 400, marginLeft: 12, fontSize: '.8rem', color: 'var(--text-60)' }}>
              <button type="button" onClick={selectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: '.8rem', padding: 0 }}>Select all</button>
              {' · '}
              <button type="button" onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-60)', fontSize: '.8rem', padding: 0 }}>Clear</button>
            </span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            {ALL_PERMISSIONS.map(({ id, label }) => (
              <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.88rem', color: 'var(--text)', fontWeight: 400 }}>
                <input
                  type="checkbox"
                  checked={form.permissions.includes(id)}
                  onChange={() => togglePerm(id)}
                  style={{ width: 15, height: 15, accentColor: 'var(--gold)', cursor: 'pointer' }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>
            {isNew ? 'Create Role' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
