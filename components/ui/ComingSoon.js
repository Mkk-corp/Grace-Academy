'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'

export default function ComingSoon({ titleKey, bodyKey, icon }) {
  const { t } = useLang()

  return (
    <section className="wip-section">
      <div className="wip-section__glow" />
      <div className="wip-section__ring" />

      <div className="wip-card">
        <div className="wip-card__icon">{icon}</div>

        <div className="wip-card__badge">
          <span className="wip-card__badge-dot" />
          {t('wipBadge')}
        </div>

        <h1 className="wip-card__title">{t(titleKey)}</h1>
        <div className="wip-card__divider" />
        <p className="wip-card__body">{t(bodyKey)}</p>

        <div className="wip-card__actions">
          <Link href="/" className="btn btn--primary">{t('wipBackHome')}</Link>
          <Link href="/contact" className="btn btn--outline">{t('wipContactCta')}</Link>
        </div>

        <p className="wip-card__sub">{t('wipSubNote')}</p>
      </div>
    </section>
  )
}
