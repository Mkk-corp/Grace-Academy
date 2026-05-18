'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'

export default function AdminBlogPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(d => { setItems(d); setLoading(false) })
  }, [])

  async function save(item) {
    const method = item.id.startsWith('new') ? 'POST' : 'PUT'
    await fetch('/api/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    const fresh = await fetch('/api/blog').then(r => r.json())
    setItems(fresh)
    setEditing(null)
  }

  async function remove(id) {
    if (!confirm('Delete?')) return
    await fetch('/api/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <>
      <div className="admin-header">
        <h1>Blog Posts</h1>
        <button className="admin-btn admin-btn--primary" onClick={() => setEditing({ id: `new${Date.now()}`, title: { en: '', ar: '' }, excerpt: { en: '', ar: '' }, category: { en: '', ar: '' }, date: { en: '', ar: '' }, slug: '', published: false })}>+ Add</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Title (EN)</th><th>Category</th><th>Published</th><th>Actions</th></tr></thead>
        <tbody>
          {loading
            ? <AdminTableSkeleton cols={4} rows={6} />
            : items.map(item => (
              <tr key={item.id}>
              <td>{item.title.en}</td>
              <td>{item.category.en}</td>
              <td>
                {item.published
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" style={{color:'#4ade80'}}><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{color:'var(--text-40)'}}><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
              </td>
              <td style={{ display: 'flex', gap: '8px' }}>
                <button className="admin-btn" onClick={() => setEditing({ ...item })}>Edit</button>
                <button className="admin-btn admin-btn--danger" onClick={() => remove(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <BlogModal item={editing} onSave={save} onClose={() => setEditing(null)} />}
    </>
  )
}

function BlogModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item)
  const set = (path, val) => {
    const [a, b] = path.split('.')
    setForm(f => b ? { ...f, [a]: { ...f[a], [b]: val } } : { ...f, [a]: val })
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <h2 className="admin-modal__title">{item.id.startsWith('new') ? 'Add Post' : 'Edit Post'}</h2>
        {[['Title EN', 'title.en'], ['Title AR', 'title.ar'], ['Excerpt EN', 'excerpt.en'], ['Excerpt AR', 'excerpt.ar'], ['Category EN', 'category.en'], ['Category AR', 'category.ar'], ['Date EN', 'date.en'], ['Date AR', 'date.ar'], ['Slug', 'slug']].map(([label, path]) => (
          <div key={path} className="admin-field">
            <label>{label}</label>
            {path.includes('excerpt') ? (
              <textarea value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
            ) : (
              <input value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
            )}
          </div>
        ))}
        <div className="admin-field">
          <label>Published</label>
          <select value={form.published ? 'yes' : 'no'} onChange={e => set('published', e.target.value === 'yes')}>
            <option value="yes">Yes</option>
            <option value="no">No (Draft)</option>
          </select>
        </div>
        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  )
}
