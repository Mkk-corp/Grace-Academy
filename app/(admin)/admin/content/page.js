'use client'

import { useState, useEffect } from 'react'

export default function AdminContentPage() {
  const [content, setContent] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetch('/api/content').then(r => r.json()).then(setContent) }, [])

  const set = (path, val) => {
    const [a, b] = path.split('.')
    setContent(c => b ? { ...c, [a]: { ...c[a], [b]: val } } : { ...c, [a]: val })
  }

  async function save() {
    await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fields = [
    ['Hero Subtitle EN', 'heroSubtitle.en'], ['Hero Subtitle AR', 'heroSubtitle.ar'],
    ['Manifesto EN', 'manifesto.en'], ['Manifesto AR', 'manifesto.ar'],
    ['About Lead EN', 'aboutLead.en'], ['About Lead AR', 'aboutLead.ar'],
    ['About Body EN', 'aboutBody.en'], ['About Body AR', 'aboutBody.ar'],
    ['CTA Title EN', 'ctaTitle.en'], ['CTA Title AR', 'ctaTitle.ar'],
    ['CTA Subtitle EN', 'ctaSubtitle.en'], ['CTA Subtitle AR', 'ctaSubtitle.ar'],
    ['Contact Address', 'contactAddress'],
    ['Contact Email', 'contactEmail'],
    ['Contact Phone', 'contactPhone'],
    ['Contact Hours EN', 'contactHours.en'], ['Contact Hours AR', 'contactHours.ar'],
    ['Instagram', 'socialLinks.instagram'], ['Twitter', 'socialLinks.twitter'],
    ['LinkedIn', 'socialLinks.linkedin'], ['YouTube', 'socialLinks.youtube'],
  ]

  if (!content) return (
    <>
      <div className="admin-header"><h1>Site Content</h1></div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px' }}>
        {fields.map(([label]) => (
          <div key={label} className="admin-field">
            <span className="skeleton skeleton-text--sm" style={{ width: '120px', display: 'block', marginBottom: '8px' }} />
            <span className="skeleton skeleton-field" style={{ width: '100%', display: 'block', height: '38px' }} />
          </div>
        ))}
      </div>
    </>
  )

  return (
    <>
      <div className="admin-header">
        <h1>Site Content</h1>
        <button className="admin-btn admin-btn--primary" onClick={save}>{saved ? 'Saved ✓' : 'Save Changes'}</button>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px' }}>
        {fields.map(([label, path]) => (
          <div key={path} className="admin-field">
            <label>{label}</label>
            {label.includes('Subtitle') || label.includes('Body') || label.includes('Manifesto') || label.includes('Lead') ? (
              <textarea value={path.split('.').reduce((o, k) => o[k], content) || ''} onChange={e => set(path, e.target.value)} />
            ) : (
              <input value={path.split('.').reduce((o, k) => o[k], content) || ''} onChange={e => set(path, e.target.value)} />
            )}
          </div>
        ))}
      </div>
    </>
  )
}
