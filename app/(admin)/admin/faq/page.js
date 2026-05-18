'use client'

import { useState, useEffect } from 'react'

export default function AdminFaqPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(() => { fetch('/api/faq').then(r => r.json()).then(setItems) }, [])

  async function save(item) {
    const method = item.id.startsWith('new') ? 'POST' : 'PUT'
    await fetch('/api/faq', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    const fresh = await fetch('/api/faq').then(r => r.json())
    setItems(fresh)
    setEditing(null)
  }

  async function remove(id) {
    if (!confirm('Delete?')) return
    await fetch('/api/faq', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <>
      <div className="admin-header">
        <h1>FAQ</h1>
        <button className="admin-btn admin-btn--primary" onClick={() => setEditing({ id: `new${Date.now()}`, question: { en: '', ar: '' }, answer: { en: '', ar: '' } })}>+ Add</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Question (EN)</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.question.en}</td>
              <td style={{ display: 'flex', gap: '8px' }}>
                <button className="admin-btn" onClick={() => setEditing({ ...item })}>Edit</button>
                <button className="admin-btn admin-btn--danger" onClick={() => remove(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <FaqModal item={editing} onSave={save} onClose={() => setEditing(null)} />
      )}
    </>
  )
}

function FaqModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item)
  const set = (path, val) => {
    const [a, b] = path.split('.')
    setForm(f => ({ ...f, [a]: { ...f[a], [b]: val } }))
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <h2 className="admin-modal__title">{item.id.startsWith('new') ? 'Add FAQ' : 'Edit FAQ'}</h2>
        {[['Question EN', 'question.en'], ['Question AR', 'question.ar'], ['Answer EN', 'answer.en'], ['Answer AR', 'answer.ar']].map(([label, path]) => (
          <div key={path} className="admin-field">
            <label>{label}</label>
            <textarea value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
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
