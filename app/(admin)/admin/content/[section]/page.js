'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'

const SECTIONS = {
  home: {
    title: 'Home Page',
    fields: [
      ['Hero Subtitle EN', 'heroSubtitle.en', 'textarea'],
      ['Hero Subtitle AR', 'heroSubtitle.ar', 'textarea'],
      ['Manifesto EN', 'manifesto.en', 'textarea'],
      ['Manifesto AR', 'manifesto.ar', 'textarea'],
      ['About Lead EN', 'aboutLead.en', 'textarea'],
      ['About Lead AR', 'aboutLead.ar', 'textarea'],
      ['About Body EN', 'aboutBody.en', 'textarea'],
      ['About Body AR', 'aboutBody.ar', 'textarea'],
      ['CTA Title EN', 'ctaTitle.en', 'input'],
      ['CTA Title AR', 'ctaTitle.ar', 'input'],
      ['CTA Subtitle EN', 'ctaSubtitle.en', 'textarea'],
      ['CTA Subtitle AR', 'ctaSubtitle.ar', 'textarea'],
    ],
  },
  contact: {
    title: 'Contact Page',
    fields: [
      ['Address', 'contactAddress', 'input'],
      ['Email', 'contactEmail', 'input'],
      ['Phone', 'contactPhone', 'input'],
      ['Hours EN', 'contactHours.en', 'input'],
      ['Hours AR', 'contactHours.ar', 'input'],
      ['Instagram URL', 'socialLinks.instagram', 'input'],
      ['Twitter / X URL', 'socialLinks.twitter', 'input'],
      ['LinkedIn URL', 'socialLinks.linkedin', 'input'],
      ['YouTube URL', 'socialLinks.youtube', 'input'],
    ],
  },
  about:     { title: 'About Page',     redirect: '/admin/stats',    note: 'The About page pulls its stats from the Stats section and its team/mission content from translations. Use the Stats admin to update counters.' },
  services:  { title: 'Services Page',  redirect: '/admin/services', note: 'Service cards shown on this page are managed in the Services section.' },
  portfolio: { title: 'Portfolio Page', redirect: '/admin/portfolio', note: 'Case studies and success stories shown on this page are managed in the Portfolio section.' },
  blog:      { title: 'Blog Page',      redirect: '/admin/blog',     note: 'Blog posts shown on this page are managed in the Blog section.' },
  faq:       { title: 'FAQ Page',       redirect: '/admin/faq',      note: 'Frequently asked questions shown on this page are managed in the FAQ section.' },
  pricing:   { title: 'Pricing Page',   redirect: '/admin/pricing',  note: 'Pricing plans shown on this page are managed in the Pricing section.' },
}

function get(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k] ?? '', obj)
}

function set(obj, path, val) {
  const keys = path.split('.')
  if (keys.length === 1) return { ...obj, [keys[0]]: val }
  return { ...obj, [keys[0]]: { ...obj[keys[0]], [keys[1]]: val } }
}

export default function ContentSectionPage({ params }) {
  const { section } = use(params)
  const config = SECTIONS[section]
  const [content, setContent] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (config?.fields) {
      fetch('/api/content').then(r => r.json()).then(setContent)
    }
  }, [section])

  async function save() {
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!config) {
    return (
      <div className="admin-header">
        <h1>Section Not Found</h1>
      </div>
    )
  }

  if (config.redirect) {
    return (
      <>
        <div className="admin-header">
          <h1>{config.title}</h1>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '40px 32px', maxWidth: 560 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" width="22" height="22"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '.6rem', fontFamily: 'var(--font)' }}>Managed in a Dedicated Section</h3>
          <p style={{ fontSize: '.9rem', color: 'var(--text-60)', lineHeight: 1.7, marginBottom: '1.5rem', fontFamily: 'var(--font)' }}>{config.note}</p>
          <Link href={config.redirect} className="admin-btn admin-btn--primary" style={{ textDecoration: 'none' }}>
            Go to {config.title.replace(' Page', '')} Section
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </>
    )
  }

  if (!content) {
    return (
      <>
        <div className="admin-header"><h1>{config.title}</h1></div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px' }}>
          {config.fields.map(([label]) => (
            <div key={label} className="admin-field">
              <span className="skeleton skeleton-text--sm" style={{ width: 120, display: 'block', marginBottom: 8 }} />
              <span className="skeleton skeleton-field" style={{ width: '100%', display: 'block', height: 38 }} />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="admin-header">
        <h1>{config.title}</h1>
        <button className="admin-btn admin-btn--primary" onClick={save}>
          {saved
            ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> Saved</>
            : 'Save Changes'
          }
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px' }}>
        {config.fields.map(([label, path, type]) => (
          <div key={path} className="admin-field">
            <label>{label}</label>
            {type === 'textarea'
              ? <textarea value={get(content, path)} onChange={e => setContent(c => set(c, path, e.target.value))} rows={3} />
              : <input value={get(content, path)} onChange={e => setContent(c => set(c, path, e.target.value))} />
            }
          </div>
        ))}
      </div>
    </>
  )
}
