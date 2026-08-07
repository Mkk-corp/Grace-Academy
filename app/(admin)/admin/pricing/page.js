'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import Select from '@/components/ui/Select'

const S = {
  en: {
    title: 'Pricing Plans',
    colPlan: 'Plan (EN)', colPrice: 'Price', colPopular: 'Popular', colActions: 'Actions',
    edit: 'Edit', cancel: 'Cancel', save: 'Save',
    modalTitle: (name) => `Edit ${name}`,
    fields: [
      ['Name EN',         'name.en',  'input'],
      ['Name AR',         'name.ar',  'input'],
      ['Price',           'price',    'input'],
      ['Currency',        'currency', 'input'],
      ['Description EN',  'desc.en',  'textarea'],
      ['Description AR',  'desc.ar',  'textarea'],
      ['CTA EN',          'cta.en',   'input'],
      ['CTA AR',          'cta.ar',   'input'],
    ],
    popularLabel: 'Most Popular', yes: 'Yes', no: 'No',
  },
  ar: {
    title: 'خطط الأسعار',
    colPlan: 'الخطة (إنجليزي)', colPrice: 'السعر', colPopular: 'الأكثر شيوعاً', colActions: 'الإجراءات',
    edit: 'تعديل', cancel: 'إلغاء', save: 'حفظ',
    modalTitle: (name) => `تعديل ${name}`,
    fields: [
      ['الاسم (إنجليزي)',   'name.en',  'input'],
      ['الاسم (عربي)',      'name.ar',  'input'],
      ['السعر',             'price',    'input'],
      ['العملة',            'currency', 'input'],
      ['الوصف (إنجليزي)',   'desc.en',  'textarea'],
      ['الوصف (عربي)',      'desc.ar',  'textarea'],
      ['نص الزر (إنجليزي)','cta.en',   'input'],
      ['نص الزر (عربي)',   'cta.ar',   'input'],
    ],
    popularLabel: 'الأكثر شيوعاً', yes: 'نعم', no: 'لا',
  },
}

export default function AdminPricingPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const [plans, setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetch('/api/pricing').then(r => r.json()).then(d => { setPlans(d); setLoading(false) })
  }, [])

  async function save(plan) {
    await fetch('/api/pricing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(plan) })
    const fresh = await fetch('/api/pricing').then(r => r.json())
    setPlans(fresh)
    setEditing(null)
  }

  return (
    <>
      <div className="admin-header"><h1>{s.title}</h1></div>
      <table className="admin-table">
        <thead>
          <tr><th>{s.colPlan}</th><th>{s.colPrice}</th><th>{s.colPopular}</th><th>{s.colActions}</th></tr>
        </thead>
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
              <td><button className="admin-btn" onClick={() => setEditing({ ...plan })}>{s.edit}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <PricingModal plan={editing} onSave={save} onClose={() => setEditing(null)} s={s} />}
    </>
  )
}

function PricingModal({ plan, onSave, onClose, s }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'
  const [form, setForm] = useState(plan)
  const set = (path, val) => {
    const [a, b] = path.split('.')
    setForm(f => b ? { ...f, [a]: { ...f[a], [b]: val } } : { ...f, [a]: val })
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{s.modalTitle(plan.name.en)}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {s.fields.map(([label, path, type]) => (
          <div key={path} className="admin-field">
            <label>{label}</label>
            {type === 'textarea'
              ? <textarea value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
              : <input value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
            }
          </div>
        ))}
        <div className="admin-field">
          <label>{s.popularLabel}</label>
          <Select
            value={form.popular ? 'yes' : 'no'}
            onChange={v => set('popular', v === 'yes')}
            options={[{ value: 'no', label: s.no, labelAr: s.no }, { value: 'yes', label: s.yes, labelAr: s.yes }]}
            isAr={isAr} isDark={isDark}
          />
        </div>
        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>{s.cancel}</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>{s.save}</button>
        </div>
      </div>
    </div>
  )
}
