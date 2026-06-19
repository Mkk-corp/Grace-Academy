'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminServicesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetch('/api/services').then(r => r.json()).then(d => { setItems(d); setLoading(false) }) }, [])

  async function save(item) {
    const method = item.id.startsWith('new') ? 'POST' : 'PUT'
    await fetch('/api/services', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    const fresh = await fetch('/api/services').then(r => r.json())
    setItems(fresh)
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await fetch('/api/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteTarget }) })
    setItems(prev => prev.filter(i => i.id !== deleteTarget))
    setDeleteTarget(null)
  }

  return (
    <>
      <div className="admin-header">
        <h1>Services</h1>
        <button className="admin-btn admin-btn--primary" onClick={() => setEditing({ id: `new${Date.now()}`, title: { en: '', ar: '' }, body: { en: '', ar: '' }, tag: { en: '', ar: '' }, iconSlug: '' })}>+ Add</button>
      </div>
      {!loading && items.length === 0 && (
        <EmptyState
          title="No services yet"
          description="Add your first service to showcase what Grace Academy offers."
          actionLabel="Add Service"
          onAction={() => setEditing({ id: `new${Date.now()}`, title: { en: '', ar: '' }, body: { en: '', ar: '' }, tag: { en: '', ar: '' }, iconSlug: '' })}
        />
      )}
      {(loading || items.length > 0) && (
      <table className="admin-table">
        <thead><tr><th>Title (EN)</th><th>Tag (EN)</th><th>Actions</th></tr></thead>
        <tbody>
          {loading
            ? <AdminTableSkeleton cols={3} rows={6} />
            : items.map(item => (
              <tr key={item.id}>
                <td>{item.title.en}</td>
                <td>{item.tag.en}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button className="admin-btn" onClick={() => setEditing({ ...item })}>Edit</button>
                  <button className="admin-btn admin-btn--danger" onClick={() => setDeleteTarget(item.id)}>Delete</button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      )}

      {editing && <EditModal item={editing} onSave={save} onClose={() => setEditing(null)} />}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        variant="delete"
        title="Delete service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
      />
    </>
  )
}

function EditModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item)
  const set = (path, val) => {
    const [a, b] = path.split('.')
    setForm(f => b ? { ...f, [a]: { ...f[a], [b]: val } } : { ...f, [a]: val })
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{item.id.startsWith('new') ? 'Add Service' : 'Edit Service'}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {[['Title EN', 'title.en'], ['Title AR', 'title.ar'], ['Body EN', 'body.en'], ['Body AR', 'body.ar'], ['Tag EN', 'tag.en'], ['Tag AR', 'tag.ar']].map(([label, path]) => (
          <div key={path} className="admin-field">
            <label>{label}</label>
            {path.includes('body') ? (
              <textarea value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
            ) : (
              <input value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
            )}
          </div>
        ))}
        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  )
}
