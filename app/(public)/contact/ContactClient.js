'use client'

import { useLang } from '@/context/LangContext'
import PageHero from '@/components/sections/PageHero'
import ContactForm from '@/components/sections/ContactForm'

export default function ContactClient({ content }) {
  const { t, lang } = useLang()

  return (
    <>
      <PageHero titleKey="contactHeroTitle" subKey="contactHeroSub" breadcrumbKey="contactBreadCurrent" />

      <section className="contact-section">
        <div className="container">
          <div className="contact-layout">
            <div className="contact-form-wrap">
              <h2 className="section-title">{t('contactFormTitle')}</h2>
              <ContactForm />
            </div>

            <div className="contact-info">
              <h2 className="section-title">{t('contactInfoTitle')}</h2>

              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, labelKey: 'contactAddr', val: content.contactAddress },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, labelKey: 'contactEmailLabel', val: content.contactEmail },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5 2 2 0 0 1 3.59 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.09 6.09l1.08-1.08a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, labelKey: 'contactPhoneLabel', val: content.contactPhone },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, labelKey: 'contactHoursLabel', val: content.contactHours[lang] },
              ].map(({ icon, labelKey, val }) => (
                <div key={labelKey} className="contact-info__group">
                  <div className="contact-info__icon">{icon}</div>
                  <div className="contact-info__text">
                    <h4>{t(labelKey)}</h4>
                    <p>{val}</p>
                  </div>
                </div>
              ))}

              <div className="map-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {t('mapLabel')}
              </div>

              <p style={{ fontSize: '.85rem', color: 'var(--text-60)', marginTop: '1.5rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>{t('socialTitle')}</p>
              <div className="social-links">
                {Object.entries(content.socialLinks).map(([platform, href]) => (
                  <a key={platform} href={href} className="social-link" aria-label={platform}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
