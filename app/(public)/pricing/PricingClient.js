'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import PageHero from '@/components/sections/PageHero'

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
)
const X_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)

export default function PricingClient({ plans }) {
  const { t, lang } = useLang()

  return (
    <>
      <PageHero titleKey="pricingHeroTitle" subKey="pricingHeroSub" breadcrumbKey="pricingBreadCurrent" />

      <section className="pricing-section">
        <div className="container">
          <div data-reveal>
            <span className="label">{t('pricingLabel')}</span>
            <h2 className="section-title section-title--center">{t('pricingTitle')}</h2>
          </div>
          <p className="pricing-note">{t('pricingNote')}</p>
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className={`pricing-card revealed${plan.popular ? ' pricing-card--popular' : ''}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {plan.badge && (
                  <div className="pricing-card__badge">{plan.badge[lang]}</div>
                )}
                <h3 className="pricing-card__plan">{plan.name[lang]}</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__currency">{plan.currency}</span>
                  <span className="pricing-card__amount">{plan.price}</span>
                  <span className="pricing-card__period">{plan.period[lang]}</span>
                </div>
                <p className="pricing-card__desc">{plan.desc[lang]}</p>
                <ul className="pricing-features">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className={`pricing-feature${feat.included ? '' : ' dim'}`}>
                      <span className="pricing-feature__icon">{feat.included ? CHECK : X_ICON}</span>
                      <span>{feat.text[lang]}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="btn btn--primary pricing-cta">
                  {plan.cta[lang]}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
