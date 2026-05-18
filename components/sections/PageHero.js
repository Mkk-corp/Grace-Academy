'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'

export default function PageHero({ titleKey, subKey, breadcrumbKey }) {
  const { t } = useLang()
  return (
    <section className="page-hero">
      <div className="page-hero__inner">
        <div className="page-hero__breadcrumb">
          <Link href="/">{t('navHome')}</Link>
          <span>›</span>
          <span>{t(breadcrumbKey)}</span>
        </div>
        <h1
          className="page-hero__title"
          dangerouslySetInnerHTML={{ __html: t(titleKey) }}
        />
        <p className="page-hero__sub">{t(subKey)}</p>
      </div>
    </section>
  )
}
