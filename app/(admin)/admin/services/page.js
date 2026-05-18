'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'

export default function AdminServicesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => { fetch('/api/services').then(r => r.json()).then(d => { setItems(d); setLoading(false) }) }, [])

  async function save(item) {
    const method = item.id.startsWith('new') ? 'POST' : 'PUT'
    await fetch('/api/services', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    const fresh = await fetch('/api/services').then(r => r.json())
    setItems(fresh)
    setEditing(null)
  }

  async function remove(id) {
    if (!confirm('Delete this service?')) return
    await fetch('/api/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <>
      <div className="admin-header">
        <h1>Services</h1>
        <button className="admin-btn admin-btn--primary" onClick={() => setEditing({ id: `new${Date.now()}`, title: { en: '', ar: '' }, body: { en: '', ar: '' }, tag: { en: '', ar: '' }, iconSlug: '' })}>+ Add</button>
      </div>
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
                  <button className="admin-btn admin-btn--danger" onClick={() => remove(item.id)}>Delete</button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {editing && <EditModal item={editing} onSave={save} onClose={() => setEditing(null)} />}
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
        <h2 className="admin-modal__title">{item.id.startsWith('new') ? 'Add Service' : 'Edit Service'}</h2>
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
