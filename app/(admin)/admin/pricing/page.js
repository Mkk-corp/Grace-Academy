'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'

export default function AdminPricingPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => { fetch('/api/pricing').then(r => r.json()).then(d => { setPlans(d); setLoading(false) }) }, [])

  async function save(plan) {
    await fetch('/api/pricing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(plan) })
    const fresh = await fetch('/api/pricing').then(r => r.json())
    setPlans(fresh)
    setEditing(null)
  }

  return (
    <>
      <div className="admin-header"><h1>Pricing Plans</h1></div>
      <table className="admin-table">
        <thead><tr><th>Plan (EN)</th><th>Price</th><th>Popular</th><th>Actions</th></tr></thead>
        <tbody>
          {loading
            ? <AdminTableSkeleton cols={4} rows={3} />
            : plans.map(plan => (
            <tr key={plan.id}>
              <td>{plan.name.en}</td>
              <td>{plan.price} {plan.currency}</td>
              <td>
                {plan.popular
                  ? <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="16" height="16" style={{color:'var(--gold)'}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{color:'var(--text-40)'}}><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
              </td>
              <td><button className="admin-btn" onClick={() => setEditing({ ...plan })}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <PricingModal plan={editing} onSave={save} onClose={() => setEditing(null)} />}
    </>
  )
}

function PricingModal({ plan, onSave, onClose }) {
  const [form, setForm] = useState(plan)
  const set = (path, val) => {
    const [a, b] = path.split('.')
    setForm(f => b ? { ...f, [a]: { ...f[a], [b]: val } } : { ...f, [a]: val })
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <h2 className="admin-modal__title">Edit {plan.name.en}</h2>
        {[['Name EN', 'name.en'], ['Name AR', 'name.ar'], ['Price', 'price'], ['Currency', 'currency'], ['Description EN', 'desc.en'], ['Description AR', 'desc.ar'], ['CTA EN', 'cta.en'], ['CTA AR', 'cta.ar']].map(([label, path]) => (
          <div key={path} className="admin-field">
            <label>{label}</label>
            {path.includes('desc') ? (
              <textarea value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
            ) : (
              <input value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
            )}
          </div>
        ))}
        <div className="admin-field">
          <label>Most Popular</label>
          <select value={form.popular ? 'yes' : 'no'} onChange={e => set('popular', e.target.value === 'yes')}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
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
