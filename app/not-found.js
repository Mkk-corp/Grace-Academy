'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'

export default function NotFound() {
  const { t } = useLang()

  return (
    <div className="error-page">
      <div className="error-page__bg" />
      <div className="error-page__bg2" />

      <div className="error-page__logo-row">
        <img src="/images/logo.png" alt="Grace Academy" className="error-page__logo" />
        <span className="error-page__brand">Grace Academy</span>
      </div>

      <div className="error-page__content">
        <div className="error-page__code">{t('error404Code')}</div>
        <div className="error-page__divider" />
        <h1 className="error-page__title">{t('error404Title')}</h1>
        <p className="error-page__body">{t('error404Body')}</p>
        <div className="error-page__actions">
          <Link href="/" className="btn btn--primary">{t('errorHome')}</Link>
          <Link href="/contact" className="btn btn--outline">{t('errorContact')}</Link>
        </div>
      </div>
    </div>
  )
}
