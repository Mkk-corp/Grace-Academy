'use client'

import { useState } from 'react'
import { useLang } from '@/context/LangContext'

export default function ContactForm() {
  const { t } = useLang()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.target))
    await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setLoading(false)
    setSubmitted(true)
    e.target.reset()
  }

  return (
    <form className="contact-form" id="contactForm" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>{t('labelName')}</label>
        <input name="name" className="form-input" placeholder={t('placeholderName')} required />
      </div>
      <div className="form-group">
        <label>{t('labelEmail')}</label>
        <input name="email" type="email" className="form-input" placeholder={t('placeholderEmail')} required />
      </div>
      <div className="form-group">
        <label>{t('labelPhone')}</label>
        <input name="phone" className="form-input" placeholder={t('placeholderPhone')} />
      </div>
      <div className="form-group">
        <label>{t('labelMessage')}</label>
        <textarea name="message" className="form-textarea" placeholder={t('placeholderMsg')} required />
      </div>
      <div className="form-submit">
        <button type="submit" className="btn btn--primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? '...' : t('btnSend')}
        </button>
      </div>
      {submitted && (
        <div className="form-success visible">{t('formSuccessMsg')}</div>
      )}
    </form>
  )
}
