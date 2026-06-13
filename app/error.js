'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'

export default function GlobalError({ reset }) {
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
        <div className="error-page__code">{t('error500Code')}</div>
        <div className="error-page__divider" />
        <h1 className="error-page__title">{t('error500Title')}</h1>
        <p className="error-page__body">{t('error500Body')}</p>
        <div className="error-page__actions">
          <button onClick={reset} className="btn btn--primary">{t('errorTryAgain')}</button>
          <Link href="/" className="btn btn--outline">{t('errorHome')}</Link>
        </div>
      </div>
    </div>
  )
}
