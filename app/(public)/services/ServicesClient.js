'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'

const SVC_ICONS = [
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  <svg key="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
]

export default function ServicesClient({ services }) {
  const { t, lang } = useLang()
  const steps = ['step1', 'step2', 'step3', 'step4']

  return (
    <>
      {/* ── Hero with CTA ── */}
      <section className="page-hero">
        <div className="page-hero__inner">
          <div className="page-hero__breadcrumb">
            <Link href="/">{t('navHome')}</Link>
            <span>›</span>
            <span>{t('servicesBreadCurrent')}</span>
          </div>
          <h1
            className="page-hero__title"
            dangerouslySetInnerHTML={{ __html: t('servicesHeroTitle') }}
          />
          <p className="page-hero__sub">{t('servicesHeroSub')}</p>
          <div style={{ marginTop: 28 }}>
            <Link href="/courses" className="btn btn--primary">
              {t('servicesHeroCta')}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginInlineStart: 8 }}>
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div data-reveal>
            <span className="label">{t('servicesLabel')}</span>
            <h2 className="section-title">{t('servicesTitle')}</h2>
          </div>
          <div className="services-grid">
            {services.map((svc, i) => (
              <div key={svc.id} className="service-card revealed" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="service-card__icon">{SVC_ICONS[i] || SVC_ICONS[0]}</div>
                <h3 className="service-card__title">{svc.title[lang]}</h3>
                <p className="service-card__body">{svc.body[lang]}</p>
                <span className="service-card__tag">{svc.tag[lang]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="container">
          <div data-reveal>
            <span className="label">{t('processLabel')}</span>
            <h2 className="section-title">{t('processTitle')}</h2>
          </div>
          <div className="process-steps">
            {steps.map((key, i) => (
              <div key={key} className="process-step revealed" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="process-step__num">{i + 1}</div>
                <h3 className="process-step__title">{t(`${key}Title`)}</h3>
                <p className="process-step__body">{t(`${key}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
